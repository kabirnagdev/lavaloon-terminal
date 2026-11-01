from typing import Dict, Any, List, Optional
import networkx as nx
from backend.app.schemas.graph import CytoscapePayload, ShortestPathResponse, PathEdge
from backend.app.api.dependencies.database import AppGraphState
from ai.graph.pathfinder import GraphPathfinder

CATEGORY_COLORS = {
    "Avenue": "#00e5ff",            # Cyan
    "Investment_Avenues": "#38bdf8",# Light Blue
    "Mutual_Funds": "#22c55e",      # Green
    "Equity_Market": "#eab308",     # Amber
    "Government_Bonds": "#a855f7",  # Purple
    "Fixed_Deposits": "#f97316",    # Orange
    "PPF": "#ec4899",               # Pink
    "Gold": "#ffd700",              # Gold
    "Stock_Marktet": "#64748b",     # Slate
    "Objective": "#14b8a6",         # Teal
    "Purpose": "#06b6d4",           # Cyan
    "Duration": "#8b5cf6",          # Violet
    "Factor": "#f43f5e",            # Rose
    "Reason_Mutual": "#10b981",     # Emerald
    "Reason_Equity": "#f59e0b",     # Amber
    "Reason_Bonds": "#8b5cf6",      # Violet
    "Reason_FD": "#fb923c",         # Orange
    "gender": "#6366f1",            # Indigo
    "age": "#94a3b8"                # Slate
}

class GraphService:
    def __init__(self, state: AppGraphState):
        self.state = state

    def get_cytoscape_elements(
        self,
        category: Optional[str] = None,
        min_lift: float = 1.5,
        max_nodes: int = 120,
        search_query: Optional[str] = None
    ) -> CytoscapePayload:
        """Produce Cytoscape.js compatible nodes and edges with degree and visual styling metadata."""
        G = self.state.G
        A = self.state.A

        if G is None or A is None:
            return CytoscapePayload(
                elements={"nodes": [], "edges": []},
                categories=[],
                total_nodes=0,
                total_edges=0
            )

        # Select top nodes by degree from association graph A
        degrees = dict(A.degree())
        all_entity_nodes = [n for n, d in G.nodes(data=True) if d.get("ntype") == "Entity"]

        # Filter by category
        if category and category != "all":
            all_entity_nodes = [n for n in all_entity_nodes if G.nodes[n].get("col") == category]

        # Filter by search
        if search_query:
            sq = search_query.lower()
            all_entity_nodes = [
                n for n in all_entity_nodes
                if sq in G.nodes[n].get("label", "").lower() or sq in G.nodes[n].get("value", "").lower()
            ]

        # Sort by degree in A
        sorted_nodes = sorted(all_entity_nodes, key=lambda n: -degrees.get(n, 0))[:max_nodes]
        node_set = set(sorted_nodes)

        nodes = []
        categories_found = set()

        for n in sorted_nodes:
            d = G.nodes[n]
            col = d.get("col", "General")
            categories_found.add(col)

            # In-degree of records connected to this entity
            rec_count = sum(1 for u, _ in G.in_edges(n) if G.nodes[u].get("ntype") == "Record")

            nodes.append({
                "data": {
                    "id": n,
                    "label": d.get("label", n),
                    "ntype": d.get("ntype", "Entity"),
                    "category": col,
                    "col": col,
                    "value": d.get("value", ""),
                    "degree": degrees.get(n, 0),
                    "records_count": rec_count,
                    "color": CATEGORY_COLORS.get(col, "#94a3b8")
                }
            })

        edges = []
        edge_id = 0
        seen_pairs = set()

        # Add association edges between selected nodes
        for u, v, d in A.edges(data=True):
            if u in node_set and v in node_set:
                lift = float(d.get("lift", 1.0))
                if lift >= min_lift:
                    pair_key = frozenset((u, v))
                    if pair_key in seen_pairs:
                        continue
                    seen_pairs.add(pair_key)
                    edge_id += 1
                    edges.append({
                        "data": {
                            "id": f"e{edge_id}",
                            "source": u,
                            "target": v,
                            "predicate": "associated_with",
                            "count": int(d.get("count", 1)),
                            "lift": round(lift, 2)
                        }
                    })

        return CytoscapePayload(
            elements={"nodes": nodes, "edges": edges},
            categories=sorted(list(categories_found)),
            total_nodes=len(nodes),
            total_edges=len(edges)
        )

    def find_shortest_path(
        self,
        source: str,
        target: str,
        max_depth: Optional[int] = 3,
        algorithm: str = "unweighted"
    ) -> ShortestPathResponse:
        """Find path between two entity nodes using weighted or unweighted algorithm."""
        A = self.state.A
        G = self.state.G
        if not A or not G:
            return ShortestPathResponse(
                found=False,
                path=[],
                hops=0,
                edges=[],
                total_distance=0.0,
                algorithm=algorithm,
                message="Knowledge graph is uninitialized."
            )

        pathfinder = GraphPathfinder(A, G)
        res = pathfinder.find_path(
            source=source,
            target=target,
            algorithm=algorithm,
            max_depth=max_depth
        )
        return ShortestPathResponse(
            found=res["found"],
            path=res["path"],
            hops=res["hops"],
            edges=[PathEdge(**e) for e in res["edges"]],
            total_distance=res["total_distance"],
            algorithm=res["algorithm"],
            message=res.get("message")
        )

