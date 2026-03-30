"""
pose_estimator.py
-----------------
Extract 33 MediaPipe pose landmarks from a cricket batting image.
Returns a dict of  { landmark_name: [x, y, z, visibility] }
where x, y, z are normalised (0-1) to the image size.
"""

from __future__ import annotations

import cv2
import mediapipe as mp  # type: ignore[import-untyped]
import numpy as np
import os
import urllib.request
from pathlib import Path
from typing import Dict, List, Optional

# ── MediaPipe setup ──────────────────────────────────────────────────────────
_mp_pose = None
try:
    _mp_pose = mp.solutions.pose  # type: ignore[attr-defined]
except Exception:
    _mp_pose = None

_pose_landmarker = None

_POSE_TASK_MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/pose_landmarker/"
    "pose_landmarker_lite/float16/latest/pose_landmarker_lite.task"
)


def _default_pose_task_path() -> Path:
    return Path(__file__).parent / "saved_model" / "pose_landmarker_lite.task"


def _ensure_pose_task_model() -> Path:
    configured = os.getenv("MEDIAPIPE_POSE_TASK_PATH", "").strip()
    model_path = Path(configured) if configured else _default_pose_task_path()
    if model_path.exists():
        return model_path

    model_path.parent.mkdir(parents=True, exist_ok=True)
    urllib.request.urlretrieve(_POSE_TASK_MODEL_URL, str(model_path))
    return model_path


def _get_pose_landmarker(min_detection_confidence: float):
    global _pose_landmarker
    if _pose_landmarker is not None:
        return _pose_landmarker

    from mediapipe.tasks.python import vision

    model_path = _ensure_pose_task_model()
    options = vision.PoseLandmarkerOptions(
        base_options=mp.tasks.BaseOptions(model_asset_path=str(model_path)),
        running_mode=vision.RunningMode.IMAGE,
        min_pose_detection_confidence=min_detection_confidence,
    )
    _pose_landmarker = vision.PoseLandmarker.create_from_options(options)
    return _pose_landmarker

# Ordered list of the 33 MediaPipe Pose landmark names (index == landmark id)
LANDMARK_NAMES: List[str] = [
    "nose",
    "left_eye_inner", "left_eye", "left_eye_outer",
    "right_eye_inner", "right_eye", "right_eye_outer",
    "left_ear", "right_ear",
    "mouth_left", "mouth_right",
    "left_shoulder", "right_shoulder",
    "left_elbow", "right_elbow",
    "left_wrist", "right_wrist",
    "left_pinky", "right_pinky",
    "left_index", "right_index",
    "left_thumb", "right_thumb",
    "left_hip", "right_hip",
    "left_knee", "right_knee",
    "left_ankle", "right_ankle",
    "left_heel", "right_heel",
    "left_foot_index", "right_foot_index",
]

# Landmarks relevant to batting analysis (subset used by feature_extractor)
KEY_LANDMARKS = {
    "nose", "left_shoulder", "right_shoulder",
    "left_elbow", "right_elbow",
    "left_wrist", "right_wrist",
    "left_hip", "right_hip",
    "left_knee", "right_knee",
    "left_ankle", "right_ankle",
}

Keypoints = Dict[str, List[float]]   # name → [x, y, z, visibility]


def extract_pose_keypoints(
    image_input,
    model_complexity: int = 2,
    min_detection_confidence: float = 0.5,
) -> Optional[Keypoints]:
    """
    Run MediaPipe Pose on an image and return a keypoints dict.

    Parameters
    ----------
    image_input : str | bytes | np.ndarray
        - str  → file path
        - bytes → raw image bytes (JPEG / PNG …)
        - ndarray → BGR image (as returned by cv2.imread)

    Returns
    -------
    dict  { landmark_name: [x, y, z, visibility] }  or  None if no pose found.
    """
    # ── Load image ──────────────────────────────────────────────────────────
    if isinstance(image_input, str):
        image_bgr = cv2.imread(image_input)
    elif isinstance(image_input, bytes):
        arr = np.frombuffer(image_input, dtype=np.uint8)
        image_bgr = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    else:
        image_bgr = image_input

    if image_bgr is None:
        return None

    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)

    # ── Run pose detection (classic API if available) ───────────────────────
    if _mp_pose is not None:
        with _mp_pose.Pose(
            static_image_mode=True,
            model_complexity=model_complexity,
            enable_segmentation=False,
            min_detection_confidence=min_detection_confidence,
        ) as pose:
            results = pose.process(image_rgb)

        if not results.pose_landmarks:
            return None

        keypoints: Keypoints = {}
        for idx, name in enumerate(LANDMARK_NAMES):
            lm = results.pose_landmarks.landmark[idx]
            keypoints[name] = [
                float(lm.x),
                float(lm.y),
                float(lm.z),
                float(lm.visibility),
            ]
        return keypoints

    # ── Run pose detection (Tasks API for newer MediaPipe builds) ───────────
    try:
        landmarker = _get_pose_landmarker(min_detection_confidence)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_rgb)
        result = landmarker.detect(mp_image)
    except Exception:
        return None

    if not result.pose_landmarks:
        return None

    first_pose = result.pose_landmarks[0]
    if len(first_pose) < len(LANDMARK_NAMES):
        return None

    keypoints: Keypoints = {}
    for idx, name in enumerate(LANDMARK_NAMES):
        lm = first_pose[idx]
        keypoints[name] = [
            float(lm.x),
            float(lm.y),
            float(lm.z),
            float(getattr(lm, "visibility", 1.0)),
        ]

    return keypoints


def has_sufficient_visibility(
    keypoints: Keypoints,
    required: set = KEY_LANDMARKS,
    min_visibility: float = 0.5,
) -> bool:
    """Return True only if all required landmarks are visible enough."""
    for name in required:
        kp = keypoints.get(name)
        if kp is None or kp[3] < min_visibility:
            return False
    return True
