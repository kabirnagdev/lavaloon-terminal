import itertools
from collections import Counter
from typing import Tuple, List, Dict, Any
import numpy as np
import pandas as pd
import networkx as nx

from ai.ingestion.loader import is_entity_col, py, row_to_text, MAX_ENTITY_VALUES

MIN_LIFT = 1.5
MAX_ASSOC_EDGES = 400

def build_kg(
    df: pd.DataFrame,
    min_lift: float = MIN_LIFT,
    max_assoc_edges: int = MAX_ASSOC_EDGES
) -> Tuple[nx.DiGraph, nx.Graph, List[str], List[str]]:
    """
    Build the Knowledge Graph and association layer from dataframe.
    Returns:
        G: Directed knowledge graph containing Record and Entity nodes
        A: Undirected association layer containing co-occurrence lift edges
        ent_cols: List of categorical entity columns
        prop_cols: List of continuous/property columns
    """
    G, N = nx.DiGraph(), len(df)
    ent_cols = [c for c in df.columns if is_entity_col(df[c])]
    prop_cols = [c for c in df.columns if c not in ent_cols]
    rec_entities = {}

    for i, row in df.iterrows():
        rid = f"record:{i}"
        G.add_node(
            rid,
            ntype="Record",
            row=i,
            label=f"Record {i}",
            text=row_to_text(i, row),
            props={c: py(row[c]) for c in prop_cols if pd.notna(row[c])}
        )
        ents = set()
        for c in ent_cols:
            v = row[c]
            if pd.isna(v):
                continue
            eid = f"{c}={v}"
            if eid not in G:
                G.add_node(eid, ntype="Entity", col=c, value=str(v), label=f"{c}: {v}")
            G.add_edge(rid, eid, predicate=c)
            ents.add(eid)
        rec_entities[rid] = ents

    node_cnt, pair_cnt = Counter(), Counter()
    for ents in rec_entities.values():
        node_cnt.update(ents)
        for a, b in itertools.combinations(sorted(ents), 2):
            if G.nodes[a]["col"] != G.nodes[b]["col"]:
                pair_cnt[(a, b)] += 1

    min_co = max(3, int(0.05 * N))
    cands = []
    for (a, b), co in pair_cnt.items():
        lift = co * N / (node_cnt[a] * node_cnt[b])
        if co >= min_co and lift >= min_lift:
            cands.append((lift * np.log1p(co), a, b, co, lift))
    cands.sort(reverse=True)

    A = nx.Graph()  # entity-only association layer used for hop expansion
    for _, a, b, co, lift in cands[:max_assoc_edges]:
        G.add_edge(a, b, predicate="associated_with", count=co, lift=round(lift, 2))
        A.add_edge(a, b, count=co, lift=lift)

    return G, A, ent_cols, prop_cols

