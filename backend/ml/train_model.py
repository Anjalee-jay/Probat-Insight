"""
train_model.py
--------------
Train a multi-output regression model that predicts batting quality scores
(0–100) for five categories:  stance, grip_hands, back_lift, elbow_angle,
head_position.

Usage
-----
  # from the backend/ directory:
  python -m ml.train_model

Or run directly from any location by providing the --output flag:
  python backend/ml/train_model.py --output backend/ml/saved_model/

Output artefacts (written to  ml/saved_model/ ):
  batting_model.joblib  – trained sklearn Pipeline
  label_cols.json       – ordered list of output column names
  training_report.txt   – cross-validation metrics & feature importances
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

# Allow running as  python ml/train_model.py  from anywhere
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import KFold
from sklearn.multioutput import MultiOutputRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from .dataset_generator import generate_dataset
from .feature_extractor import FEATURE_NAMES

# ── Constants ─────────────────────────────────────────────────────────────────

LABEL_COLS   = ["stance", "grip_hands", "back_lift", "elbow_angle", "head_position"]
DEFAULT_OUT  = Path(__file__).parent / "saved_model"
N_SPLITS     = 2       # k-fold cross-validation
RANDOM_STATE = 42


# ── Model definitions to compare ─────────────────────────────────────────────

def _build_pipelines() -> dict:
    """Return a dict of  name → sklearn Pipeline  candidates."""
    return {
        "RandomForest": Pipeline([
            ("scaler", StandardScaler()),
            ("model",  MultiOutputRegressor(
                RandomForestRegressor(
                    n_estimators=40,
                    max_depth=6,
                    min_samples_leaf=4,
                    random_state=RANDOM_STATE,
                    n_jobs=1,
                )
            )),
        ]),
    }


# ── Cross-validation helper ───────────────────────────────────────────────────

def _cross_validate_pipeline(
    pipeline: Pipeline,
    X: pd.DataFrame,
    y: pd.DataFrame,
) -> dict:
    """
    Run k-fold cross-validation and return per-fold MAE + R² for each output.
    """
    kf = KFold(n_splits=N_SPLITS, shuffle=True, random_state=RANDOM_STATE)

    fold_maes, fold_r2s = [], []

    for fold, (train_idx, val_idx) in enumerate(kf.split(X), 1):
        X_tr, X_val = X.iloc[train_idx], X.iloc[val_idx]
        y_tr, y_val = y.iloc[train_idx], y.iloc[val_idx]

        pipeline.fit(X_tr, y_tr)
        y_pred = pipeline.predict(X_val)

        col_maes = [mean_absolute_error(y_val.iloc[:, i], y_pred[:, i])
                    for i in range(y.shape[1])]
        col_r2s  = [r2_score(y_val.iloc[:, i], y_pred[:, i])
                    for i in range(y.shape[1])]

        fold_maes.append(col_maes)
        fold_r2s.append(col_r2s)

    mean_mae = np.mean(fold_maes, axis=0)
    mean_r2  = np.mean(fold_r2s,  axis=0)

    return {
        "mean_mae_per_output": dict(zip(LABEL_COLS, mean_mae.tolist())),
        "mean_r2_per_output":  dict(zip(LABEL_COLS, mean_r2.tolist())),
        "overall_mae":         float(np.mean(mean_mae)),
        "overall_r2":          float(np.mean(mean_r2)),
    }


# ── Feature importance (for RandomForest only) ───────────────────────────────

def _feature_importances(pipeline: Pipeline) -> dict | None:
    """Extract mean feature importances from a MultiOutput RF pipeline."""
    try:
        estimators = pipeline.named_steps["model"].estimators_
        importances = np.mean(
            [e.feature_importances_ for e in estimators], axis=0
        )
        return dict(sorted(
            zip(FEATURE_NAMES, importances.tolist()),
            key=lambda kv: kv[1], reverse=True,
        ))
    except AttributeError:
        return None


# ── Training report writer ───────────────────────────────────────────────────

def _write_report(
    report_lines: list[str],
    output_dir: Path,
) -> None:
    path = output_dir / "training_report.txt"
    path.write_text("\n".join(report_lines), encoding="utf-8")
    print(f"[train] Report written -> {path}")


# ── Main training entry point ────────────────────────────────────────────────

def train(
    output_dir: Path = DEFAULT_OUT,
    n_good: int = 100,
    n_average: int = 80,
    n_poor: int = 60,
    verbose: bool = True,
) -> Pipeline:
    """
    Full training pipeline:
      1. Generate synthetic dataset
      2. Compare candidate models via cross-validation
      3. Select best model (lowest overall MAE)
      4. Retrain on full dataset
      5. Save artefacts

    Returns the fitted best Pipeline.
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # ── 1. Data ───────────────────────────────────────────────────────────────
    if verbose:
        print("[train] Generating synthetic dataset...")
    t0 = time.perf_counter()
    X, y = generate_dataset(n_good=n_good, n_average=n_average, n_poor=n_poor)
    total_samples = len(X)
    if verbose:
        print(f"[train] {total_samples} samples generated  "
              f"({time.perf_counter() - t0:.1f}s)")

    report_lines = [
        "=" * 60,
        "  ProBat Insight — Batting Quality Model Training Report",
        "=" * 60,
        "",
        f"Dataset : {total_samples} samples  "
        f"(good={n_good}, average={n_average}, poor={n_poor})",
        f"Features: {FEATURE_NAMES}",
        f"Outputs : {LABEL_COLS}",
        f"CV folds: {N_SPLITS}",
        "",
    ]

    # ── 2. Cross-validate candidates ──────────────────────────────────────────
    pipelines   = _build_pipelines()
    cv_results  = {}

    for name, pipe in pipelines.items():
        if verbose:
            print(f"[train] Cross-validating {name}...")
        t1 = time.perf_counter()
        cv = _cross_validate_pipeline(pipe, X, y)
        elapsed = time.perf_counter() - t1
        cv_results[name] = cv

        report_lines += [
            f"─── {name} ({elapsed:.1f}s) ───",
            f"  Overall MAE : {cv['overall_mae']:.3f}",
            f"  Overall R2  : {cv['overall_r2']:.4f}",
            "  Per-output MAE:",
        ]
        for col, mae in cv["mean_mae_per_output"].items():
            report_lines.append(f"    {col:<20} {mae:.3f}")
        report_lines += [
            "  Per-output R2:",
        ]
        for col, r2 in cv["mean_r2_per_output"].items():
            report_lines.append(f"    {col:<20} {r2:.4f}")
        report_lines.append("")

    # ── 3. Select best model ──────────────────────────────────────────────────
    best_name = min(cv_results, key=lambda n: cv_results[n]["overall_mae"])
    best_cv   = cv_results[best_name]
    if verbose:
        print(f"[train] Best model: {best_name}  "
              f"(MAE={best_cv['overall_mae']:.3f}, R2={best_cv['overall_r2']:.4f})")

    report_lines += [
        f"Best model selected : {best_name}",
        f"  CV Overall MAE    : {best_cv['overall_mae']:.3f}",
        f"  CV Overall R2     : {best_cv['overall_r2']:.4f}",
        "",
    ]

    # ── 4. Retrain on full dataset ─────────────────────────────────────────────
    best_pipeline = _build_pipelines()[best_name]
    if verbose:
        print(f"[train] Retraining {best_name} on full dataset...")
    best_pipeline.fit(X, y)

    # Final evaluation (in-sample, informational only)
    y_pred_full = best_pipeline.predict(X)
    in_sample_mae = float(np.mean([
        mean_absolute_error(y.iloc[:, i], y_pred_full[:, i])
        for i in range(y.shape[1])
    ]))
    report_lines += [
        f"In-sample MAE (full retrain): {in_sample_mae:.3f}",
        "",
    ]

    # Feature importances (RF only)
    imp = _feature_importances(best_pipeline)
    if imp:
        report_lines.append("Feature importances (mean across outputs):")
        for feat, val in imp.items():
            report_lines.append(f"  {feat:<30} {val:.4f}")
        report_lines.append("")

    # ── 5. Save artefacts ────────────────────────────────────────────────────
    model_path = output_dir / "batting_model.joblib"
    meta_path  = output_dir / "label_cols.json"

    joblib.dump(best_pipeline, model_path)
    meta_path.write_text(
        json.dumps({"label_cols": LABEL_COLS, "feature_names": FEATURE_NAMES,
                    "best_model": best_name, "overall_mae": best_cv["overall_mae"],
                    "overall_r2": best_cv["overall_r2"]},
                   indent=2),
        encoding="utf-8",
    )

    report_lines += [
        f"Saved model -> {model_path}",
        f"Saved meta  -> {meta_path}",
        "=" * 60,
    ]
    _write_report(report_lines, output_dir)

    if verbose:
        print(f"[train] Model saved -> {model_path}")
        print("[train] Training complete.")

    return best_pipeline


# ── CLI entry point ────────────────────────────────────────────────────────────

def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Train the ProBat batting quality model."
    )
    parser.add_argument(
        "--output", "-o",
        type=str,
        default=str(DEFAULT_OUT),
        help="Directory to write model artefacts (default: ml/saved_model)",
    )
    parser.add_argument("--n-good",    type=int, default=100)
    parser.add_argument("--n-average", type=int, default=80)
    parser.add_argument("--n-poor",    type=int, default=60)
    return parser.parse_args()


if __name__ == "__main__":
    args = _parse_args()
    train(
        output_dir=Path(args.output),
        n_good=args.n_good,
        n_average=args.n_average,
        n_poor=args.n_poor,
    )
