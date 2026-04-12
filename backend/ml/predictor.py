"""
predictor.py
------------
Inference pipeline: load the trained model and produce analysis results
from a batting image (or raw pose keypoints / feature dict).

Usage
-----
    from ml.predictor import BattingPredictor

    predictor = BattingPredictor()                 # loads saved_model automatically
    result    = predictor.analyse_image(image_bytes)
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, List, Optional

import numpy as np

from .feature_extractor import (
    FEATURE_NAMES,
    extract_batting_features,
    features_to_vector,
    rule_based_scores,
)
from .pose_estimator import extract_pose_keypoints, has_sufficient_visibility

# ── Default model artefact location ──────────────────────────────────────────

DEFAULT_MODEL_DIR = Path(__file__).parent / "saved_model"


# ── Improvement tips per category ────────────────────────────────────────────

_TIPS: Dict[str, Dict[str, List[str]]] = {
    "stance": {
        "poor": [
            "Widen your base — feet should be shoulder-width or slightly wider.",
            "Bend both knees slightly to stay balanced and ready to move.",
            "Keep your weight on the balls of your feet, not your heels.",
        ],
        "average": [
            "Fine-tune your knee bend — a little more flex improves weight transfer.",
            "Check your foot alignment; front foot should point slightly towards the bowler.",
        ],
        "good": [
            "Great stance! Maintain this solid base consistently under pressure.",
        ],
    },
    "grip_hands": {
        "poor": [
            "Relax your grip — squeezing too hard restricts wrist movement.",
            "Keep the 'V's formed by thumb and forefinger pointing between off and middle stumps.",
            "Allow a slight bend in the front elbow; don't lock the arm straight.",
        ],
        "average": [
            "Ensure both hands work together — top hand guides, bottom hand provides power.",
            "Check your front elbow isn't collapsing too close to your body.",
        ],
        "good": [
            "Excellent hand position. Focus on maintaining it through the full swing.",
        ],
    },
    "back_lift": {
        "poor": [
            "Aim for a straight back lift — swing the bat towards second slip, not fine leg.",
            "Keep the bat face slightly open (facing covers) at the top of the back lift.",
            "Don't rush the back lift; it should be smooth and controlled.",
        ],
        "average": [
            "Your back lift direction could be slightly straighter for off-side shots.",
            "Try to get the bat higher on the back lift for extra power.",
        ],
        "good": [
            "Clean back lift. Ensure you can repeat it consistently for every delivery.",
        ],
    },
    "elbow_angle": {
        "poor": [
            "Lead with your front elbow through the shot — it drives the bat path.",
            "Avoid 'chicken-winging' the front elbow away from your body.",
            "Keep the front arm bent (not fully straight) at the point of contact.",
        ],
        "average": [
            "Work on maintaining elbow height through the shot – film yourself from in front.",
            "Slightly increase front-elbow bend for better bat control.",
        ],
        "good": [
            "Elbow position looks solid. Focus on keeping it consistent against short-pitched balls.",
        ],
    },
    "head_position": {
        "poor": [
            "Keep your head still and over the ball at the point of contact.",
            "Eyes should be level — tilting the head causes poor judgement of line & length.",
            "Turn your head fully to watch the ball from the bowler's hand.",
        ],
        "average": [
            "Minor head movement detected — drill shadow-batting in front of a mirror.",
            "Stay over the ball line a fraction longer through your shots.",
        ],
        "good": [
            "Head position is excellent. Eyes level and watching the ball closely.",
        ],
    },
}


def _grade(score: float) -> str:
    if score >= 85:
        return "good"
    if score >= 60:
        return "average"
    return "poor"


def _tips_for_score(category: str, score: float) -> List[str]:
    grade = _grade(score)
    return _TIPS.get(category, {}).get(grade, [])


# ── BattingPredictor class ────────────────────────────────────────────────────

class BattingPredictor:
    """
    End-to-end batting analysis predictor.

    Loads the trained model at construction time (falls back to rule-based
    scoring if the model file is not yet present).
    """

    def __init__(self, model_dir: str | Path = DEFAULT_MODEL_DIR):
        self._pipeline = None
        self._stroke_pipeline = None
        self._stroke_labels = ["drive", "legglance-flick", "pullshot", "sweep"]
        self._label_cols: List[str] = [
            "stance", "grip_hands", "back_lift", "elbow_angle", "head_position"
        ]
        self._load_model(Path(model_dir))

    # ── Model loading ──────────────────────────────────────────────────────
    def _load_model(self, model_dir: Path) -> None:
        model_path = model_dir / "batting_model.joblib"
        meta_path  = model_dir / "label_cols.json"
        stroke_model_path = Path(__file__).parent.parent / "rf_stroke.pkl"  # Use RF instead of XGB

        if model_path.exists():
            try:
                import joblib
                self._pipeline = joblib.load(model_path)
                if meta_path.exists():
                    meta = json.loads(meta_path.read_text(encoding="utf-8"))
                    self._label_cols = meta.get("label_cols", self._label_cols)
                print(f"[predictor] Model loaded from {model_path}")
            except Exception as exc:
                print(f"[predictor] Warning: could not load model ({exc}). "
                      "Falling back to rule-based scoring.")
                self._pipeline = None
        else:
            print("[predictor] No trained model found. Using rule-based scoring. "
                  f"Run  python -m ml.train_model  to train.")

        # Load stroke model
        if stroke_model_path.exists():
            try:
                import joblib
                self._stroke_pipeline = joblib.load(stroke_model_path)
                print(f"[predictor] Stroke model loaded from {stroke_model_path}")
            except Exception as exc:
                print(f"[predictor] Warning: could not load stroke model ({exc}). "
                      "Using rule-based stroke identification.")
                self._stroke_pipeline = None
        else:
            print("[predictor] No stroke model found. Using rule-based stroke identification.")

    @property
    def model_ready(self) -> bool:
        return self._pipeline is not None

    # ── Scoring helpers ────────────────────────────────────────────────────
    def _predict_from_features(self, features: Dict[str, float]) -> Dict[str, float]:
        """Return score dict using the ML model or rule-based fallback."""
        if self._pipeline is not None:
            vec = features_to_vector(features).reshape(1, -1)
            pred = self._pipeline.predict(vec)[0]
            scores = {col: float(np.clip(pred[i], 0, 100))
                      for i, col in enumerate(self._label_cols)}
        else:
            scores = rule_based_scores(features)
            scores.pop("overall", None)

        # Compute overall
        scores["overall"] = round(
            sum(v for k, v in scores.items() if k != "overall") / len(self._label_cols),
            1,
        )
        # Round all
        return {k: round(v, 1) for k, v in scores.items()}

    # ── Public API ──────────────────────────────────────────────────────────
    def analyse_image(
        self,
        image_input,
        handedness: str = "right",
    ) -> Dict:
        """
        Full analysis pipeline: image → pose → features → scores → tips.

        Parameters
        ----------
        image_input : str | bytes | np.ndarray
            Path, raw bytes, or a BGR numpy array.
        handedness  : "right" or "left"

        Returns
        -------
        {
          "success": bool,
          "error":   str | None,
          "scores":  { stance, grip_hands, back_lift, elbow_angle, head_position, overall },
          "features": { ... raw feature values ... },
          "tips":    { category: [tip, ...], ... },
          "grade":   "A" | "B" | "C" | "D" | "F",
        }
        """
        # Step 1: Pose extraction
        keypoints = extract_pose_keypoints(image_input)
        if keypoints is None:
            return {
                "success": False,
                "error": "No human pose detected in the image. "
                         "Ensure the full batsman is visible.",
                "scores": None, "features": None, "tips": None, "grade": None,
            }

        if not has_sufficient_visibility(keypoints):
            return {
                "success": False,
                "error": "Key body parts are not clearly visible. "
                         "Try a well-lit image with the full body in frame.",
                "scores": None, "features": None, "tips": None, "grade": None,
            }

        # Step 2: Feature extraction
        features = extract_batting_features(keypoints, handedness=handedness)
        if features is None:
            return {
                "success": False,
                "error": "Could not compute batting features from detected pose.",
                "scores": None, "features": None, "tips": None, "grade": None,
            }

        # Step 3: Score prediction
        scores = self._predict_from_features(features)

        # Step 4: Tips
        tips = {
            cat: _tips_for_score(cat, scores[cat])
            for cat in self._label_cols
        }

        # Step 5: Letter grade
        overall = scores["overall"]
        if   overall >= 90: grade = "A+"
        elif overall >= 80: grade = "A"
        elif overall >= 70: grade = "B"
        elif overall >= 60: grade = "C"
        elif overall >= 50: grade = "D"
        else:               grade = "F"

        stroke_result = self._identify_stroke_from_keypoints(keypoints, handedness)

        return {
            "success":  True,
            "error":    None,
            "scores":   scores,
            "features": {k: round(v, 3) for k, v in features.items()},
            "tips":     tips,
            "grade":    grade,
            "stroke":   stroke_result["stroke"],
            "stroke_confidence": stroke_result["confidence"],
        }

    def analyse_keypoints(
        self,
        keypoints: Dict,
        handedness: str = "right",
    ) -> Dict:
        """Analyse from already-extracted pose keypoints (skips MediaPipe step)."""
        features = extract_batting_features(keypoints, handedness=handedness)
        if features is None:
            return {
                "success": False,
                "error": "Could not compute batting features.",
                "scores": None, "features": None, "tips": None, "grade": None,
            }
        scores = self._predict_from_features(features)
        tips   = {cat: _tips_for_score(cat, scores[cat]) for cat in self._label_cols}
        overall = scores["overall"]
        if   overall >= 90: grade = "A+"
        elif overall >= 80: grade = "A"
        elif overall >= 70: grade = "B"
        elif overall >= 60: grade = "C"
        elif overall >= 50: grade = "D"
        else:               grade = "F"
        
        stroke_result = self._identify_stroke_from_keypoints(keypoints, handedness)
        
        return {
            "success":  True, "error": None,
            "scores":   scores,
            "features": {k: round(v, 3) for k, v in features.items()},
            "tips":     tips, "grade": grade,
            "stroke":   stroke_result["stroke"],
            "stroke_confidence": stroke_result["confidence"],
        }

    def _identify_stroke_from_keypoints(self, keypoints: Dict, handedness: str = "right") -> Dict[str, any]:
        """
        Identify stroke using ML model with raw pose keypoints.
        Returns {"stroke": str, "confidence": float}
        """
        if self._stroke_pipeline is not None:
            try:
                # Flatten keypoints to feature vector (x, y, z coordinates only, exclude visibility)
                # Use the same landmark order as LANDMARK_NAMES
                from .pose_estimator import LANDMARK_NAMES
                features = []
                for name in LANDMARK_NAMES:
                    if name in keypoints:
                        kp = keypoints[name]
                        # Only use x, y, z coordinates (exclude visibility)
                        features.extend(kp[:3])
                    else:
                        features.extend([0.0, 0.0, 0.0])  # padding for missing keypoints
                
                # The model expects 128 features, but we have 33*3=99, so pad with zeros
                features = features[:99]  # Make sure we don't exceed 99
                while len(features) < 128:
                    features.append(0.0)
                
                features = features[:128]  # Ensure exactly 128
                vec = np.array(features).reshape(1, -1)
                
                pred_idx = self._stroke_pipeline.predict(vec)[0]
                predicted_stroke = self._stroke_labels[int(pred_idx)]
                
                # Get confidence (probability of the predicted class)
                if hasattr(self._stroke_pipeline, 'predict_proba'):
                    proba = self._stroke_pipeline.predict_proba(vec)[0]
                    confidence = float(proba[int(pred_idx)])
                else:
                    confidence = 0.8  # fallback if no predict_proba
                
                print(f"[predictor] ML stroke prediction: {predicted_stroke} (index: {pred_idx}, confidence: {confidence:.3f})")
                return {"stroke": predicted_stroke, "confidence": confidence}
            except Exception as e:
                print(f"[predictor] Stroke model prediction failed: {e}")
                import traceback
                traceback.print_exc()
                # Fall back to rule-based
        
        # Rule-based fallback using processed features
        print("[predictor] Using rule-based stroke identification")
        features = extract_batting_features(keypoints, handedness=handedness)
        if features is None:
            return {"stroke": "unknown", "confidence": 0.0}
            
        front_elbow = features.get("front_elbow_angle", 180)
        back_lift = features.get("back_lift_angle", 0)
        front_knee = features.get("front_knee_angle", 180)
        shoulder_tilt = features.get("shoulder_tilt", 0)

        if back_lift > 150 and front_knee < 120 and front_elbow >= 130:
            stroke = "pullshot"
        elif front_elbow < 110 and back_lift < 130:
            stroke = "sweep"
        elif abs(shoulder_tilt) > 12 and front_elbow >= 120:
            stroke = "legglance-flick"
        elif back_lift > 140 and front_elbow >= 130:
            stroke = "drive"
        else:
            stroke = "drive"  # default fallback
            
        confidence = 0.7  # rule-based confidence
        print(f"[predictor] Rule-based stroke prediction: {stroke} (confidence: {confidence})")
        return {"stroke": stroke, "confidence": confidence}


# ── Module-level singleton (lazy-loaded) ──────────────────────────────────────

_predictor: Optional[BattingPredictor] = None


def get_predictor() -> BattingPredictor:
    """Return the module-level singleton predictor (created on first call)."""
    global _predictor
    if _predictor is None:
        _predictor = BattingPredictor()
    return _predictor
