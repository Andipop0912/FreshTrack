import os
import numpy as np
from PIL import Image
import tensorflow as tf
import joblib
import logging
import uuid
from ultralytics import YOLO

logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(__file__)
MODELS_PATH = os.path.join(BASE_DIR, 'models')

class FreshTrackEngine:
    def __init__(self):
        self.yolo_model = None
        self.freshness_model = None
        self.shelf_model = None

    def _load_models(self):
        if self.yolo_model is None:
            model_path = os.path.join(MODELS_PATH, 'best_v5.pt')
            self.yolo_model = YOLO(model_path)
            logger.info("Loaded YOLO Object Detection model")

        if self.freshness_model is None:
            model_path = os.path.join(MODELS_PATH, 'best_freshness_model_v10.keras')
            self.freshness_model = tf.keras.models.load_model(model_path)
            logger.info("Loaded Keras Freshness model")

        if self.shelf_model is None:
            model_path = os.path.join(MODELS_PATH, 'shelf_life_model_v3.pkl')
            self.shelf_model = joblib.load(model_path)
            logger.info("Loaded Shelf Life model")

    def analyze_image(self, image_path, temperature=4.0, humidity=65.0):
        self._load_models()
        
        if not os.path.exists(image_path):
            logger.error(f"Image not found: {image_path}")
            return []

        try:
            results = []
            original_img = Image.open(image_path).convert('RGB')
            w, h = original_img.size
            
            # 1. Run YOLO detection
            det_results = self.yolo_model(image_path)
            r = det_results[0]
            
            for box in r.boxes:
                # 2. Extract bounding boxes
                x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                class_id = int(box.cls[0].item())
                item_name = self.yolo_model.names[class_id].lower()
                conf = float(box.conf[0].item())
                
                # filter very low confidences implicitly, maybe? Let's leave no bounds except the YOLO automatic ones.
                if conf < 0.25:
                    continue
                
                # 3. Crop each detected object
                crop_img = original_img.crop((x1, y1, x2, y2))
                
                freshness_val = "Not detected"
                shelf_life_val = "Not detected"
                status = "UNKNOWN"
                
                try:
                    # 4. For EACH crop: resize (96), normalize, expand dims
                    crop_resized = crop_img.resize((96, 96))
                    img_array = np.array(crop_resized, dtype=np.float32) / 255.0
                    img_array = np.expand_dims(img_array, axis=0)
                    
                    # Pass to freshness model. Result represents SPOILAGE probability (0.0 to 1.0)
                    fresh_pred = self.freshness_model.predict(img_array, verbose=0)
                    freshness_raw = float(fresh_pred[0][0])
                    # Invert to calculate FRESHNESS
                    freshness_pct = round((1.0 - freshness_raw) * 100, 1)
                    freshness_val = freshness_pct
                    
                    # Base Environmental assumption for missing sensor
                    gas_res = 50000
                    
                    # Pass to shelf model: [class_id, freshness_pct, temp, humidity, gas_res]
                    # Note: The Random Forest model predicts MAXIMUM optimal shelf life based on environment & class.
                    shelf_pred = self.shelf_model.predict([[class_id, freshness_pct, temperature, humidity, gas_res]])
                    base_shelf_life = max(0.0, float(shelf_pred[0]))
                    
                    # Remaining days = Base Shelf Life * (Freshness / 100)
                    shelf_life_days = base_shelf_life * (max(0.1, freshness_pct) / 100.0)
                    shelf_life_val = round(shelf_life_days, 1)
                    
                    # Status logic (aligned with user's exact freshness thresholds)
                    if freshness_pct < 30.0:
                        status = "SPOILED"
                    elif freshness_pct <= 70.0:
                        status = "SPOILING"
                    else:
                        status = "FRESH"
                        
                except Exception as e:
                    logger.warning(f"Prediction failed for {item_name}: {e}")
                    
                unique_id = str(uuid.uuid4())
                
                # 6. Output format specification
                results.append({
                    "id": unique_id,
                    "name": item_name.capitalize(),
                    "freshness": freshness_val,
                    "shelf_life": shelf_life_val,
                    "days_left": shelf_life_val,
                    "status": status,
                    "confidence": round(conf, 2),
                    # Extra fields mapped nicely for front-end history
                    "state": status
                })
                
            return results

        except Exception as e:
            logger.error(f"Inference error: {e}")
            return []

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    engine = FreshTrackEngine()
    print("Engine initialized. Ready for analyze_image call.")
