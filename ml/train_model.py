from pathlib import Path

from backend.ml.train_model import train


if __name__ == "__main__":
    train(output_dir=Path("backend/ml/saved_model"))
