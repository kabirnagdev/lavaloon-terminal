from typing import List, Optional, Dict, Any
from backend.app.schemas.company import CompanySummary, CompanyDetail, FinancialMetric, RelationshipNode
from backend.app.api.dependencies.database import AppGraphState

# Canonical registry of monitored entities, avenues, and benchmarks
ENTITY_CATALOG: Dict[str, Dict[str, Any]] = {
    "mutual-funds": {
        "ticker": "AV-MF",
        "name": "Mutual Funds Allocation Avenue",
        "sector": "Asset Management",
        "industry": "Collective Investment Vehicles",
        "risk_level": "Moderate (Market Correlated)",
        "coverage_type": "survey_investment_avenue",
        "description": "Primary vehicle in retail investor portfolio distributions. Survey evidence demonstrates strong positive lift with wealth creation objectives and diversified equity portfolios.",
        "period": "FY 2025/2026 Sample Profile",
        "metrics": [
            {
                "name": "Sample Preference Penetration",
                "value": "60.0% (Rank 1 Preference)",
                "period": "Sample Cohort",
                "reporting_date": "2026-10",
                "source": "Empirical Survey Distribution (Finance_data.csv)",
                "is_audited": False,
                "status": "positive"
            },
            {
                "name": "Primary Investor Motivation",
                "value": "Better Returns (60%) / Diversification (32.5%)",
                "period": "Sample Cohort",
                "reporting_date": "2026-10",
                "source": "Reason_Mutual Column Cross-Tabulation",
                "is_audited": False,
                "status": "positive"
            },
            {
                "name": "Statistical Association Lift",
                "value": "3.33x vs Random Chance",
                "period": "Knowledge Graph Layer",
                "reporting_date": "2026-10",
                "source": "NetworkX Lift Association (n=24)",
                "is_audited": False,
                "status": "positive"
            }
        ],
        "market_overview": {
            "top_correlated_factors": ["Wealth Creation", "Capital Appreciation", "Equity Exposure"],
            "demographic_core": "Age 25-35 Tech/Corporate Professionals",
            "regulatory_status": "Monitored Retail Investment Vehicle"
        },
        "source_attribution": "Empirical Survey Dataset: Finance_data.csv"
    },
    "equity-market": {
        "ticker": "AV-EQ",
        "name": "Equity Direct Market Avenue",
        "sector": "Capital Markets",
        "industry": "Direct Listed Equities",
        "risk_level": "High (Beta Sensitive)",
        "coverage_type": "survey_investment_avenue",
        "description": "Direct public equities participation channel. Associated with aggressive capital growth objectives and high monitoring frequencies.",
        "period": "FY 2025/2026 Sample Profile",
        "metrics": [
            {
                "name": "High Return Objective Correlation",
                "value": "72.5% Co-occurrence",
                "period": "Sample Cohort",
                "reporting_date": "2026-10",
                "source": "Reason_Equity Frequency Mining",
                "is_audited": False,
                "status": "positive"
            },
            {
                "name": "Monitoring Frequency",
                "value": "Daily to Weekly Active (85%)",
                "period": "Sample Cohort",
                "reporting_date": "2026-10",
                "source": "Invest_Monitor Cross-Tabulation",
                "is_audited": False,
                "status": "neutral"
            },
            {
                "name": "Risk Perception Factor",
                "value": "Capital Loss & Volatility Risk",
                "period": "Sample Cohort",
                "reporting_date": "2026-10",
                "source": "Factor Feature Mapping",
                "is_audited": False,
                "status": "warning"
            }
        ],
        "market_overview": {
            "top_correlated_factors": ["High Dividend", "Short-to-Medium Horizon", "Active Trading"],
            "demographic_core": "Active Retail & High Net Worth Respondents",
            "regulatory_status": "Exchange Traded Securities"
        },
        "source_attribution": "Empirical Survey Dataset: Finance_data.csv"
    },
    "government-bonds": {
        "ticker": "AV-BND",
        "name": "Government Sovereign Bonds & PPF",
        "sector": "Fixed Income",
        "industry": "Sovereign Debt & Provident Funds",
        "risk_level": "Minimal (Sovereign Guaranteed)",
        "coverage_type": "survey_investment_avenue",
        "description": "Safe-haven capital preservation avenue. Shows high statistical lift with capital preservation and long-term retirement objectives.",
        "period": "FY 2025/2026 Sample Profile",
        "metrics": [
            {
                "name": "Safety Rationale Lift",
                "value": "3.43x Lift with Capital Safety",
                "period": "Sample Cohort",
                "reporting_date": "2026-10",
                "source": "NetworkX Association Graph",
                "is_audited": False,
                "status": "positive"
            },
            {
                "name": "Horizon Duration",
                "value": "> 5 Years Horizon (>75%)",
                "period": "Sample Cohort",
                "reporting_date": "2026-10",
                "source": "Duration Feature Cross-Tabulation",
                "is_audited": False,
                "status": "positive"
            }
        ],
        "market_overview": {
            "top_correlated_factors": ["PPF Integration", "Tax Shielding", "Zero Default Risk"],
            "demographic_core": "Conservative & Retirement-Oriented Investors",
            "regulatory_status": "Sovereign Treasury / Statutory Mechanism"
        },
        "source_attribution": "Empirical Survey Dataset: Finance_data.csv"
    },
    "fixed-deposits": {
        "ticker": "AV-FD",
        "name": "Commercial Bank Fixed Deposits",
        "sector": "Banking",
        "industry": "Term Deposit Accounts",
        "risk_level": "Low (Deposit Insurance Protected)",
        "coverage_type": "survey_investment_avenue",
        "description": "Guaranteed yield banking deposits. Strong positive association with fixed returns motivation and liquidity management.",
        "period": "FY 2025/2026 Sample Profile",
        "metrics": [
            {
                "name": "Fixed Return Motivator",
                "value": "Fixed Returns / Risk Aversion",
                "period": "Sample Cohort",
                "reporting_date": "2026-10",
                "source": "Reason_FD Distribution Analysis",
                "is_audited": False,
                "status": "positive"
            },
            {
                "name": "PPF Co-occurrence Lift",
                "value": "3.33x Association Lift",
                "period": "Knowledge Graph",
                "reporting_date": "2026-10",
                "source": "Pair Association Mining (n=4)",
                "is_audited": False,
                "status": "positive"
            }
        ],
        "market_overview": {
            "top_correlated_factors": ["Predictable Cashflow", "Emergency Liquidity"],
            "demographic_core": "Broad Demographics across Age 30+",
            "regulatory_status": "Central Banking Regulated"
        },
        "source_attribution": "Empirical Survey Dataset: Finance_data.csv"
    },
    "nvda": {
        "ticker": "NVDA",
        "name": "NVIDIA Corporation (Benchmark)",
        "sector": "Technology",
        "industry": "Semiconductors & Accelerated Computing",
        "risk_level": "High Growth / High Volatility",
        "coverage_type": "corporate_equity",
        "description": "Global enterprise leader in accelerated computing and AI infrastructure architecture. Profile provided as institutional equity benchmark for risk and options derivatives evaluation.",
        "period": "FY 2025 Form 10-K",
        "metrics": [
            {
                "name": "Annual Revenue (FY25)",
                "value": "$126.0B (+114% YoY)",
                "period": "FY 2025",
                "reporting_date": "2025-01-26",
                "source": "SEC Form 10-K Audited Filing",
                "is_audited": True,
                "status": "positive"
            },
            {
                "name": "GAAP Operating Margin",
                "value": "62.4%",
                "period": "FY 2025",
                "reporting_date": "2025-01-26",
                "source": "SEC Form 10-K Audited Filing",
                "is_audited": True,
                "status": "positive"
            },
            {
                "name": "Annual Net Income",
                "value": "$68.7B",
                "period": "FY 2025",
                "reporting_date": "2025-01-26",
                "source": "SEC Form 10-K Audited Filing",
                "is_audited": True,
                "status": "positive"
            },
            {
                "name": "30-Day Implied Volatility (IV)",
                "value": "44.2%",
                "period": "Market Spot",
                "reporting_date": "2026-10",
                "source": "Quantitative Derivatives Desk (Black-Scholes Engine)",
                "is_audited": False,
                "status": "warning"
            }
        ],
        "market_overview": {
            "datacenter_revenue_share": "87%",
            "supply_chain_dependencies": ["TSMC (Foundry)", "SK Hynix (HBM3e)", "Foxconn (Assembly)"],
            "antitrust_exposure": "Department of Justice & EU Competition Inquiries"
        },
        "source_attribution": "SEC Audited 10-K Filings & Options Desk Pricing"
    },
    "aapl": {
        "ticker": "AAPL",
        "name": "Apple Inc. (Benchmark)",
        "sector": "Technology",
        "industry": "Consumer Electronics & Services",
        "risk_level": "Low-to-Medium (Strong Free Cash Flow)",
        "coverage_type": "corporate_equity",
        "description": "Global enterprise leader in premium consumer computing devices, custom silicon, and recurring services ecosystem.",
        "period": "FY 2024 Form 10-K",
        "metrics": [
            {
                "name": "Annual Revenue",
                "value": "$391.0B",
                "period": "FY 2024",
                "reporting_date": "2024-09-28",
                "source": "SEC Form 10-K Audited Filing",
                "is_audited": True,
                "status": "positive"
            },
            {
                "name": "Annual Operating Cash Flow",
                "value": "$118.2B",
                "period": "FY 2024",
                "reporting_date": "2024-09-28",
                "source": "SEC Form 10-K Audited Filing",
                "is_audited": True,
                "status": "positive"
            },
            {
                "name": "Gross Margin",
                "value": "46.2%",
                "period": "FY 2024",
                "reporting_date": "2024-09-28",
                "source": "SEC Form 10-K Audited Filing",
                "is_audited": True,
                "status": "positive"
            }
        ],
        "market_overview": {
            "services_segment_growth": "+12.8% YoY",
            "active_installed_base": "> 2.2 Billion Devices",
            "regulatory_exposure": "EU Digital Markets Act (DMA) compliance"
        },
        "source_attribution": "SEC Audited 10-K Filings"
    }
}

