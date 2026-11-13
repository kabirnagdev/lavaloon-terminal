/**
 * Single Trusted Data Layer Service (Phase 0)
 * All frontend screens, charts, and tables must read through this layer.
 * No numbers may be hardcoded inside any UI component.
 */

export interface DataSeriesPoint {
  company: string;
  ticker: string;
  metric: string;
  value: number;
  unit: string;
  currency: string;
  period: string;
  source_file: string;
  source_row: number;
}

export interface CleanCompanySummary {
  id: string;
  ticker: string;
  name: string;
  currency: string;
  unit: string;
  coverage_type: string;
  country: string;
  periods: string[];
  available_metrics: string[];
  sector: string;
  industry: string;
  risk_level: string;
  description: string;
  source_doc: string;
  source_url: string;
  risks?: string[];
  competitors?: string[];
  suppliers?: string[];
}

export interface CleanSegmentRecord {
  company: string;
  ticker: string;
  segment: string;
  value: number;
  unit: string;
  currency: string;
  period: string;
  source_file: string;
  source_row: number;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");
const API_V1 = `${API_BASE}/api/v1`;

// In-memory cache for fast, synchronous, and offline rendering
let cachedSeriesMap: Map<string, DataSeriesPoint[]> = new Map();
let cachedCompanies: CleanCompanySummary[] | null = null;

/**
 * The single trusted series function: getSeries(company, metric, periodRange)
 * Fetches time-series data strictly from the Data Layer.
 */
export async function getSeries(
  company: string,
  metric: string,
  periodRange?: [string, string]
): Promise<DataSeriesPoint[]> {
  const query = new URLSearchParams({
    company,
    metric
  });

  if (periodRange && periodRange.length === 2) {
    query.set("start_period", periodRange[0]);
    query.set("end_period", periodRange[1]);
  }

  const cacheKey = `${company.toUpperCase()}:${metric.toLowerCase()}:${periodRange ? periodRange.join("-") : "all"}`;

  try {
    const res = await fetch(`${API_V1}/data/series?${query.toString()}`, {
      cache: "no-store"
    });
    if (!res.ok) {
      throw new Error(`Data layer query failed: ${res.statusText}`);
    }
    const data: DataSeriesPoint[] = await res.json();
    cachedSeriesMap.set(cacheKey, data);
    return data;
  } catch (err) {
    // Return cached points if available
    if (cachedSeriesMap.has(cacheKey)) {
      return cachedSeriesMap.get(cacheKey)!;
    }
    console.warn(`[DataLayer] Failed to fetch series for ${company}:${metric}`, err);
    return [];
  }
}

/**
 * Returns all clean corporate summaries from the data layer.
 */
export async function getCleanCompanies(): Promise<CleanCompanySummary[]> {
  if (cachedCompanies) return cachedCompanies;
  try {
    const res = await fetch(`${API_V1}/data/companies`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load clean companies");
    const data: CleanCompanySummary[] = await res.json();
    cachedCompanies = data;
    return data;
  } catch (err) {
    console.warn("[DataLayer] Failed to load clean companies from backend", err);
    return [];
  }
}

/**
 * Returns clean business segments for a given company.
 */
export async function getCleanSegments(
  company: string,
  period?: string
): Promise<CleanSegmentRecord[]> {
  const query = new URLSearchParams({ company });
  if (period) query.set("period", period);

  try {
    const res = await fetch(`${API_V1}/data/segments?${query.toString()}`, {
      cache: "no-store"
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.warn(`[DataLayer] Failed to load segments for ${company}`, err);
    return [];
  }
}

