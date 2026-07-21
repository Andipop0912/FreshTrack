from flask import Flask, jsonify, send_file, request
from flask_cors import CORS
import os
import datetime
import pickle
import joblib
import logging
import random
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from PIL import Image
from ultralytics import YOLO
from database import init_db, create_user, verify_user, get_user_by_email, update_user_profile

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize database (creates tables if not exist)
try:
    init_db()
except Exception as e:
    logger.warning(f"DB init warning: {e}")

IMAGES_PATH = os.path.join(os.path.dirname(__file__), 'images')
MODELS_PATH = os.path.join(os.path.dirname(__file__), 'models')

# ── GLOBAL STATE ──
# The user explicitly requested all dashboard state comes from a single global variable
# NO appending, NO DB accumulating. Completely replaced on every upload.
latest_result = {
    "temperature": 4.0,
    "humidity": 65.0,
    "gas_res": 50000,
    "inventory": [],        # from latest image ONLY
    "recipes_items": [],    # from ALL images in queue (max 5)
    "items": [],            # kept for backward compat (same as inventory)
    "images": [],
    "timestamp": None
}

from ml_engine import FreshTrackEngine
ml_service = FreshTrackEngine()

def run_ml_pipeline(image_path):
    """
    ML Pipeline execution using centralized FreshTrackEngine.
    """
    temp = 4.0
    humidity = 65.0
    items = ml_service.analyze_image(image_path, temp, humidity)
    return items, temp, humidity

# ── INDIAN RECIPE BANK (18 recipes) ───────────────────────
RECIPE_BANK = {
    "tomato": [
        {"title": "Tomato Rasam", "time": "20 mins", "kcal": "120 kcal", "ingredients": ["tomato", "tamarind", "pepper"]},
        {"title": "Tomato Rice", "time": "25 mins", "kcal": "280 kcal", "ingredients": ["tomato", "rice", "spices"]},
        {"title": "Tomato Curry", "time": "30 mins", "kcal": "200 kcal", "ingredients": ["tomato", "onion", "garam masala"]},
        {"title": "Tomato Chutney", "time": "15 mins", "kcal": "90 kcal", "ingredients": ["tomato", "chilli", "garlic"]},
        {"title": "Desi Tomato Soup", "time": "20 mins", "kcal": "150 kcal", "ingredients": ["tomato", "butter", "cream"]},
        {"title": "Tamatar Sabzi", "time": "20 mins", "kcal": "160 kcal", "ingredients": ["tomato", "potato", "cumin"]}
    ],
    "lemon": [
        {"title": "Lemon Rice", "time": "20 mins", "kcal": "250 kcal", "ingredients": ["lemon", "rice", "peanuts"]},
        {"title": "Nimbu Pani", "time": "5 mins", "kcal": "60 kcal", "ingredients": ["lemon", "sugar", "salt"]},
        {"title": "Lemon Pickle", "time": "30 mins", "kcal": "40 kcal", "ingredients": ["lemon", "chilli", "mustard"]},
        {"title": "Lemon Dal", "time": "25 mins", "kcal": "180 kcal", "ingredients": ["lemon", "toor dal", "turmeric"]},
        {"title": "Lemon Sevai", "time": "15 mins", "kcal": "220 kcal", "ingredients": ["lemon", "vermicelli", "curry leaves"]},
        {"title": "Masala Nimbu Soda", "time": "5 mins", "kcal": "50 kcal", "ingredients": ["lemon", "soda", "chaat masala"]}
    ],
    "apple": [
        {"title": "Apple Halwa", "time": "35 mins", "kcal": "350 kcal", "ingredients": ["apple", "ghee", "sugar"]},
        {"title": "Apple Raita", "time": "10 mins", "kcal": "100 kcal", "ingredients": ["apple", "yogurt", "cumin"]},
        {"title": "Apple Chaat", "time": "10 mins", "kcal": "130 kcal", "ingredients": ["apple", "chaat masala", "onion"]},
        {"title": "Apple Kheer", "time": "30 mins", "kcal": "280 kcal", "ingredients": ["apple", "milk", "cardamom"]},
        {"title": "Fruit Chaat", "time": "10 mins", "kcal": "120 kcal", "ingredients": ["apple", "lemon", "chaat masala"]},
        {"title": "Apple Murabba", "time": "40 mins", "kcal": "300 kcal", "ingredients": ["apple", "sugar", "saffron"]}
    ]
}

