import os
import json
from typing import List, Optional, Dict, Any
from backend.app.schemas.company import CompanySummary, CompanyDetail, FinancialMetric, RelationshipNode
from backend.app.api.dependencies.database import AppGraphState

# Canonical registry of monitored survey avenues
ENTITY_CATALOG: Dict[str, Dict[str, Any]] = {
    "mutual-funds": {
        "ticker": "AV-MF",
        "name": "Mutual Funds Allocation Avenue",
        "sector": "Asset Management",
        "industry": "Collective Investment Vehicles",
        "risk_level": "Moderate (Market Correlated)",
        "coverage_type": "survey_investment_avenue",
        "country": "India (Survey Universe)",
        "currency": "INR",
        "fiscal_year": 2024,
        "description": "Primary vehicle in retail investor portfolio distributions. Survey evidence demonstrates strong positive lift with wealth creation objectives and diversified equity portfolios.",
        "period": "Empirical Investor Survey (N=40)",
        "metrics": [
            {
                "name": "Sample Preference Penetration",
                "value": "60.0% (Rank 1 Preference)",
                "period": "Sample Cohort",
                "reporting_date": "2024",
                "source": "Empirical Survey Distribution (Finance_data.csv)",
                "is_audited": False,
                "status": "positive"
            },
            {
                "name": "Primary Motivation",
                "value": "Better Returns (60%) / Fund Diversification (32.5%)",
                "period": "Sample Cohort",
                "reporting_date": "2024",
                "source": "Reason_Mutual Column Cross-Tabulation",
                "is_audited": False,
                "status": "positive"
            },
            {
                "name": "Statistical Association Lift",
                "value": "3.33x vs Random Chance",
                "period": "Knowledge Graph Layer",
                "reporting_date": "2024",
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
        "country": "India (Survey Universe)",
        "currency": "INR",
        "fiscal_year": 2024,
        "description": "Direct public equities participation channel. Associated with aggressive capital growth objectives and high monitoring frequencies.",
        "period": "Empirical Investor Survey (N=40)",
        "metrics": [
            {
                "name": "High Return Objective Correlation",
                "value": "72.5% Co-occurrence",
                "period": "Sample Cohort",
                "reporting_date": "2024",
                "source": "Reason_Equity Frequency Mining",
                "is_audited": False,
                "status": "positive"
            },
            {
                "name": "Monitoring Frequency",
                "value": "Daily to Weekly Active (85%)",
                "period": "Sample Cohort",
                "reporting_date": "2024",
                "source": "Invest_Monitor Cross-Tabulation",
                "is_audited": False,
                "status": "neutral"
            }
        ],
        "market_overview": {
            "primary_drivers": ["Dividend Yields", "Capital Appreciation", "Inflation Hedge"],
            "duration_profile": "1-3 Years & 3-5 Years"
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
        "country": "India (Survey Universe)",
        "currency": "INR",
        "fiscal_year": 2024,
        "description": "Safe-haven capital preservation avenue. Shows high statistical lift with capital preservation and long-term retirement objectives.",
        "period": "Empirical Investor Survey (N=40)",
        "metrics": [
            {
                "name": "Risk Averse Cohort Affinity",
                "value": "100.0% Allocation in Moderate Risk",
                "period": "Sample Cohort",
                "reporting_date": "2024",
                "source": "Empirical Cross-Tabulation",
                "is_audited": False,
                "status": "positive"
            }
        ],
        "market_overview": {
            "key_drivers": ["Assured Returns", "Safe Investment", "Tax Incentives"],
            "tenure_preference": "3-5 Years & 5+ Years"
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
        "country": "India (Survey Universe)",
        "currency": "INR",
        "fiscal_year": 2024,
        "description": "Guaranteed yield banking deposits. Strong positive association with fixed returns motivation and liquidity management.",
        "period": "Empirical Investor Survey (N=40)",
        "metrics": [
            {
                "name": "Capital Security Preference",
                "value": "Rank 1 in Capital Preservation",
                "period": "Sample Cohort",
                "reporting_date": "2024",
                "source": "Empirical Cross-Tabulation",
                "is_audited": False,
                "status": "positive"
            }
        ],
        "market_overview": {
            "primary_driver": "Fixed Guaranteed Yields",
            "regulatory_coverage": "RBI Deposit Insurance Scheme (DICGC)"
        },
        "source_attribution": "Empirical Survey Dataset: Finance_data.csv"
    }
}

# Auto-populate 10 authentic corporate filers from verified_corporate_financials.json
def _populate_corporate_entities():
    data_file = "data/corporate_financials/verified_corporate_financials.json"
    if not os.path.exists(data_file):
        return

    try:
        with open(data_file, "r") as f:
            corp_data = json.load(f)

        company_meta = {
            "AAPL": {
                "sector": "Technology",
                "industry": "Consumer Electronics & Services",
                "risk_level": "Low-to-Medium (Strong Free Cash Flow)",
                "country": "United States",
                "description": "Global enterprise leader in premium consumer computing devices, custom silicon, and recurring services ecosystem."
            },
            "MSFT": {
                "sector": "Technology",
                "industry": "Enterprise Software & Cloud Infrastructure",
                "risk_level": "Low (High Operating Margins & Enterprise Moat)",
                "country": "United States",
                "description": "Global technology provider of Azure hyperscale cloud, Microsoft 365 enterprise productivity, and developer tools."
            },
            "NVDA": {
                "sector": "Technology",
                "industry": "Semiconductors & Accelerated Computing",
                "risk_level": "High Growth / High Volatility",
                "country": "United States",
                "description": "Pioneer of GPU accelerated computing, CUDA parallel architecture, and full-stack AI data center infrastructure."
            },
            "AMZN": {
                "sector": "Consumer Discretionary",
                "industry": "E-Commerce & Hyperscale Cloud Services",
                "risk_level": "Medium (Capex Heavy / Strong Cash Flow)",
                "country": "United States",
                "description": "Global leader in online retail marketplace, fulfillment logistics, digital advertising, and Amazon Web Services (AWS)."
            },
            "TSLA": {
                "sector": "Automotive & Energy",
                "industry": "Electric Vehicles & Clean Energy Storage",
                "risk_level": "High (Beta Sensitive / Regulatory Dynamics)",
                "country": "United States",
                "description": "Vertically integrated electric vehicle designer, full self-driving AI developer, and commercial battery storage manufacturer."
            },
            "GOOGL": {
                "sector": "Communication Services",
                "industry": "Internet Search, Digital Ads & Cloud",
                "risk_level": "Low-to-Medium (Antitrust Regulatory Scrutiny)",
                "country": "United States",
                "description": "Multinational technology conglomerate operating Google Search, YouTube, Android, Google Cloud Platform, and DeepMind AI."
            },
            "RELIANCE": {
                "sector": "Energy & Conglomerate",
                "industry": "Oil-to-Chemicals, Telecom & Retail",
                "risk_level": "Medium (Capital Expenditure Heavy)",
                "country": "India",
                "description": "India's largest private enterprise by market capitalization, spanning refining, petrochemicals, Jio digital network, and Reliance Retail."
            },
            "TCS": {
                "sector": "Information Technology",
                "industry": "IT Consulting & Enterprise Digital Services",
                "risk_level": "Low (Zero Net Debt / Strong Free Cash Flow)",
                "country": "India",
                "description": "Leading global IT services, consulting, and business solutions organization and flagship technology subsidiary of Tata Group."
            },
            "INFY": {
                "sector": "Information Technology",
                "industry": "Digital Transformation & Cloud Services",
                "risk_level": "Low (High Dividend Yield & Net Cash)",
                "country": "India",
                "description": "Global leader in next-generation digital services and consulting, pioneering enterprise AI and hybrid cloud transformations."
            },
            "HDFCBANK": {
                "sector": "Financials",
                "industry": "Commercial Banking & Financial Services",
                "risk_level": "Low-to-Medium (Post-Merger Capital Scale)",
                "country": "India",
                "description": "India's largest private sector bank by total assets following its historic amalgamation with parent mortgage entity HDFC Limited."
            }
        }

        for ticker, c in corp_data.items():
            cid = ticker.lower()
            curr = c.get("currency", "USD")
            fy = c.get("fiscal_year", 2024)
            unit_prefix = "$" if curr == "USD" else "₹"
            unit_suffix = "" if curr == "USD" else " Cr"
            meta = company_meta.get(ticker, {
                "sector": "Diversified",
                "industry": "Corporate Enterprise",
                "risk_level": "Medium",
                "country": "Global",
                "description": f"Corporate reporting entity for ticker {ticker}."
            })

            raw_m = c.get("metrics", {})
            metrics_list = []

            def _fmt_val(val: Optional[float], is_pct: bool = False) -> str:
                if val is None:
                    return "N/A"
                if is_pct:
                    return f"{val:.2f}%"
                if curr == "USD":
                    return f"${val / 1e9:.2f}B"
                return f"₹{val:,.0f} Cr"

            metric_labels = [
                ("total_revenue", "Total Revenue", False, "positive"),
                ("gross_profit", "Gross Profit", False, "positive"),
                ("operating_income", "Operating Income", False, "positive"),
                ("net_income", "Net Income", False, "positive"),
                ("operating_margin_pct", "Operating Margin", True, "positive"),
                ("operating_cash_flow", "Operating Cash Flow", False, "positive"),
                ("capital_expenditure", "Capital Expenditure", False, "neutral"),
                ("free_cash_flow", "Free Cash Flow", False, "positive"),
                ("total_assets", "Total Assets", False, "positive"),
                ("total_debt", "Total Debt", False, "neutral" if raw_m.get("total_debt", 0) < raw_m.get("total_assets", 1) else "warning"),
                ("cash_and_equivalents", "Cash & Equivalents", False, "positive")
            ]

            doc_source = c.get("source_doc", "Official Audited Regulatory Filing")
            for key, label, is_pct, status in metric_labels:
                if key in raw_m and raw_m[key] is not None:
                    metrics_list.append({
                        "name": label,
                        "value": _fmt_val(raw_m[key], is_pct),
                        "period": f"FY {fy}",
                        "reporting_date": str(fy),
                        "source": doc_source,
                        "is_audited": True,
                        "status": status
                    })

            ENTITY_CATALOG[cid] = {
                "ticker": c.get("ticker", ticker),
                "name": c.get("name", f"{ticker} Inc."),
                "sector": meta["sector"],
                "industry": meta["industry"],
                "risk_level": meta["risk_level"],
                "country": meta["country"],
                "currency": curr,
                "fiscal_year": fy,
                "coverage_type": "corporate_equity",
                "description": meta["description"],
                "period": c.get("period", f"FY{fy} Audited Financials"),
                "metrics": metrics_list,
                "market_overview": {
                    "source_url": c.get("source_url", ""),
                    "currency": curr,
                    "units": c.get("units", curr),
                    "primary_competitors": c.get("competitors", []),
                    "critical_suppliers": c.get("suppliers", []),
                    "key_disclosed_risks": c.get("risks", [])[:3]
                },
                "source_attribution": doc_source,
                "segments": c.get("segments", {}),
                "competitors": c.get("competitors", []),
                "suppliers": c.get("suppliers", []),
                "risks": c.get("risks", []),
                "opportunities": c.get("opportunities", []),
                "raw_financials": raw_m
            }
    except Exception as e:
        print(f"Warning: Could not auto-populate corporate entities: {e}")

_populate_corporate_entities()


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
                coverage_type=data["coverage_type"],
                country=data.get("country", "Global"),
                currency=data.get("currency", "USD"),
                fiscal_year=data.get("fiscal_year", 2024)
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
            country=data.get("country", "Global"),
            currency=data.get("currency", "USD"),
            fiscal_year=data.get("fiscal_year", 2024),
            period=data["period"],
            metrics=[FinancialMetric(**m) for m in data["metrics"]],
            market_overview=data["market_overview"],
            source_attribution=data["source_attribution"],
            segments=data.get("segments"),
            competitors=data.get("competitors"),
            suppliers=data.get("suppliers"),
            risks=data.get("risks"),
            opportunities=data.get("opportunities"),
            raw_financials=data.get("raw_financials")
        )

    def get_relationships(self, company_id: str) -> List[RelationshipNode]:
        cid = company_id.lower().strip()
        data = ENTITY_CATALOG.get(cid)
        if not data:
            return []

        rel_nodes = []
        # 1. If corporate equity, generate structured competitor, supplier, and segment relationship nodes
        if data["coverage_type"] == "corporate_equity":
            for comp in data.get("competitors", []):
                rel_nodes.append(RelationshipNode(
                    id=f"comp_{comp.lower()}",
                    label=f"{comp} (Peer Competitor)",
                    type="competitor",
                    relation="competes_with"
                ))
            for supp in data.get("suppliers", []):
                rel_nodes.append(RelationshipNode(
                    id=f"supp_{supp.lower()}",
                    label=f"{supp} (Supply Chain Partner)",
                    type="counterparty",
                    relation="supplied_by"
                ))
            for seg, rev in (data.get("segments") or {}).items():
                rel_nodes.append(RelationshipNode(
                    id=f"seg_{seg.lower().replace(' ', '_')}",
                    label=f"{seg} Segment",
                    type="segment",
                    relation="has_business_segment"
                ))
            return rel_nodes

        # 2. If survey avenue, extract empirical graph associations from NetworkX layer A
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

        return rel_nodes
