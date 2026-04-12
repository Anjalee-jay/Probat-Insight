
import argparse
from pathlib import Path

from backend.ml.train_model import train


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train ProBat model from workspace root.")
    parser.add_argument("--output", type=str, default="backend/ml/saved_model")
    parser.add_argument("--n-good", type=int, default=100)
    parser.add_argument("--n-average", type=int, default=80)
    parser.add_argument("--n-poor", type=int, default=60)
    parser.add_argument("--dataset-csv", type=str, default=None)
    parser.add_argument("--features-csv", type=str, default=None)
    parser.add_argument("--labels-csv", type=str, default=None)
    return parser.parse_args()


if __name__ == "__main__":
    args = _parse_args()
    if args.dataset_csv and (args.features_csv or args.labels_csv):
        raise SystemExit("Use either --dataset-csv OR (--features-csv and --labels-csv), not both.")
    if (args.features_csv and not args.labels_csv) or (args.labels_csv and not args.features_csv):
        raise SystemExit("When using split CSV files, provide both --features-csv and --labels-csv.")

    train(
        output_dir=Path(args.output),
        n_good=args.n_good,
        n_average=args.n_average,
        n_poor=args.n_poor,
        dataset_csv=Path(args.dataset_csv) if args.dataset_csv else None,
        features_csv=Path(args.features_csv) if args.features_csv else None,
        labels_csv=Path(args.labels_csv) if args.labels_csv else None,
    )