RECIPE_IMAGES = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCzw2_tvEf2kEME4Ki4gPJwLPOY97TY-5g6mbZ5FyLaPiLGw9NNDVRJE9DTH-t_xLXDtMQSeYn2QZfB3sg9h2jyOGhrPgE5IO2J4jquD_2N-QGKgdQiIISiGG75797zArI3c9xkPCbqApNqPXbrsn2oqSg71eYlh8Ml5vdcWzE8Vatzy7cbA6PGqinWbou7vRE-hWRMagXBPGJEQ14NeJHkDyjhmj-M6r4jL0Wtui_h9Uac_ijya9X0mub4oc25Q3CXI5Ut5EqVxDmI",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC-TQeL4y7JxRlVClWEMK2kaSwpSnTFGc1MYo_N6rsk7BRuGNRREnOariI8_YyQL6f70TUY_6sn2PuzzBbfEq98KZHTcRa4AgGPQB3KUX1upr1KlaZTf7fStS-Pmub3oN7EkGu3bbkXID3Mti4g3SWr3udDkphFH62NTSDk18MsfNL4PkRtL6jXaklPRmNk4IW0cFSk2hxszSG_cfRKNLYkwJWbWFNYezCPb4q0e3z-FVk4zK_cwCDAWS52uI3-02GiktdWuFvC4ev4",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBMQUx3d4L9rnDJDJZTqT8Xzq7NxsOX-r8jNXNM8n4DD6sGbCA0gasIm7EiXU43hy2twnzrNvD-zLOcmVye6CpghyII9hWwBaicOzhXQ-l7RkFmNAXj-VoQzl6jczrmxiJPgHg2mU0Q-35UJBTEgmeTalkvhw-hvgzqMhdy1lUXI4YtsYuuUaJ9cI-8nrzVtFLrXxouGc6IjIYvQdK9nKGeQJiAbnZmkLL29k_sAUjHRsjbkogFDRfRJtEuvejgMB0EDeuoe4jC87tb",
]

