import math
from typing import Dict, Any, List, Optional, Tuple
import networkx as nx

class PathfindingError(Exception):
    """Exception raised for pathfinding errors."""
    pass

def lift_to_distance(lift: float) -> float:
    """
    Convert a statistical Lift value into an edge distance for pathfinding.
    Higher lift denotes stronger statistical association, which corresponds to
    a smaller distance (resistance).
    Formula: distance = 1.0 / lift
    Validates that lift is strictly positive and finite.
    """
    if not isinstance(lift, (int, float)):
        raise ValueError(f"Lift must be numeric, got {type(lift)}")
    if math.isnan(lift) or math.isinf(lift):
        raise ValueError(f"Lift must be a finite number, got {lift}")
    if lift <= 0.0:
        raise ValueError(f"Lift must be strictly positive, got {lift}")
    return 1.0 / float(lift)

def annotate_distance_weights(A: nx.Graph) -> nx.Graph:
    """
    Annotate all edges in graph A with 'distance' = 1.0 / lift.
    Modifies graph in-place and returns it.
    """
    for u, v, data in A.edges(data=True):
        raw_lift = data.get("lift", 1.0)
        try:
            dist = lift_to_distance(raw_lift)
        except ValueError:
            dist = 1.0  # safe fallback if non-positive
        data["distance"] = round(dist, 4)
    return A

class GraphPathfinder:
    """Calculates weighted and unweighted shortest paths across the association graph."""

    def __init__(self, A: nx.Graph, G: nx.DiGraph):
        self.A = A
        self.G = G
        annotate_distance_weights(self.A)

    def _resolve_node(self, query: str) -> Optional[str]:
        """Resolve a user-provided label or identifier to an internal node ID in A."""
        q = query.strip().lower()
        if not q:
            return None
        # Exact ID match
        if query in self.A:
            return query
        # Exact or substring label match
        for n in self.A.nodes:
            lbl = self.G.nodes[n].get("label", "").lower()
            val = str(self.G.nodes[n].get("value", "")).lower()
            if q == lbl or q == val:
                return n
        for n in self.A.nodes:
            lbl = self.G.nodes[n].get("label", "").lower()
            if q in lbl:
                return n
        return None

    def find_path(
        self,
        source: str,
        target: str,
        algorithm: str = "weighted_inverse_lift",
        max_depth: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Find path between source and target.
        Supported algorithms:
          - 'weighted_inverse_lift': Dijkstra shortest path using distance = 1 / lift
          - 'unweighted': BFS shortest path minimizing total hops
        """
        src_node = self._resolve_node(source)
        tgt_node = self._resolve_node(target)

        if not src_node:
            return {
                "found": False,
                "path": [],
                "hops": 0,
                "edges": [],
                "total_distance": 0.0,
                "algorithm": algorithm,
                "message": f"Source entity '{source}' not found in knowledge graph."
            }

        if not tgt_node:
            return {
                "found": False,
                "path": [],
                "hops": 0,
                "edges": [],
                "total_distance": 0.0,
                "algorithm": algorithm,
                "message": f"Target entity '{target}' not found in knowledge graph."
            }

        if src_node == tgt_node:
            node_lbl = self.G.nodes[src_node].get("label", src_node)
            return {
                "found": True,
                "path": [node_lbl],
                "hops": 0,
                "edges": [],
                "total_distance": 0.0,
                "algorithm": algorithm,
                "message": "Source and target are identical."
            }

        try:
            if algorithm == "weighted_inverse_lift":
                # Ensure edge distances exist
                weight_attr = "distance"
                path_nodes = nx.shortest_path(self.A, source=src_node, target=tgt_node, weight=weight_attr)
            else:
                algorithm = "unweighted"
                path_nodes = nx.shortest_path(self.A, source=src_node, target=tgt_node)

            hops = len(path_nodes) - 1
            if max_depth is not None and hops > max_depth:
                return {
                    "found": False,
                    "path": [],
                    "hops": hops,
                    "edges": [],
                    "total_distance": 0.0,
                    "algorithm": algorithm,
                    "message": f"Shortest path exceeds maximum allowed depth of {max_depth} (found {hops} hops)."
                }

            edges_info = []
            total_dist = 0.0
            for i in range(hops):
                u, v = path_nodes[i], path_nodes[i+1]
                d = self.A[u][v]
                lift_val = float(d.get("lift", 1.0))
                dist_val = float(d.get("distance", lift_to_distance(lift_val)))
                edges_info.append({
                    "source": self.G.nodes[u].get("label", u),
                    "target": self.G.nodes[v].get("label", v),
                    "lift": round(lift_val, 2),
                    "distance": round(dist_val, 4),
                    "count": int(d.get("count", 1))
                })
                total_dist += dist_val

            return {
                "found": True,
                "path": [self.G.nodes[n].get("label", n) for n in path_nodes],
                "hops": hops,
                "edges": edges_info,
                "total_distance": round(total_dist if algorithm == "weighted_inverse_lift" else float(hops), 4),
                "algorithm": algorithm,
                "message": f"Successfully identified {algorithm} path with {hops} hops."
            }

        except nx.NetworkXNoPath:
            return {
                "found": False,
                "path": [],
                "hops": 0,
                "edges": [],
                "total_distance": 0.0,
                "algorithm": algorithm,
                "message": f"No path exists between '{source}' and '{target}'."
            }
        except Exception as e:
            return {
                "found": False,
                "path": [],
                "hops": 0,
                "edges": [],
                "total_distance": 0.0,
                "algorithm": algorithm,
                "message": f"Pathfinding calculation error: {str(e)}"
            }

