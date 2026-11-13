#!/usr/bin/env python3
"""
CLI runner for the canonical data loader.
Usage:
    python3 scripts/load_data.py
"""

import sys
import os

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.data_layer.loader import load_clean_data

if __name__ == "__main__":
    print("=" * 60)
    print(" LAVALOON TERMINAL — DATA LOADER (PHASE 0)")
    print("=" * 60)
    try:
        res = load_clean_data(verbose=True)
        print("-" * 60)
        print(f"Status: SUCCESS")
        print(f"Total Companies Processed: {res['companies_count']}")
        print(f"Total Clean Financial Rows: {res['financials_count']}")
        print(f"Total Segment Rows:         {res['segments_count']}")
        print("=" * 60)
    except Exception as e:
        print(f"Error executing data loader: {e}")
        sys.exit(1)