def _time_ago(timestamp_str):
    if not timestamp_str:
        return "Never"
    try:
        ts = datetime.datetime.fromisoformat(timestamp_str)
        diff = datetime.datetime.now() - ts
        minutes = int(diff.total_seconds() / 60)
        if minutes < 1:
            return "Just now"
        elif minutes < 60:
            return str(minutes) + "m ago"
        elif minutes < 1440:
            return str(minutes // 60) + "h ago"
        else:
            return str(minutes // 1440) + "d ago"
    except:
        return "Unknown"

# ── IMAGE QUEUE (Global Variable) ──
image_queue = [] # Max 5 images

# ── UNIFIED DATA ENDPOINT ─────────────────────────────────
@app.route('/data', methods=['GET'])
def get_data():
    """Returns LAST processed result from memory. DO NOT run ML again."""
    global latest_result
    # Build images array with isLatest flag
    images_with_flag = []
    for idx, img_obj in enumerate(image_queue):
        images_with_flag.append({
            "url": img_obj["url"],
            "timestamp": img_obj["timestamp"],
            "filename": img_obj.get("filename", ""),
            "isLatest": idx == len(image_queue) - 1
        })
    
    response = {
        "temperature": latest_result.get("temperature", 4.0),
        "humidity": latest_result.get("humidity", 65.0),
        "gas_res": latest_result.get("gas_res", 50000),
        "inventory": latest_result.get("inventory", []),
        "recipes_items": latest_result.get("recipes_items", []),
        "items": latest_result.get("inventory", []),  # backward compat
        "images": images_with_flag,
        "timestamp": latest_result.get("timestamp")
    }
    return jsonify(response)

@app.route('/images/<filename>', methods=['GET'])
def serve_image_public(filename):
    from flask import send_from_directory
    return send_from_directory(IMAGES_PATH, filename)

@app.route("/test")
def test():
    return jsonify({"message": "Backend working"})

RECIPES_IMAGES_PATH = os.path.join(os.path.dirname(__file__), 'RECIPE IMAGES')

@app.route('/api/recipe-image/<path:filename>')
def serve_recipe_image(filename):
    from flask import send_from_directory
    return send_from_directory(RECIPES_IMAGES_PATH, filename)

# ── REAL-TIME SCAN ENDPOINT (Event Based) ──────────────────
@app.route('/upload', methods=['POST'])
@app.route('/api/upload', methods=['POST'])
def handle_upload():
    """Runs ML pipeline and OVERWRITES stored data globally"""
    global latest_result, image_queue
    
    print("Request received")
    print("Files:", request.files)
    
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        os.makedirs(IMAGES_PATH, exist_ok=True)
        ts_now = datetime.datetime.now()
        filename = f"scan_{ts_now.strftime('%Y%m%d_%H%M%S')}.jpg"
        file_path = os.path.join(IMAGES_PATH, filename)
        file.save(file_path)
        
        # 2. IMPLEMENT IMAGE QUEUE (MAX 5)
        img_url = f"http://127.0.0.1:5000/images/{filename}"
        
        image_queue.append({
            "filename": filename,
            "url": img_url,
            "timestamp": ts_now.isoformat()
        })
        
        if len(image_queue) > 5:
            oldest = image_queue.pop(0)
            try:
                old_path = os.path.join(IMAGES_PATH, oldest['filename'])
                if os.path.exists(old_path):
                    os.remove(old_path)
            except Exception as e:
                logger.warning(f"Could not delete old image: {e}")

        # 3A. INVENTORY: ML pipeline on LATEST image ONLY
        inventory_items = []
        last_temp, last_humidity = 4.0, 65.0
        
        latest_img = image_queue[-1]  # newest image
        latest_path = os.path.join(IMAGES_PATH, latest_img['filename'])
        if os.path.exists(latest_path):
            items, last_temp, last_humidity = run_ml_pipeline(latest_path)
            inventory_items = items

        # 3B. RECIPES_ITEMS: ML pipeline on ALL images in queue
        recipes_items = []
        for img_obj in image_queue:
            q_file_path = os.path.join(IMAGES_PATH, img_obj['filename'])
            if os.path.exists(q_file_path):
                items, _, _ = run_ml_pipeline(q_file_path)
                recipes_items.extend(items)
        
        # 4. Build images with isLatest flag
        images_with_flag = []
        for idx, img_obj in enumerate(image_queue):
            images_with_flag.append({
                "url": img_obj["url"],
                "timestamp": img_obj["timestamp"],
                "filename": img_obj.get("filename", ""),
                "isLatest": idx == len(image_queue) - 1
            })
        
        # 5. OVERWRITE SYSTEM
        latest_result = {
            "temperature": last_temp,
            "humidity": last_humidity,
            "inventory": inventory_items,       # from latest image only
            "recipes_items": recipes_items,      # from all images
            "items": inventory_items,            # backward compat
            "images": images_with_flag,
            "timestamp": ts_now.isoformat(),
            "gas_res": 50000
        }
            
        # Response matches the required API format
        response_data = {
            "temperature": last_temp,
            "humidity": last_humidity,
            "inventory": inventory_items,
            "recipes_items": recipes_items,
            "images": images_with_flag
        }
        
        return jsonify(response_data)

    except Exception as e:
        logger.error(f"Upload error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/scan', methods=['POST'])
def perform_scan():
    return handle_upload()

@app.route('/api/reset', methods=['POST'])
def reset_system():
    global latest_result
    
    # 1. Clear memory state
    latest_result = {
        "temperature": 4.0,
        "humidity": 65.0,
        "gas_res": 50000,
        "inventory": [],        
        "recipes_items": [],    
        "items": [],            
        "images": [],
        "timestamp": None
    }
    
    # 2. Clear images from disk
    if os.path.exists(IMAGES_PATH):
        for f in os.listdir(IMAGES_PATH):
            file_path = os.path.join(IMAGES_PATH, f)
            if os.path.isfile(file_path):
                try:
                    os.remove(file_path)
                except Exception as e:
                    logger.error(f"Error removing file {f}: {e}")
                    
    return jsonify({"message": "System reset successful"}), 200

# ── AUTHENTICATION ENDPOINTS ──────────────────────────────

MALE_AVATAR = "https://lh3.googleusercontent.com/aida-public/AB6AXuAm7Tq5tJmDjej07EXe9gtJnUdbfGXRvPG7yiwy-Iuytp_FoTD22iT2DAoKD3liNjfbUXysdeGayXO1UC8SX9vLhAsS2DALR52eN0s84P4Bz6nFLTzueF_m9iOF1aoSnqwcEXo6yTivIBXAeuShcTvhvryfWdixB1oHxDyyqeFf3N-2sf7lGTVhRSugOJ-1ISUGxQZwjx8TB9J-0-ANVbuCGwmqP5YIfCYMcqVqe1QpX97dwIA88KFNeUk7IHxbvsCD-h10QHrEmRka"
FEMALE_AVATAR = "https://thumbs.dreamstime.com/b/female-avatar-icon-flat-design-style-woman-red-shirt-blue-background-minimal-user-portrait-social-media-interface-401816079.jpg"

def _user_response(user):
    """Build a safe user response (never include password)."""
    avatar = FEMALE_AVATAR if user.get('gender', 'male').lower() == 'female' else MALE_AVATAR
    return {
        "name": user['name'],
        "email": user['email'],
        "gender": user.get('gender', 'male'),
        "age": user.get('age'),
        "preferences": user.get('preferences'),
        "avatar": avatar,
        "role": "Primary Administrator"
    }

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    gender = data.get('gender', 'male').strip().lower()
    
    if not name or not email or not password:
        return jsonify({"error": "Name, email and password are required"}), 400
    if gender not in ('male', 'female'):
        gender = 'male'
    
    user = create_user(name, email, password, gender)
    if user is None:
        return jsonify({"error": "Email already registered"}), 409
    
    return jsonify(_user_response(user)), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    email = data.get('email', '').strip()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    user = verify_user(email, password)
    if user is None:
        return jsonify({"error": "Invalid email or password"}), 401
    
    return jsonify(_user_response(user))

@app.route('/api/user/profile', methods=['PUT'])
def update_profile():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    email = data.get('email', '').strip()
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    user = update_user_profile(email, data)
    if user is None:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify(_user_response(user))

# ── DYNAMIC RECIPES ENDPOINT ──────────────────────────────
@app.route('/api/recipes', methods=['GET'])
def get_recommendations():
    global latest_result
    
    # Use recipes_items (from ALL images) for recipe suggestions
    recipe_source = latest_result.get('recipes_items', latest_result.get('items', []))
    recipe_names = [i['name'].lower() for i in recipe_source]
    results = []
    
    for category, recipes in RECIPE_BANK.items():
        if category in recipe_names:
            inv_item = next(i for i in recipe_source if i['name'].lower() == category)
            is_priority = inv_item.get('state') in ('SPOILED', 'SPOILING') or inv_item.get('days_left', 10) <= 2
            
            for recipe in recipes:
                owned = [ing for ing in recipe['ingredients'] if ing in recipe_names]
                
                # Use EXACT recipe name to assign the image from the RECIPE IMAGES folder
                filename = recipe['title'].upper() + ".png"
                
                # Handling the one exception where filename has "LEMON" explicit
                if filename == "MASALA NIMBU SODA.png":
                    filename = "LEMON MASALA SODA.png"
                    
                selected_img = f"http://127.0.0.1:5000/api/recipe-image/{filename}"
                
                results.append({
                    "title": recipe['title'],
                    "time": recipe['time'],
                    "kcal": recipe['kcal'],
                    "img": selected_img,
                    "expiring": is_priority,
                    "shared_count": len(owned),
                    "shared_items": owned
                })

    # Shuffle and return only 4 recipes
    random.shuffle(results)
    return jsonify(results[:4])

# ── MINOR ENDPOINTS ──────────────────────────────────────

@app.route('/api/user', methods=['GET'])
def get_user():
    global latest_result
    items = latest_result.get('items', [])
    alerts_count = sum(1 for i in items if i.get('state') in ('SPOILED', 'SPOILING') or i.get('days_left', 10) <= 2)
    
    # Try to get real user from query param
    email = request.args.get('email', '')
    if email:
        db_user = get_user_by_email(email)
        if db_user:
            avatar = FEMALE_AVATAR if db_user.get('gender', 'male').lower() == 'female' else MALE_AVATAR
            return jsonify({
                "name": db_user['name'],
                "email": db_user['email'],
                "gender": db_user.get('gender', 'male'),
                "age": db_user.get('age'),
                "preferences": db_user.get('preferences'),
                "role": "Primary Administrator",
                "avatar": avatar,
                "stats": {
                    "items_tracked": len(items),
                    "expiring_soon": alerts_count,
                    "food_saved": f"{round(len(items) * 0.05, 1)}kg",
                    "days_active": 1,
                }
            })
    
    # Fallback for unauthenticated requests
    return jsonify({
        "name": "Guest User",
        "email": "",
        "role": "Guest",
        "avatar": MALE_AVATAR,
        "stats": {
            "items_tracked": len(items),
            "expiring_soon": alerts_count,
            "food_saved": f"{round(len(items) * 0.05, 1)}kg",
            "days_active": 1,
        }
    })

@app.route('/api/system', methods=['GET'])
def get_system():
    global latest_result
    return jsonify({
        "pi_connected": True,
        "last_sync": _time_ago(latest_result.get('timestamp')) if latest_result.get('timestamp') else "Never",
        "total_scans": 1 if latest_result.get('timestamp') else 0,
        "total_items_tracked": len(latest_result.get('items', [])),
        "vision_sensors": "ACTIVE"
    })

@app.route('/api/environment', methods=['GET'])
def get_environment():
    global latest_result
    temp = latest_result.get('temperature', 4.0)
    humidity = latest_result.get('humidity', 65.0)
    return jsonify({
        "temp": temp,
        "humidity": humidity,
        "gas_res": latest_result.get('gas_res', 50000),
        "timestamp": latest_result.get('timestamp'),
        "temp_status": "Optimal" if 2 <= temp <= 6 else "Warning",
        "humidity_status": "Perfect" if 40 <= humidity <= 70 else "Warning",
        "last_sync": _time_ago(latest_result.get('timestamp'))
    })

@app.route('/api/inventory', methods=['GET'])
def get_inventory():
    global latest_result
    return jsonify(latest_result.get('inventory', latest_result.get('items', [])))

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    global latest_result
    alerts = [i for i in latest_result.get('items', []) if i.get('state') in ('SPOILED', 'SPOILING') or i.get('days_left', 10) <= 2]
    return jsonify(alerts)

@app.route('/api/scans', methods=['GET'])
def get_scans():
    global latest_result
    return jsonify(latest_result.get('images', []))

@app.route('/api/activity', methods=['GET'])
def get_activity():
    global latest_result
    acts = []
    for i in latest_result.get('items', []):
        acts.append({
            "item": i['name'],
            "state": i.get('state', 'FRESH'),
            "freshness": i['freshness'],
            "days_left": i.get('days_left', 5.0),
            "timestamp": latest_result.get('timestamp'),
            "time_ago": _time_ago(latest_result.get('timestamp'))
        })
    return jsonify(acts)

@app.route('/api/expiring', methods=['GET'])
def get_expiring():
    global latest_result
    exp = []
    for r in sorted(latest_result.get('items', []), key=lambda x: x.get('days_left', 10)):
        days = r.get('days_left', 10)
        if days < 1:
            time_left = str(round(days * 24)) + "h left"
            urgency = "CRITICAL"
        elif days <= 2:
            time_left = str(round(days, 1)) + " days left"
            urgency = "MODERATE"
        else:
            time_left = str(round(days, 1)) + " days left"
            urgency = "STABLE"
        
        exp.append({
            "item": r['name'],
            "freshness": r['freshness'],
            "state": r.get('state', 'FRESH'),
            "days_left": days,
            "time_left": time_left,
            "urgency": urgency
        })
    return jsonify(exp[:4])

@app.route('/api/image/<path:filename>')
def serve_image(filename):
    return send_file(os.path.join(IMAGES_PATH, filename))

@app.route('/api/seed', methods=['POST'])
def seed_demo():
    global latest_result
    latest_result["items"] = [
        {"name": "Apple", "freshness": 0.91, "shelf_life": "11.2 days", "status": "good", "confidence": 0.95, "days_left": 11.2, "state": "FRESH"},
        {"name": "Lemon", "freshness": 0.87, "shelf_life": "9.6 days", "status": "good", "confidence": 0.91, "days_left": 9.6, "state": "FRESH"},
    ]
    latest_result["timestamp"] = datetime.datetime.now().isoformat()
    return jsonify({"message": "Demo data seeded!", "data": latest_result})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)