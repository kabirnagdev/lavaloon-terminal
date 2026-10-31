from typing import List, Dict, Any

EVALUATION_DATASET: List[Dict[str, Any]] = [
    {
        "id": "rel_01",
        "category": "relevant_domain",
        "query": "What kind of investors prefer Mutual Funds and why?",
        "expected_seed_contains": ["Mutual_Funds", "Avenue: Mutual Fund"],
        "expected_columns": ["Mutual_Funds", "Reason_Mutual"],
        "should_have_sufficient_evidence": True,
        "is_statistical": True
    },
    {
        "id": "rel_02",
        "category": "relevant_domain",
        "query": "What reasons do investors give for allocating to Government Bonds?",
        "expected_seed_contains": ["Government_Bonds", "Reason_Bonds"],
        "expected_columns": ["Government_Bonds", "Reason_Bonds"],
        "should_have_sufficient_evidence": True,
        "is_statistical": True
    },
    {
        "id": "multi_01",
        "category": "multihop_relationship",
        "query": "How are safe investment objectives linked to Fixed Deposits and PPF?",
        "expected_seed_contains": ["Fixed_Deposits", "PPF"],
        "expected_columns": ["Fixed_Deposits", "PPF", "Reason_FD"],
        "should_have_sufficient_evidence": True,
        "is_statistical": True
    },
    {
        "id": "stat_01",
        "category": "statistical_aggregation",
        "query": "How many respondents in the survey are male and what is their most popular avenue?",
        "expected_seed_contains": ["gender: Male", "gender=Male"],
        "expected_columns": ["gender", "Avenue"],
        "should_have_sufficient_evidence": True,
        "is_statistical": True
    },
    {
        "id": "ambig_01",
        "category": "ambiguous_query",
        "query": "Better returns and safe capital",
        "expected_seed_contains": ["Reason_Mutual", "Reason_Bonds", "Reason_FD"],
        "expected_columns": ["Reason_Mutual", "Reason_Bonds", "Reason_FD"],
        "should_have_sufficient_evidence": True,
        "is_statistical": False
    },
    {
        "id": "unrel_01",
        "category": "unrelated_insufficient_evidence",
        "query": "What is the orbital trajectory and velocity of the Hubble Space Telescope?",
        "expected_seed_contains": [],
        "expected_columns": [],
        "should_have_sufficient_evidence": False,
        "is_statistical": False
    },
    {
        "id": "unrel_02",
        "category": "unrelated_insufficient_evidence",
        "query": "Explain quantum entanglement in superconducting transmon qubits.",
        "expected_seed_contains": [],
        "expected_columns": [],
        "should_have_sufficient_evidence": False,
        "is_statistical": False
    }
]

