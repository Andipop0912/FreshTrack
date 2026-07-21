const API_BASE = "http://127.0.0.1:5000";

/**
 * Reset backend system (clears images and analytics)
 */
export const resetSystem = async () => {
  try {
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon(`${API_BASE}/api/reset`);
    } else {
      await fetch(`${API_BASE}/api/reset`, { method: 'POST' });
    }
  } catch (err) {
    console.error("Failed to reset system:", err);
  }
};

// ── AUTHENTICATION ───────────────────────────────────────

/**
 * Register a new user
 */
export const registerUser = async (name, email, password, gender) => {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, gender }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data;
};

/**
 * Login an existing user
 */
export const loginUser = async (email, password) => {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
};

/**
 * Update user profile (age, preferences, etc.)
 */
export const updateUserProfile = async (email, updates) => {
  const res = await fetch(`${API_BASE}/api/user/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, ...updates }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Profile update failed');
  return data;
};

// ── DATA ENDPOINTS ───────────────────────────────────────

/**
 * Unified /data endpoint — returns temperature, humidity, items, images, alerts, system
 */
export const fetchData = async () => {
  const res = await fetch(`${API_BASE}/data`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
};

/**
 * Upload an image for real-time AI scanning
 */
export const uploadScan = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error('Scan upload failed');
  const data = await response.json();
  console.log("Upload Response Data:", data);
  return data;
};

/**
 * Environment-only endpoint
 */
export const fetchEnvironment = async () => {
  const res = await fetch(`${API_BASE}/api/environment`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
};

/**
 * Inventory items from latest scan
 */
export const fetchInventory = async () => {
  const res = await fetch(`${API_BASE}/api/inventory`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
};

/**
 * Priority alerts (spoiling / expiring items)
 */
export const fetchAlerts = async () => {
  const res = await fetch(`${API_BASE}/api/alerts`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
};

/**
 * Recent scan captures
 */
export const fetchScans = async () => {
  const res = await fetch(`${API_BASE}/api/scans`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
};

/**
 * Expiring-soon items (for recipes page)
 */
export const fetchExpiring = async () => {
  const res = await fetch(`${API_BASE}/api/expiring`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
};

/**
 * Dynamic recipe recommendations (Backend-powered)
 */
export const fetchRecipes = async () => {
  const res = await fetch(`${API_BASE}/api/recipes`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
};

/**
 * System status
 */
export const fetchSystem = async () => {
  const res = await fetch(`${API_BASE}/api/system`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
};

/**
 * Recent activity feed
 */
export const fetchActivity = async () => {
  const res = await fetch(`${API_BASE}/api/activity`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
};

/**
 * User profile — fetches from backend with optional email for authenticated users
 */
export const fetchUser = async (email) => {
  try {
    const url = email ? `${API_BASE}/api/user?email=${encodeURIComponent(email)}` : `${API_BASE}/api/user`;
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    return res.json();
  } catch {
    return null;
  }
};

/**
 * Device status (placeholder — returns mock until backend implements)
 */
export const fetchDeviceStatus = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/device-status`);
    if (!res.ok) throw new Error();
    return res.json();
  } catch {
    // Fallback placeholder until backend implements /api/device-status
    return {
      device_name: "Raspberry Pi 5",
      device_id: "FT-8821-X",
      connected: true,
      last_sync: "2m ago",
      vision_sensors: "ACTIVE",
    };
  }
};

/**
 * Resolve a backend image path to a full URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `${API_BASE}/api/image/${imagePath}`;
};
