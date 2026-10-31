export interface HealthStatus {
  status: string;
  version: string;
  records_count: number;
  graph_nodes: number;
  graph_edges: number;
  association_edges: number;
  embedding_backend: string;
  llm_connected: boolean;
  neo4j_connected: boolean;
}

export interface FinancialMetric {
  name: string;
  value: string;
  period: string;
  reporting_date: string;
  source: string;
  is_audited: boolean;
  status: "positive" | "neutral" | "warning";
}

export interface CompanySummary {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  risk_level: string;
  description: string;
  coverage_type: "corporate_equity" | "survey_investment_avenue" | "benchmark_index";
}

export interface CompanyDetail extends CompanySummary {
  period: string;
  metrics: FinancialMetric[];
  market_overview: Record<string, any>;
  source_attribution: string;
}

export interface RelationshipNode {
  id: string;
  label: string;
  type: string;
  relation: string;
  lift?: number;
  observation_count?: number;
}

export interface CytoscapeNodeData {
  id: string;
  label: string;
  ntype: string;
  category: string;
  col?: string;
  value?: string;
  degree: number;
  records_count: number;
  color?: string;
}

export interface CytoscapeEdgeData {
  id: string;
  source: string;
  target: string;
  predicate: string;
  count: number;
  lift: number;
}

export interface CytoscapePayload {
  elements: {
    nodes: { data: CytoscapeNodeData }[];
    edges: { data: CytoscapeEdgeData }[];
  };
  categories: string[];
  total_nodes: number;
  total_edges: number;
}

export interface ShortestPathResponse {
  found: boolean;
  path: string[];
  edges: {
    source: string;
    target: string;
    lift: number;
    count: number;
  }[];
}

export interface ResearchQueryResponse {
  question: string;
  mode: string;
  answer: string;
  keywords: string[];
  seeds: string[];
  seed_labels: string[];
  triples: {
    s: string;
    p: string;
    o: string;
    hop: number;
    count: number;
    lift: number;
  }[];
  records: string[];
  statistics: string;
  latency_ms: number;
  grounding_confidence: "high" | "moderate" | "exploratory";
}

export interface DiligenceResponse {
  target: string;
  executive_summary: string;
  graph_associations: {
    entity: string;
    lift: number;
    co_occurrences: number;
  }[];
  triples: {
    s: string;
    p: string;
    o: string;
    hop: number;
    count: number;
    lift: number;
  }[];
  statistical_profile: string;
  records: string[];
  verified_facts: string[];
  disclaimers: string[];
}

export interface BlackScholesResponse {
  price: number;
  spot: number;
  strike: number;
  days_to_expiry: number;
  risk_free_rate: number;
  volatility: number;
  option_type: string;
  greeks: {
    delta_call: number;
    delta_put: number;
    gamma: number;
    vega: number;
    theta_call: number;
    theta_put: number;
    rho_call: number;
    rho_put: number;
  };
  intrinsic_value: number;
  time_value: number;
}

export interface OptionsChainItem {
  strike: number;
  call_price: number;
  put_price: number;
  delta_call: number;
  delta_put: number;
  gamma: number;
  vega: number;
  theta_call: number;
  theta_put: number;
}

