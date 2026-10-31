import {
  HealthStatus,
  CompanySummary,
  CompanyDetail,
  RelationshipNode,
  CytoscapePayload,
  ShortestPathResponse,
  ResearchQueryResponse,
  DiligenceResponse,
  BlackScholesResponse,
  OptionsChainItem
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_V1 = `${API_BASE}/api/v1`;

export const api = {
  async getHealth(): Promise<HealthStatus> {
    const res = await fetch(`${API_V1}/health`, { cache: "no-store" });
    if (!res.ok) throw new Error("Health check failed");
    return res.json();
  },

  async getCompanies(coverageType?: string): Promise<CompanySummary[]> {
    const url = coverageType
      ? `${API_V1}/companies?coverage_type=${coverageType}`
      : `${API_V1}/companies`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load companies");
    return res.json();
  },

  async getCompany(companyId: string): Promise<CompanyDetail> {
    const res = await fetch(`${API_V1}/companies/${companyId}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load company ${companyId}`);
    return res.json();
  },

  async getRelationships(companyId: string): Promise<RelationshipNode[]> {
    const res = await fetch(`${API_V1}/companies/${companyId}/relationships`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  },

  async getCytoscapeGraph(params?: {
    category?: string;
    minLift?: number;
    maxNodes?: number;
    search?: string;
  }): Promise<CytoscapePayload> {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.minLift) query.set("min_lift", params.minLift.toString());
    if (params?.maxNodes) query.set("max_nodes", params.maxNodes.toString());
    if (params?.search) query.set("search", params.search);

    const res = await fetch(`${API_V1}/graph/cytoscape?${query.toString()}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load knowledge graph elements");
    return res.json();
  },

  async findPath(source: string, target: string, maxDepth: number = 3): Promise<ShortestPathResponse> {
    const res = await fetch(`${API_V1}/graph/paths`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, target, max_depth: maxDepth })
    });
    if (!res.ok) throw new Error("Path query failed");
    return res.json();
  },

  async executeResearchQuery(payload: {
    question: string;
    hops?: number;
    mode?: "graph_rag" | "tree_of_thought" | "plain_rag";
    companyId?: string;
  }): Promise<ResearchQueryResponse> {
    const res = await fetch(`${API_V1}/research/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: payload.question,
        hops: payload.hops ?? 2,
        mode: payload.mode ?? "graph_rag",
        company_id: payload.companyId
      })
    });
    if (!res.ok) throw new Error("Research query failed");
    return res.json();
  },

  async getSuggestedQuestions(): Promise<string[]> {
    const res = await fetch(`${API_V1}/research/suggested-questions`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  },

  async analyzeDueDiligence(targetId: string, scope?: string[]): Promise<DiligenceResponse> {
    const res = await fetch(`${API_V1}/diligence/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_id: targetId, scope })
    });
    if (!res.ok) throw new Error("Due diligence analysis failed");
    return res.json();
  },

  async calculateBlackScholes(params: {
    S: number;
    K: number;
    T_days: number;
    r?: number;
    sigma?: number;
    option_type?: "call" | "put";
  }): Promise<BlackScholesResponse> {
    const res = await fetch(`${API_V1}/quant/black-scholes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error("Black-Scholes calculation failed");
    return res.json();
  },

  async getOptionsChain(params: {
    S: number;
    strikes: number[];
    T_days: number;
    r?: number;
    sigma?: number;
  }): Promise<OptionsChainItem[]> {
    const res = await fetch(`${API_V1}/quant/options-chain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error("Options chain calculation failed");
    return res.json();
  }
};

