"""
feature_extractor.py
--------------------
Convert raw pose keypoints into a fixed-length feature vector used by the
batting-quality model.

Feature vector (10 values, all floats):
  0  front_elbow_angle        – degrees  (shoulder → elbow → wrist, leading arm)
  1  back_elbow_angle         – degrees  (shoulder → elbow → wrist, trailing arm)
  2  back_lift_angle          – degrees from vertical (trailing wrist → elbow line)
  3  front_knee_angle         – degrees  (hip → knee → ankle, leading leg)
  4  back_knee_angle          – degrees  (hip → knee → ankle, trailing leg)
  5  head_offset              – normalised lateral deviation of nose from shoulder midpoint
  6  head_drop                – vertical distance nose above shoulder midpoint (normalised)
  7  shoulder_tilt            – angle of shoulder line from horizontal (degrees)
  8  hip_shoulder_separation  – difference in rotation angles of hip vs shoulder lines (degrees)
  9  stance_width_ratio       – ankle span / shoulder span

Ideal ranges for a right-handed batsman (used in rule-based scoring fallback):
  front_elbow_angle      130 – 155°
  back_elbow_angle        80 – 120°
  back_lift_angle         10 –  30° (nearly vertical back lift)
  front_knee_angle       145 – 165°
  back_knee_angle        120 – 145°
  head_offset            -0.05 – 0.05
  shoulder_tilt            5 –  15°
  hip_shoulder_separation 10 –  25°
  stance_width_ratio       1.2 – 1.8
"""

from __future__ import annotations

import numpy as np
from typing import Dict, List, Optional, Tuple

Keypoints = Dict[str, List[float]]

# ── Geometry helpers ─────────────────────────────────────────────────────────

def _angle(a: List[float], b: List[float], c: List[float]) -> float:
    """Angle at vertex *b* formed by rays b→a and b→c (in degrees, 0–180)."""
    a2 = np.array(a[:2], dtype=float)
    b2 = np.array(b[:2], dtype=float)
    c2 = np.array(c[:2], dtype=float)
    ba = a2 - b2
    bc = c2 - b2
    denom = np.linalg.norm(ba) * np.linalg.norm(bc)
    if denom < 1e-9:
        return 0.0
    cos_val = float(np.clip(np.dot(ba, bc) / denom, -1.0, 1.0))
    return float(np.degrees(np.arccos(cos_val)))


def _line_angle_from_vertical(p1: List[float], p2: List[float]) -> float:
    """Angle of the line p1→p2 measured from the vertical axis (degrees, 0 = straight up)."""
    dx = p2[0] - p1[0]
    dy = p2[1] - p1[1]
    return float(np.degrees(np.arctan2(abs(dx), abs(dy) + 1e-9)))


def _lateral_offset(
    point: List[float],
    ref_left: List[float],
    ref_right: List[float],
) -> float:
    """
    Signed lateral offset of *point* from the midpoint of (ref_left, ref_right),
    normalised by the span between the two reference points.
    Positive = towards ref_right.
    """
    mid_x = (ref_left[0] + ref_right[0]) / 2.0
    span  = abs(ref_left[0] - ref_right[0]) + 1e-9
    return float((point[0] - mid_x) / span)


def _line_orientation(p1: List[float], p2: List[float]) -> float:
    """Signed orientation angle of line p1→p2 relative to the x-axis (degrees)."""
    dx = p2[0] - p1[0]
    dy = p2[1] - p1[1]
    return float(np.degrees(np.arctan2(dy, dx + 1e-9)))

# ── Public API ────────────────────────────────────────────────────────────────

FEATURE_NAMES: List[str] = [
    "front_elbow_angle",
    "back_elbow_angle",
    "back_lift_angle",
    "front_knee_angle",
    "back_knee_angle",
    "head_offset",
    "head_drop",
    "shoulder_tilt",
    "hip_shoulder_separation",
    "stance_width_ratio",
]

# Ideal (optimal) range: (low, high) — used for rule-based scoring fallback
IDEAL_RANGES: Dict[str, Tuple[float, float]] = {
    "front_elbow_angle":       (130.0, 155.0),
    "back_elbow_angle":        (80.0,  120.0),
    "back_lift_angle":         (10.0,   30.0),
    "front_knee_angle":        (145.0, 165.0),
    "back_knee_angle":         (120.0, 145.0),
    "head_offset":             (-0.05,  0.05),
    "head_drop":               (0.12,   0.25),
    "shoulder_tilt":           (5.0,    15.0),
    "hip_shoulder_separation": (10.0,   25.0),
    "stance_width_ratio":      (1.2,    1.8),
}


