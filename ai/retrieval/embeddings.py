import os
from typing import List, Union
import numpy as np

EMBED_MODEL = os.getenv("EMBED_MODEL", "all-MiniLM-L6-v2")

class EmbeddingEngine:
    """Provides vector embeddings using SentenceTransformers or fallback HashingVectorizer."""
    
    def __init__(self, model_name: str = EMBED_MODEL):
        self.model_name = model_name
        self.backend = None
        self._embedder = None
        self._hv = None
        self._init_backend()

    def _init_backend(self):
        try:
            from sentence_transformers import SentenceTransformer
            self._embedder = SentenceTransformer(self.model_name)
            self.backend = self.model_name
        except Exception as e:
            from sklearn.feature_extraction.text import HashingVectorizer
            self._hv = HashingVectorizer(
                analyzer="char_wb",
                ngram_range=(3, 5),
                n_features=4096,
                norm="l2",
                alternate_sign=False
            )
            self.backend = "hashing-fallback"

    def embed(self, texts: Union[List[str], np.ndarray]) -> np.ndarray:
        if not texts:
            return np.empty((0, 384 if self._embedder else 4096))
        texts_list = list(texts)
        if self._embedder is not None:
            return self._embedder.encode(texts_list, normalize_embeddings=True, show_progress_bar=False)
        else:
            return self._hv.transform(texts_list).toarray()

# Global singleton
_engine = None

def get_embedding_engine(model_name: str = EMBED_MODEL) -> EmbeddingEngine:
    global _engine
    if _engine is None:
        _engine = EmbeddingEngine(model_name)
    return _engine