class CompanyService:
    def __init__(self, state: AppGraphState):
        self.state = state

    def list_companies(self, coverage_type: Optional[str] = None) -> List[CompanySummary]:
        res = []
        for cid, data in ENTITY_CATALOG.items():
            if coverage_type and data["coverage_type"] != coverage_type:
                continue
            res.append(CompanySummary(
                id=cid,
                ticker=data["ticker"],
                name=data["name"],
                sector=data["sector"],
                industry=data["industry"],
                risk_level=data["risk_level"],
                description=data["description"],
                coverage_type=data["coverage_type"]
            ))
        return res

    def get_company(self, company_id: str) -> Optional[CompanyDetail]:
        cid = company_id.lower().strip()
        data = ENTITY_CATALOG.get(cid)
        if not data:
            return None
        return CompanyDetail(
            id=cid,
            ticker=data["ticker"],
            name=data["name"],
            sector=data["sector"],
            industry=data["industry"],
            risk_level=data["risk_level"],
            description=data["description"],
            coverage_type=data["coverage_type"],
            period=data["period"],
            metrics=[FinancialMetric(**m) for m in data["metrics"]],
            market_overview=data["market_overview"],
            source_attribution=data["source_attribution"]
        )

    def get_relationships(self, company_id: str) -> List[RelationshipNode]:
        cid = company_id.lower().strip()
        data = ENTITY_CATALOG.get(cid)
        if not data:
            return []

        rel_nodes = []
        # If avenue, extract real graph associations
        name_tokens = data["name"].split()
        ent_ids = self.state.retriever.ent_ids if self.state.retriever else []
        for tok in name_tokens:
            matched_nodes = [
                n for n in ent_ids
                if tok.lower() in self.state.G.nodes[n].get("label", "").lower()
            ]
            if matched_nodes:
                seed = matched_nodes[0]
                if seed in self.state.A:
                    for nb in list(self.state.A.neighbors(seed))[:8]:
                        edge = self.state.A[seed][nb]
                        rel_nodes.append(RelationshipNode(
                            id=nb,
                            label=self.state.G.nodes[nb]["label"],
                            type="survey_association",
                            relation="associated_with",
                            lift=round(float(edge.get("lift", 1.0)), 2),
                            observation_count=int(edge.get("count", 1))
                        ))
                break

        # If corporate benchmark, supply supply-chain & competition ties
        if not rel_nodes and data["coverage_type"] == "corporate_equity":
            if cid == "nvda":
                rel_nodes = [
                    RelationshipNode(id="tsmc", label="TSMC (Foundry Supplier)", type="counterparty", relation="exclusive_subcontractor"),
                    RelationshipNode(id="sk_hynix", label="SK Hynix (HBM Memory)", type="counterparty", relation="critical_component"),
                    RelationshipNode(id="msft", label="Microsoft (Hyperscale Customer)", type="customer", relation="major_cloud_buyer"),
                    RelationshipNode(id="amd", label="AMD (Competitor)", type="competitor", relation="competes_in_accelerators")
                ]
            elif cid == "aapl":
                rel_nodes = [
                    RelationshipNode(id="tsmc", label="TSMC (Silicon Foundry)", type="counterparty", relation="primary_wafer_supplier"),
                    RelationshipNode(id="foxconn", label="Foxconn (Assembly)", type="counterparty", relation="primary_oem_assembler"),
                    RelationshipNode(id="googl", label="Alphabet / Google (Services Partner)", type="counterparty", relation="default_search_agreement")
                ]
        return rel_nodes

