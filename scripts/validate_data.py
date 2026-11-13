#!/usr/bin/env python3
"""
CLI runner for data validation.
Usage:
    python3 scripts/validate_data.py
"""

import sys
import os

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.data_layer.validator import validate_financial_data

if __name__ == "__main__":
    try:
        report = validate_financial_data(verbose=True)
        if not report["passed"]:
            sys.exit(1)
    except Exception as e:
        print(f"Error during validation: {e}")
        sys.exit(1)

