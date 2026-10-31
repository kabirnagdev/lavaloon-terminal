import networkx as nx
from ai.ingestion.loader import slug

def kg_to_rdf(G: nx.DiGraph):
    """Serialize the NetworkX DiGraph into an RDFLib Graph in Turtle format."""
    try:
        from rdflib import Graph as RDFGraph, Namespace, Literal, URIRef, RDF, RDFS, XSD
    except ImportError:
        return None

    FIN = Namespace("http://example.org/finance/")
    g = RDFGraph()
    g.bind("fin", FIN)
    uri = {}

    for n, d in G.nodes(data=True):
        if d.get("ntype") == "Record":
            u = URIRef(f"{FIN}record/{d['row']}")
            uri[n] = u
            g.add((u, RDF.type, FIN.Record))
            g.add((u, FIN.text, Literal(d["text"])))
            for c, v in d.get("props", {}).items():
                dt = XSD.integer if isinstance(v, int) and not isinstance(v, bool) else XSD.double if isinstance(v, float) else None
                g.add((u, FIN[slug(c)], Literal(v, datatype=dt) if dt else Literal(str(v))))
        else:
            u = URIRef(f"{FIN}{slug(d.get('col', 'col'))}/{slug(d.get('value', 'val'))}")
            uri[n] = u
            g.add((u, RDF.type, FIN[slug(d.get("col", "col")).capitalize()]))
            g.add((u, RDFS.label, Literal(d.get("label", str(n)))))

    for a, b, d in G.edges(data=True):
        if a in uri and b in uri:
            pred = d.get("predicate", "related_to")
            g.add((uri[a], FIN[slug(pred)], uri[b]))

    return g

