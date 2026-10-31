from typing import Dict, Any, Tuple
import numpy as np
from ai.retrieval.retriever import HybridGraphRetriever
from ai.reasoning.groq_client import GroqLLMClient

class ResearchCopilot:
    """Provides high-level question answering using GraphRAG, Tree-of-Thought, and Plain RAG."""

    def __init__(self, retriever: HybridGraphRetriever, llm_client: GroqLLMClient):
        self.retriever = retriever
        self.llm_client = llm_client

    def ask(self, question: str, hops: int = 2) -> Tuple[str, Dict[str, Any]]:
        """Standard GraphRAG query execution."""
        r = self.retriever.retrieve(question, hops=hops)
        prompt = self.retriever.build_prompt(question, r)
        answer = self.llm_client.generate(prompt)
        return answer, r

    def ask_tot(self, question: str, hops: int = 2) -> Tuple[str, Dict[str, Any]]:
        """Tree-of-Thought multi-step reasoning."""
        r = self.retriever.retrieve(question, hops=hops)
        ctx = self.retriever.format_context(r)

        t1_prompt = (
            f"Generate a short list of initial thoughts relevant for answering this question: '{question}'. "
            f"Use the context. Do not answer the question directly yet.\n\n{ctx}"
        )
        t1 = self.llm_client.generate(t1_prompt, temperature=0.7)

        t2_prompt = f"Read this: '{t1}'. List the most critical financial concepts and empirical facts to answer '{question}'."
        t2 = self.llm_client.generate(t2_prompt, temperature=0.2)

        ans_prompt = self.retriever.build_prompt(question, r, extra=f"\nKEY CONCEPTS TO COVER:\n{t2}\n")
        answer = self.llm_client.generate(ans_prompt)
        return answer, r

    def plain_rag(self, question: str, k: int = 8) -> str:
        """Baseline vector-only RAG retrieval without graph traversal or exact statistics."""
        qv = self.retriever.embedder.embed([question])[0]
        sims = self.retriever.rec_vecs @ qv
        top_k_indices = np.argsort(-sims)[:k]
        ctx = "\n".join(f"- {self.retriever.G.nodes[self.retriever.rec_ids[i]]['text']}" for i in top_k_indices)
        prompt = f"Answer using only these records. If insufficient, say so.\n{ctx}\n\nQuestion: {question}\nAnswer:"
        return self.llm_client.generate(prompt)