def extract_batting_features(
    keypoints: Keypoints,
    handedness: str = "right",
) -> Optional[Dict[str, float]]:
    """
    Compute the 10 batting technique features from pose keypoints.

    Parameters
    ----------
    keypoints   : output of pose_estimator.extract_pose_keypoints
    handedness  : "right" or "left" (dominant batting hand)

    Returns
    -------
    dict { feature_name: value }  or  None if critical keypoints are missing.
    """
    def g(name: str) -> List[float]:
        kp = keypoints.get(name)
        if kp is None:
            raise KeyError(f"Missing keypoint: {name}")
        return kp

    # Map anatomical sides to batting roles
    if handedness == "left":
        front = dict(shoulder="right_shoulder", elbow="right_elbow", wrist="right_wrist",
                     hip="right_hip", knee="right_knee", ankle="right_ankle")
        back  = dict(shoulder="left_shoulder",  elbow="left_elbow",  wrist="left_wrist",
                     hip="left_hip",  knee="left_knee",  ankle="left_ankle")
    else:  # right-handed (default)
        front = dict(shoulder="left_shoulder",  elbow="left_elbow",  wrist="left_wrist",
                     hip="left_hip",  knee="left_knee",  ankle="left_ankle")
        back  = dict(shoulder="right_shoulder", elbow="right_elbow", wrist="right_wrist",
                     hip="right_hip", knee="right_knee", ankle="right_ankle")

    try:
        # 1. Front elbow angle (leading arm: shoulder → elbow → wrist)
        front_elbow_angle = _angle(
            g(front["shoulder"]), g(front["elbow"]), g(front["wrist"])
        )

        # 2. Back elbow angle (bat arm: shoulder → elbow → wrist)
        back_elbow_angle = _angle(
            g(back["shoulder"]), g(back["elbow"]), g(back["wrist"])
        )

        # 3. Back lift angle: how vertical is the bat arm (elbow → wrist line)
        back_lift_angle = _line_angle_from_vertical(
            g(back["elbow"]), g(back["wrist"])
        )

        # 4. Front knee bend (leading leg: hip → knee → ankle)
        front_knee_angle = _angle(
            g(front["hip"]), g(front["knee"]), g(front["ankle"])
        )

        # 5. Back knee bend (trailing leg: hip → knee → ankle)
        back_knee_angle = _angle(
            g(back["hip"]), g(back["knee"]), g(back["ankle"])
        )

        # 6. Head lateral offset (nose vs. shoulder midpoint)
        head_offset = _lateral_offset(
            g("nose"), g("left_shoulder"), g("right_shoulder")
        )

        # 7. Head vertical drop (nose y above shoulder midpoint y, normalised)
        l_sh, r_sh = g("left_shoulder"), g("right_shoulder")
        shoulder_span = float(np.linalg.norm(
            np.array(l_sh[:2]) - np.array(r_sh[:2])
        ))
        shoulder_mid_y = (l_sh[1] + r_sh[1]) / 2.0
        head_drop = float((shoulder_mid_y - g("nose")[1]) / (shoulder_span + 1e-9))

        # 8. Shoulder tilt from horizontal
        shoulder_tilt = float(abs(_line_orientation(l_sh, r_sh)))

        # 9. Hip-shoulder separation (difference in orientation angles)
        l_hip, r_hip = g("left_hip"), g("right_hip")
        hip_orientation  = _line_orientation(l_hip, r_hip)
        sh_orientation   = _line_orientation(l_sh,  r_sh)
        hip_shoulder_sep = float(abs(hip_orientation - sh_orientation))

        # 10. Stance width ratio (ankle span / shoulder span)
        ankle_span = float(np.linalg.norm(
            np.array(g("left_ankle")[:2]) - np.array(g("right_ankle")[:2])
        ))
        stance_width_ratio = ankle_span / (shoulder_span + 1e-9)

        return {
            "front_elbow_angle":       front_elbow_angle,
            "back_elbow_angle":        back_elbow_angle,
            "back_lift_angle":         back_lift_angle,
            "front_knee_angle":        front_knee_angle,
            "back_knee_angle":         back_knee_angle,
            "head_offset":             head_offset,
            "head_drop":               head_drop,
            "shoulder_tilt":           shoulder_tilt,
            "hip_shoulder_separation": hip_shoulder_sep,
            "stance_width_ratio":      stance_width_ratio,
        }

    except KeyError:
        return None


def features_to_vector(features: Dict[str, float]) -> np.ndarray:
    """Return a 1-D numpy array in the canonical FEATURE_NAMES order."""
    return np.array([features[n] for n in FEATURE_NAMES], dtype=float)


# ── Rule-based scorer (fallback when no trained model is available) ────────────

def _range_score(value: float, low: float, high: float) -> float:
    """
    Score a single feature relative to its ideal range.
    Returns 0–100.  100 = perfectly within range; drops linearly outside.
    """
    centre = (low + high) / 2.0
    half   = (high - low) / 2.0
    if half <= 0:
        return 100.0
    deviation = abs(value - centre) / half     # 0 = perfect, 1 = at edge, >1 = outside
    score = max(0.0, 100.0 - (deviation - 1.0) * 50.0) if deviation > 1.0 else 100.0
    return float(min(100.0, score))


# Map each scoring category to the features that feed it
CATEGORY_FEATURE_WEIGHTS: Dict[str, Dict[str, float]] = {
    "stance": {
        "front_knee_angle":        0.35,
        "back_knee_angle":         0.30,
        "stance_width_ratio":      0.35,
    },
    "grip_hands": {
        "front_elbow_angle":       0.50,
        "back_elbow_angle":        0.50,
    },
    "back_lift": {
        "back_lift_angle":         1.00,
    },
    "elbow_angle": {
        "front_elbow_angle":       1.00,
    },
    "head_position": {
        "head_offset":             0.50,
        "head_drop":               0.30,
        "shoulder_tilt":           0.20,
    },
}


def rule_based_scores(features: Dict[str, float]) -> Dict[str, float]:
    """
    Compute batting category scores (0–100) using ideal-range heuristics.
    This is the fallback scorer used before a trained model is available.
    """
    raw_scores: Dict[str, float] = {}
    for feat, (lo, hi) in IDEAL_RANGES.items():
        raw_scores[feat] = _range_score(features[feat], lo, hi)

    category_scores: Dict[str, float] = {}
    for category, weight_map in CATEGORY_FEATURE_WEIGHTS.items():
        total = 0.0
        for feat, w in weight_map.items():
            total += raw_scores.get(feat, 50.0) * w
        category_scores[category] = round(float(total), 1)

    overall = round(sum(category_scores.values()) / len(category_scores), 1)
    category_scores["overall"] = overall
    return category_scores
