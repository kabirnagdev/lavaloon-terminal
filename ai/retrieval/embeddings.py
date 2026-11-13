import os
from typing import List, Union
import numpy as np

EMBED_MODEL = os.getenv("EMBED_MODEL", "all-MiniLM-L6-v2")

class EmbeddingEngine:
    """Provides vector embeddings using SentenceTransformers or low-memory HashingVectorizer."""
    
    def __init__(self, model_name: str = EMBED_MODEL):
        self.model_name = model_name
        self.backend = None
        self._embedder = None
        self._hv = None
        self._init_backend()

    def _init_backend(self):
        # Auto-detect Render free tier (512MB RAM) or explicit low-memory flag
        is_low_mem = (
            os.getenv("LOW_MEMORY_MODE", "").lower() in ("true", "1", "yes")
            or os.getenv("RENDER", "").lower() in ("true", "1")
            or self.model_name.lower() in ("hashing", "fallback", "lightweight", "tfidf", "none")
        )
        if is_low_mem:
            self._init_hashing_fallback()
            return

        try:
            from sentence_transformers import SentenceTransformer
            self._embedder = SentenceTransformer(self.model_name)
            self.backend = self.model_name
        except Exception:
            self._init_hashing_fallback()

    def _init_hashing_fallback(self):
        try:
            from sklearn.feature_extraction.text import HashingVectorizer
            self._hv = HashingVectorizer(
                analyzer="char_wb",
                ngram_range=(3, 5),
                n_features=2048,
                norm="l2",
                alternate_sign=False
            )
            self.backend = "hashing-fallback"
        except Exception:
            self.backend = "hashing-fallback"

    def embed(self, texts: Union[List[str], np.ndarray]) -> np.ndarray:
        if not texts:
            dim = 384 if self._embedder else 2048
            return np.empty((0, dim))
        texts_list = list(texts)
        if self._embedder is not None:
            return self._embedder.encode(texts_list, normalize_embeddings=True, show_progress_bar=False)
        elif self._hv is not None:
            return self._hv.transform(texts_list).toarray()
        else:
            return np.zeros((len(texts_list), 2048))

# Global singleton
_engine = None

def get_embedding_engine(model_name: str = EMBED_MODEL) -> EmbeddingEngine:
    global _engine
    if _engine is None:
        _engine = EmbeddingEngine(model_name)
    return _engine

