import os
from typing import Optional
import pandas as pd
import networkx as nx

from ai.ingestion.loader import load_financial_data
from ai.graph.builder import build_kg
from ai.retrieval.embeddings import get_embedding_engine, EmbeddingEngine
from ai.reasoning.groq_client import get_groq_client, GroqLLMClient
from ai.retrieval.retriever import HybridGraphRetriever
from ai.reasoning.copilot import ResearchCopilot
from ai.pipelines.diligence_pipeline import DueDiligencePipeline
from ai.adapters.neo4j_adapter import Neo4jAdapter
from backend.app.core.config import settings
from backend.app.core.logging import logger

class AppGraphState:
    """Singleton application state holding the Knowledge Graph, Retriever, and LLM instances."""

    def __init__(self):
        self.df: Optional[pd.DataFrame] = None
        self.G: Optional[nx.DiGraph] = None
        self.A: Optional[nx.Graph] = None
        self.ent_cols = []
        self.prop_cols = []
        self.embedder: Optional[EmbeddingEngine] = None
        self.llm_client: Optional[GroqLLMClient] = None
        self.retriever: Optional[HybridGraphRetriever] = None
        self.copilot: Optional[ResearchCopilot] = None
        self.diligence_pipeline: Optional[DueDiligencePipeline] = None
        self.neo4j_adapter: Optional[Neo4jAdapter] = None
        self.active_backend: str = "NETWORKX"

    def initialize(self):
        logger.info("Initializing Financial Intelligence Knowledge Graph...")
        self.df = load_financial_data(settings.DATA_CSV_PATH)
        self.G, self.A, self.ent_cols, self.prop_cols = build_kg(self.df)
        logger.info(f"Graph constructed: {self.G.number_of_nodes()} nodes, {self.G.number_of_edges()} edges")

        self.embedder = get_embedding_engine(settings.EMBED_MODEL)
        self.llm_client = get_groq_client(settings.GROQ_API_KEY)
        self.retriever = HybridGraphRetriever(
            self.df, self.G, self.A, self.embedder, self.llm_client
        )
        self.copilot = ResearchCopilot(self.retriever, self.llm_client)
        self.diligence_pipeline = DueDiligencePipeline(self.retriever, self.llm_client)

        # Enterprise Neo4j Adapter Configuration & Backend Selection
        if settings.GRAPH_BACKEND.upper() == "NEO4J" or (settings.NEO4J_URI and settings.NEO4J_PASSWORD):
            self.neo4j_adapter = Neo4jAdapter(
                uri=settings.NEO4J_URI,
                user=settings.NEO4J_USER,
                password=settings.NEO4J_PASSWORD
            )
            if self.neo4j_adapter.is_connected:
                logger.info("Connected to enterprise Neo4j instance. Synchronizing knowledge graph...")
                sync_res = self.neo4j_adapter.sync_from_networkx(self.G)
                logger.info(f"Neo4j sync complete: {sync_res}")
                self.active_backend = "NEO4J"
            else:
                logger.warning("Neo4j backend selected/configured, but connection could not be established; falling back cleanly to in-memory NetworkX engine.")
                self.active_backend = "NETWORKX (Fallback from NEO4J)"
        else:
            self.neo4j_adapter = Neo4jAdapter()
            self.active_backend = "NETWORKX"

state = AppGraphState()

def get_graph_state() -> AppGraphState:
    if state.G is None:
        state.initialize()
    return state

