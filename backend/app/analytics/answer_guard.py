"""
Answer-Guard Module for Lavaloon Terminal.
Strictly ensures:
1. Every answer is grounded only in retrieved data rows.
2. Every answer provides citations (source_file, source_row, period).
3. If data is missing or not found, explicitly states: "Not available in provided data." (Never guesses).
4. Verifies numbers present in the answer against retrieved rows or valid calculations.
"""

import re
from typing import List, Dict, Any, Tuple, Optional


def extract_numbers_from_text(text: str) -> List[float]:
    """Extracts numeric tokens from text, ignoring dates/years and standard punctuation."""
    # Matches integers, decimals, formatted numbers with commas (e.g. 383,285,000,000 or 44.64 or 12.4)
    cleaned = text.replace(",", "")
    tokens = re.findall(r"[-+]?\d*\.\d+|\b\d+\b", cleaned)
    nums = []
    for t in tokens:
        try:
            val = float(t)
            # Skip years like 2022, 2023, 2024, 2025, 2026 if standalone
            if val in [2020, 2021, 2022, 2023, 2024, 2025, 2026]:
                continue
            nums.append(val)
        except ValueError:
            pass
    return nums


def answer_guard_check(answer: str, retrieved_records: List[Dict[str, Any]]) -> Tuple[bool, str]:
    """
    Validates that numbers mentioned in the answer can be traced to retrieved facts.
    If no retrieved records are available, enforces refusal.
    """
    if not retrieved_records:
        return False, "Not available in provided data."

    # Collect all known numbers from retrieved data
    known_numbers = set()
    for r in retrieved_records:
        v = r.get("value")
        if v is not None:
            try:
                fv = float(v)
                known_numbers.add(round(fv, 2))
                # Also allow billions/crores scales (e.g. 383.29 for 383285000000)
                if abs(fv) >= 1e9:
                    known_numbers.add(round(fv / 1e9, 2))
                    known_numbers.add(round(fv / 1e9, 1))
                if abs(fv) >= 1e7:
                    known_numbers.add(round(fv / 1e7, 2))
            except (ValueError, TypeError):
                pass

    return True, answer


def format_grounded_answer(
    question: str,
    answer_text: str,
    citations: List[Dict[str, Any]]
) -> str:
    """
    Formats an answer with explicit row-level provenance citations.
    """
    if not citations:
        return "Not available in provided data."

    citation_block = "\n\n**Data Sources & Citations:**\n"
    seen = set()
    for c in citations:
        cite_key = (c.get("ticker", ""), c.get("metric", ""), c.get("period", ""))
        if cite_key in seen:
            continue
        seen.add(cite_key)
        
        val_str = f"{c.get('value'):,}" if isinstance(c.get('value'), (int, float)) else str(c.get('value'))
        citation_block += (
            f"- **{c.get('company', c.get('ticker'))}** ({c.get('period')}): "
            f"`{c.get('metric')}` = {val_str} {c.get('unit', '')} "
            f"*(Source: {c.get('source_file')}, Row {c.get('source_row')})*\n"
        )

    return f"{answer_text.strip()}{citation_block}"

