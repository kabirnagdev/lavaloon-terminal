"""
Financial Data Ingestion & Quality Validation Module.

Enforces schema validation, type integrity, missing value detection,
and statistical sanitization on incoming financial survey records.
"""

from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, field
import pandas as pd
import numpy as np


@dataclass
class ColumnValidationIssue:
    column: str
    issue_type: str
    row_indices: List[int]
    description: str


@dataclass
class ValidationReport:
    total_records: int
    valid_records: int
    dropped_records: int
    column_issues: List[ColumnValidationIssue] = field(default_factory=list)
    missing_value_counts: Dict[str, int] = field(default_factory=dict)
    column_types: Dict[str, str] = field(default_factory=dict)
    is_valid: bool = True

    def summary(self) -> Dict[str, Any]:
        return {
            "total_records": self.total_records,
            "valid_records": self.valid_records,
            "dropped_records": self.dropped_records,
            "is_valid": self.is_valid,
            "missing_value_counts": self.missing_value_counts,
            "issues_count": len(self.column_issues),
            "issues": [
                {
                    "column": issue.column,
                    "issue_type": issue.issue_type,
                    "row_count": len(issue.row_indices),
                    "description": issue.description,
                }
                for issue in self.column_issues
            ],
        }


class FinancialDataValidator:
    """
    Validates and sanitizes tabular financial datasets before
    knowledge graph ingestion or vector indexing.
    """

    EXPECTED_SURVEY_COLUMNS = [
        "gender",
        "age",
        "Investment_Avenues",
        "Mutual_Funds",
        "Equity_Market",
        "Debentures",
        "Government_Bonds",
        "Fixed_Deposits",
        "PPF",
        "Gold",
        "Stock_Marktet",
        "Factor",
        "Objective",
        "Purpose",
        "Duration",
        "Invest_Monitor",
        "Expect",
        "Avenue",
        "What are your savings objectives?",
        "Reason_Equity",
        "Reason_Mutual",
        "Reason_FD",
        "Reason_Bonds",
        "Source",
    ]

    @staticmethod
    def validate_survey_dataframe(
        df: pd.DataFrame, drop_invalid: bool = False
    ) -> Tuple[pd.DataFrame, ValidationReport]:
        """
        Validate and optionally cleanse financial survey DataFrame.

        Args:
            df: Raw pandas DataFrame.
            drop_invalid: If True, drops rows with non-recoverable schema violations.

        Returns:
            Tuple of (cleaned_df, validation_report).
        """
        total_rows = len(df)
        issues: List[ColumnValidationIssue] = []
        missing_counts = df.isnull().sum().to_dict()
        col_types = {str(col): str(dtype) for col, dtype in df.dtypes.items()}
        rows_to_drop = set()

        cleaned_df = df.copy()

        # 1. Check Age column if present
        age_col = None
        for c in cleaned_df.columns:
            if c.lower() == "age":
                age_col = c
                break

        if age_col:
            # Convert to numeric, errors coerce to NaN
            numeric_age = pd.to_numeric(cleaned_df[age_col], errors="coerce")
            invalid_age_mask = numeric_age.isna() | (numeric_age < 16) | (numeric_age > 120)
            invalid_indices = cleaned_df[invalid_age_mask].index.tolist()

            if invalid_indices:
                issues.append(
                    ColumnValidationIssue(
                        column=age_col,
                        issue_type="range_or_type_violation",
                        row_indices=invalid_indices,
                        description=f"Age contains {len(invalid_indices)} values outside realistic adult range [16-120] or non-numeric values.",
                    )
                )
                if drop_invalid:
                    rows_to_drop.update(invalid_indices)

        # 2. Check Gender column if present
        gender_col = None
        for c in cleaned_df.columns:
            if c.lower() == "gender":
                gender_col = c
                break

        if gender_col:
            valid_genders = {"male", "female", "other", "non-binary"}
            gender_series = cleaned_df[gender_col].astype(str).str.strip().str.lower()
            invalid_gender_mask = ~gender_series.isin(valid_genders) & cleaned_df[gender_col].notna()
            invalid_indices = cleaned_df[invalid_gender_mask].index.tolist()

            if invalid_indices:
                issues.append(
                    ColumnValidationIssue(
                        column=gender_col,
                        issue_type="invalid_category",
                        row_indices=invalid_indices,
                        description=f"Gender contains {len(invalid_indices)} unrecognized categorical values.",
                    )
                )
                if drop_invalid:
                    rows_to_drop.update(invalid_indices)

        # 3. Check for entirely empty rows or excessive nulls
        excessive_null_rows = cleaned_df[cleaned_df.isnull().sum(axis=1) > (len(cleaned_df.columns) * 0.7)].index.tolist()
        if excessive_null_rows:
            issues.append(
                ColumnValidationIssue(
                    column="<all>",
                    issue_type="excessive_nulls",
                    row_indices=excessive_null_rows,
                    description=f"{len(excessive_null_rows)} rows have > 70% missing column values.",
                )
            )
            if drop_invalid:
                rows_to_drop.update(excessive_null_rows)

        # Perform drop if requested
        if drop_invalid and rows_to_drop:
            cleaned_df = cleaned_df.drop(index=list(rows_to_drop)).reset_index(drop=True)

        valid_rows = len(cleaned_df)
        dropped_count = total_rows - valid_rows

        report = ValidationReport(
            total_records=total_rows,
            valid_records=valid_rows,
            dropped_records=dropped_count,
            column_issues=issues,
            missing_value_counts=missing_counts,
            column_types=col_types,
            is_valid=len(issues) == 0 or (drop_invalid and valid_rows > 0),
        )

        return cleaned_df, report

