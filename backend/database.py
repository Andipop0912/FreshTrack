import sqlite3
import os
import bcrypt

DB_PATH = os.path.join(os.path.dirname(__file__), 'db', 'freshtrack.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_db()
    
    # Users table — authentication & profile
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT NOT NULL,
            email       TEXT NOT NULL UNIQUE,
            password    TEXT NOT NULL,
            gender      TEXT NOT NULL DEFAULT 'male',
            age         INTEGER,
            preferences TEXT
        )
    """)

    # Scans table — one row per capture
    conn.execute("""
        CREATE TABLE IF NOT EXISTS scans (
            scan_id    INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp  TEXT NOT NULL,
            image_path TEXT NOT NULL,
            temp       REAL,
            humidity   REAL,
            gas_res    REAL
        )
    """)
    
    # Detections table — one row per item per scan
    conn.execute("""
        CREATE TABLE IF NOT EXISTS detections (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            scan_id     INTEGER NOT NULL,
            item        TEXT NOT NULL,
            confidence  REAL,
            freshness   REAL,
            state       TEXT,
            days_left   REAL,
            FOREIGN KEY (scan_id) REFERENCES scans(scan_id)
        )
    """)
    
    conn.commit()
    conn.close()
    print("Database initialized!")

# ── USER CRUD ──────────────────────────────────────────────

def create_user(name, email, password, gender='male'):
    """Register a new user with bcrypt-hashed password."""
    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO users (name, email, password, gender) VALUES (?, ?, ?, ?)",
            (name, email, hashed_pw.decode('utf-8'), gender)
        )
        conn.commit()
        user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        conn.close()
        return dict(user)
    except sqlite3.IntegrityError:
        conn.close()
        return None  # Email already exists

def get_user_by_email(email):
    """Fetch a user row by email."""
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()
    return dict(user) if user else None

def verify_user(email, password):
    """Verify login credentials using bcrypt."""
    user = get_user_by_email(email)
    if not user:
        return None
    if bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        return user
    return None

def update_user_profile(email, data):
    """Update extra profile fields (age, preferences)."""
    conn = get_db()
    fields = []
    values = []
    for key in ('age', 'preferences', 'name', 'gender'):
        if key in data:
            fields.append(f"{key} = ?")
            values.append(data[key])
    if not fields:
        conn.close()
        return None
    values.append(email)
    conn.execute(f"UPDATE users SET {', '.join(fields)} WHERE email = ?", values)
    conn.commit()
    user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()
    return dict(user) if user else None

def insert_scan(timestamp, image_path, temp, humidity, gas_res):
    conn = get_db()
    cursor = conn.execute("""
        INSERT INTO scans (timestamp, image_path, temp, humidity, gas_res)
        VALUES (?, ?, ?, ?, ?)
    """, (timestamp, image_path, temp, humidity, gas_res))
    scan_id = cursor.lastrowid
    
    # Keep only last 5 scans
    conn.execute("""
        DELETE FROM scans 
        WHERE scan_id NOT IN (
            SELECT scan_id FROM scans 
            ORDER BY timestamp DESC 
            LIMIT 5
        )
    """)
    # Delete detections for deleted scans
    conn.execute("""
        DELETE FROM detections 
        WHERE scan_id NOT IN (
            SELECT scan_id FROM scans
        )
    """)
    
    conn.commit()
    conn.close()
    return scan_id

def insert_detection(scan_id, item, confidence, freshness, state, days_left):
    conn = get_db()
    conn.execute("""
        INSERT INTO detections 
        (scan_id, item, confidence, freshness, state, days_left)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (scan_id, item, confidence, freshness, state, days_left))
    conn.commit()
    conn.close()

def get_latest_scans(limit=5):
    conn = get_db()
    scans = conn.execute("""
        SELECT * FROM scans 
        ORDER BY timestamp DESC 
        LIMIT ?
    """, (limit,)).fetchall()
    conn.close()
    return [dict(s) for s in scans]

def get_latest_environment():
    conn = get_db()
    row = conn.execute("""
        SELECT temp, humidity, gas_res, timestamp 
        FROM scans 
        ORDER BY timestamp DESC 
        LIMIT 1
    """).fetchone()
    conn.close()
    return dict(row) if row else None

def get_all_inventory():
    conn = get_db()
    rows = conn.execute("""
        SELECT d.item, d.confidence, d.freshness, 
               d.state, d.days_left, s.timestamp
        FROM detections d
        JOIN scans s ON d.scan_id = s.scan_id
        WHERE s.scan_id = (
            SELECT scan_id FROM scans 
            ORDER BY timestamp DESC LIMIT 1
        )
        ORDER BY d.freshness ASC
    """).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_alerts():
    conn = get_db()
    rows = conn.execute("""
        SELECT d.item, d.freshness, d.state, 
               d.days_left, s.timestamp
        FROM detections d
        JOIN scans s ON d.scan_id = s.scan_id
        WHERE s.scan_id = (
            SELECT scan_id FROM scans 
            ORDER BY timestamp DESC LIMIT 1
        )
        AND (d.state = 'SPOILED' OR d.state = 'SPOILING' 
             OR d.days_left <= 2)
        ORDER BY d.days_left ASC
    """).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_recent_activity(limit=5):
    conn = get_db()
    rows = conn.execute("""
        SELECT d.item, d.state, d.freshness, 
               d.days_left, s.timestamp
        FROM detections d
        JOIN scans s ON d.scan_id = s.scan_id
        ORDER BY s.timestamp DESC
        LIMIT ?
    """, (limit,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

if __name__ == "__main__":
    init_db()