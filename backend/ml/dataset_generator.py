"""
dataset_generator.py
--------------------
Generate a synthetic labelled dataset for training the batting quality model.

Each sample represents a cricket batsman's pose described by the 10 feature
values defined in feature_extractor.FEATURE_NAMES.  Labels are fractional
quality scores (0–100) for five batting categories:
    stance, grip_hands, back_lift, elbow_angle, head_position

Strategy
--------
For each quality level (good / average / poor) we sample features from Gaussian
distributions centred on the ideal midpoint (good), with progressively wider
standard deviations and shifted means for lower quality classes.

This produces a realistic, continuous score distribution that a regression model
can learn from, without requiring any real labelled images.
"""

from __future__ import annotations

import numpy as np
import pandas as pd
from pathlib import Path
from typing import Tuple

from .feature_extractor import (
    FEATURE_NAMES,
    IDEAL_RANGES,
    CATEGORY_FEATURE_WEIGHTS,
    rule_based_scores,
)

# ── Per-feature Gaussian parameters per quality tier ─────────────────────────
# Tuples: (mean_offset_from_ideal_centre, std_dev)
#   good    → offset=0,   tight std
#   average → offset=±30% of range half-width, moderate std
#   poor    → offset=±80% of range half-width, loose std

_TIER_PARAMS = {
    "good":    (0.00, 0.15),
    "average": (0.35, 0.40),
    "poor":    (0.90, 0.60),
}

rng = np.random.default_rng(42)


def _sample_feature(feat: str, tier: str, n: int) -> np.ndarray:
    """Sample n values for a single feature from the given quality tier."""
    lo, hi = IDEAL_RANGES[feat]
    centre    = (lo + hi) / 2.0
    half_span = (hi - lo) / 2.0

    offset_frac, std_frac = _TIER_PARAMS[tier]

    # For poor/average the mean slips away from ideal centre;
    # alternate direction between consecutive calls for diversity.
    direction = rng.choice([-1, 1])
    mean  = centre + direction * offset_frac * half_span
    sigma = std_frac * half_span

    samples = rng.normal(loc=mean, scale=sigma, size=n).astype(float)

    # Clamp to physically plausible ranges
    physical_clamp = {
        "front_elbow_angle":        (60.0,  179.0),
        "back_elbow_angle":         (40.0,  179.0),
        "back_lift_angle":          (0.0,    90.0),
        "front_knee_angle":         (80.0,  179.0),
        "back_knee_angle":          (60.0,  179.0),
        "head_offset":              (-0.5,   0.5),
        "head_drop":                (-0.2,   0.6),
        "shoulder_tilt":            (0.0,   45.0),
        "hip_shoulder_separation":  (0.0,   60.0),
        "stance_width_ratio":       (0.5,    3.0),
    }
    lo_c, hi_c = physical_clamp.get(feat, (-1e9, 1e9))
    return np.clip(samples, lo_c, hi_c)


def generate_dataset(
    n_good: int = 600,
    n_average: int = 500,
    n_poor: int = 400,
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Generate a synthetic training dataset.

    Returns
    -------
    X : DataFrame  shape (N, 10)  – feature matrix
    y : DataFrame  shape (N, 5)   – label matrix (scores 0–100 per category)
    """
    label_cols = ["stance", "grip_hands", "back_lift", "elbow_angle", "head_position"]

    X_rows, y_rows = [], []

    tier_counts = {"good": n_good, "average": n_average, "poor": n_poor}

    for tier, n in tier_counts.items():
        # Sample all features for this tier
        feature_matrix = np.column_stack([
            _sample_feature(feat, tier, n) for feat in FEATURE_NAMES
        ])  # shape (n, 10)

        for row in feature_matrix:
            feat_dict = dict(zip(FEATURE_NAMES, row))
            scores    = rule_based_scores(feat_dict)  # compute ground-truth scores

            X_rows.append(row)
            y_rows.append([scores[c] for c in label_cols])

    X = pd.DataFrame(X_rows, columns=FEATURE_NAMES)
    y = pd.DataFrame(y_rows, columns=label_cols)
    return X, y


def save_dataset(
    X: pd.DataFrame,
    y: pd.DataFrame,
    output_dir: str | Path = "ml/data",
) -> None:
    """Save X and y to CSV files."""
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)
    X.to_csv(out / "features.csv", index=False)
    y.to_csv(out / "labels.csv",   index=False)
    print(f"[dataset] Saved {len(X)} samples → {out}")


if __name__ == "__main__":
    X, y = generate_dataset()
    save_dataset(X, y)
    print(X.describe())
    print(y.describe())
