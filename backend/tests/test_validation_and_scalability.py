"""
Automated Test Suite for Ingestion Validation & Vector Indexing.
"""

import pytest
import numpy as np
import pandas as pd
from ai.ingestion.validator import FinancialDataValidator, ValidationReport
from ai.retrieval.vector_index import (
    ExactNumpyIndex,
    FaissFlatIndex,
    FaissHNSWIndex,
    FAISS_AVAILABLE,
)


def test_validator_with_clean_data():
    df = pd.DataFrame({
        "gender": ["Male", "Female"],
        "age": [28, 45],
        "Mutual_Funds": [1, 2],
        "Objective": ["Growth", "Income"],
    })
    cleaned, report = FinancialDataValidator.validate_survey_dataframe(df)
    assert report.is_valid is True
    assert len(cleaned) == 2
    assert report.dropped_records == 0


def test_validator_detects_age_violations():
    df = pd.DataFrame({
        "gender": ["Male", "Female", "Male"],
        "age": [30, -5, 200],  # -5 and 200 invalid
        "Objective": ["Growth", "Income", "Capital"],
    })
    # Without drop
    cleaned, report = FinancialDataValidator.validate_survey_dataframe(df, drop_invalid=False)
    assert len(report.column_issues) >= 1
    assert "age" in report.column_issues[0].column.lower()
    assert len(cleaned) == 3

    # With drop
    cleaned_dropped, report_dropped = FinancialDataValidator.validate_survey_dataframe(df, drop_invalid=True)
    assert len(cleaned_dropped) == 1
    assert report_dropped.dropped_records == 2


def test_validator_detects_gender_violations():
    df = pd.DataFrame({
        "gender": ["Male", "InvalidAlienCategory"],
        "age": [25, 30],
    })
    cleaned, report = FinancialDataValidator.validate_survey_dataframe(df, drop_invalid=True)
    assert len(cleaned) == 1
    assert report.dropped_records == 1


def test_exact_numpy_vector_index():
    rng = np.random.default_rng(123)
    dim = 32
    n = 50
    vectors = rng.standard_normal((n, dim)).astype(np.float32)

    index = ExactNumpyIndex()
    index.build(vectors)
    assert index.total_vectors == n

    query = vectors[0]  # Self-search should return index 0 as top match with score ~1.0
    results = index.search(query, top_k=3)
    assert len(results) == 3
    top_idx, top_score = results[0]
    assert top_idx == 0
    assert abs(top_score - 1.0) < 1e-4


@pytest.mark.skipif(not FAISS_AVAILABLE, reason="FAISS not installed")
def test_faiss_flat_and_hnsw_indexes():
    rng = np.random.default_rng(456)
    dim = 64
    n = 200
    vectors = rng.standard_normal((n, dim)).astype(np.float32)

    # Flat Index
    flat = FaissFlatIndex(dim)
    flat.build(vectors)
    assert flat.total_vectors == n
    flat_res = flat.search(vectors[10], top_k=3)
    assert flat_res[0][0] == 10
    assert abs(flat_res[0][1] - 1.0) < 1e-4

    # HNSW Index
    hnsw = FaissHNSWIndex(dim, m=16, ef_search=32)
    hnsw.build(vectors)
    assert hnsw.total_vectors == n
    hnsw_res = hnsw.search(vectors[10], top_k=3)
    assert hnsw_res[0][0] == 10
    assert abs(hnsw_res[0][1] - 1.0) < 1e-4

