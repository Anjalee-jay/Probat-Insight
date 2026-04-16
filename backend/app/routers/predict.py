from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import numpy as np
from PIL import Image
import io
import tensorflow as tf
import joblib
from pathlib import Path
from collections import Counter

# Model directory
MODEL_DIR = Path(__file__).resolve().parent.parent / "ml" / "saved_model"

# Load models
batting_detector = tf.keras.models.load_model(MODEL_DIR / "batting_detector.keras")
batting_model = tf.keras.models.load_model(MODEL_DIR / "batting_model.keras")
rf_model = joblib.load(MODEL_DIR / "rf_stroke.pkl")
xgb_model = joblib.load(MODEL_DIR / "xgb_stroke.pkl")

# Initialize with dummy prediction
dummy_input = np.random.rand(1, 224, 224, 3).astype(np.float32)
_ = batting_detector.predict(dummy_input, verbose=0)
_ = batting_model.predict(dummy_input, verbose=0)

# Feature extractor: second-last layer of batting_model
feature_extractor = tf.keras.Model(inputs=batting_model.inputs, outputs=batting_model.layers[-2].output)

# Stroke classes (placeholder - update based on your training)
stroke_classes = [
    "cover_drive", "straight_drive", "pull_shot", "hook_shot",
    "cut_shot", "square_drive", "sweep_shot", "defensive_shot"
]

router = APIRouter(prefix="/predict", tags=["predict"])

@router.post("")
async def predict_stroke(file: UploadFile = File(...)):
    """
    Predict cricket batting stroke from uploaded image.
    """
    try:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")

        # Read and preprocess image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        image = image.resize((224, 224))
        img_array = np.array(image, dtype=np.float32) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # Check if it's a batting image
        detector_pred = batting_detector.predict(img_array, verbose=0)[0][0]
        if detector_pred < 0.85:
            return JSONResponse(content={"result": "Not a batting image"})

        # CNN prediction
        cnn_pred = batting_model.predict(img_array, verbose=0)[0]
        cnn_class_idx = np.argmax(cnn_pred)
        cnn_stroke = stroke_classes[cnn_class_idx]

        # Extract features for ML models
        features = feature_extractor.predict(img_array, verbose=0)
        features = features.reshape(1, -1)

        # Random Forest prediction
        rf_pred_idx = rf_model.predict(features)[0]
        rf_stroke = stroke_classes[int(rf_pred_idx)]
        rf_prob = rf_model.predict_proba(features)[0]
        rf_conf = float(np.max(rf_prob))

        # XGBoost prediction
        xgb_pred_idx = xgb_model.predict(features)[0]
        xgb_stroke = stroke_classes[int(xgb_pred_idx)]
        xgb_prob = xgb_model.predict_proba(features)[0]
        xgb_conf = float(np.max(xgb_prob))

        # Majority voting
        predictions = [cnn_stroke, rf_stroke, xgb_stroke]
        final_prediction = Counter(predictions).most_common(1)[0][0]

        # Confidence as average of individual confidences
        confidence = (float(np.max(cnn_pred)) + rf_conf + xgb_conf) / 3

        return {
            "cnn": cnn_stroke,
            "rf": rf_stroke,
            "xgb": xgb_stroke,
            "final_prediction": final_prediction,
            "confidence": round(confidence, 4)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")