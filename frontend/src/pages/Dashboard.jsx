import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { fetchData, fetchScans, fetchAlerts, fetchSystem, getImageUrl, uploadScan } from '../services/api';
import { BRAND } from '../config/branding';


const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

// Fallback capture images when backend has no images
const FALLBACK_CAPTURES = [
  { label: 'SHELF A-1', time: '2h ago', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAk4CwjEhmT-wZrdE1wmcvQq_2RwWSG-C8kRQgFR2eqFY7JLZBbhqyrMkCcqmH0cIxdlRYtMI6QWTuec2RPe6GwtTZXy8fha_udC_fqcUCryK77h3ZQpA532JjUuUOnc4oZFTX8C3IP6d8q3s1DaHatn8f2I7fgp-jpqQe46IjXyp7DaVtl_PRHx-nHm_xzGS2MKMZcimSCQ-gUFvG37e_mDu_Wq6n3HEAXdEyfQ6kj9dthcsFLH0Y7eUFY3cITjWIiw1rfs5Mn0fv' },
  { label: 'DOOR BACK', time: '4h ago', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXweD6yz7sXvtiZ_j-aZ5yvceNZ3BY4Xl8O0XhgJQhPmkhm6CLUfjf6IM4LfCRh36DB9FY2Sc5zbbav7ZhsvRqvDuxAz2ILIWHw1cQDfhGzs1U5r_HlPzumCpMhAcaDxyIb9eKv3GrmN14swkS4-e3ZYUOnoIYWnlQ5H-g9gOX9ZNDaROufICMBuumVltNyjwN6X6KHhi235CPWdfyU5VNFYuq8yMr2B9HZ70es-UYkNfpRf3glY7fEbVl8YNpqR7AHgAEvvfrU-vf' },
  { label: 'CRISPER', time: '6h ago', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaxe8IsNIksWAUG2BtQ2wgHDkzEgVBk3FhAKh3t_Ew18h6v1GUugo4580CZAdx19rw1eK3JJumRDtVWc3GrjT3CTw5i48SoR_FMPsLT8D25COuY52a8u31-s-aArcGf6hKFfZvfAqQVAT-g_KI-SPxRAlXqe0qgY-QcSshscp1mGByirTtRXlmCy8lObkTDb7AC8qmQyksG8xXvLqDYusz4rktMZ1NrqDBAE_paE8TwTqaf9YwpRJbA8o3aSSJJoxPSe_1QRxfM3TW' },
  { label: 'SHELF B-2', time: 'Yesterday', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-TQeL4y7JxRlVClWEMK2kaSwpSnTFGc1MYo_N6rsk7BRuGNRREnOariI8_YyQL6f70TUY_6sn2PuzzBbfEq98KZHTcRa4AgGPQB3KUX1upr1KlaZTf7fStS-Pmub3oN7EkGu3bbkXID3Mti4g3SWr3udDkphFH62NTSDk18MsfNL4PkRtL6jXaklPRmNk4IW0cFSk2hxszSG_cfRKNLYkwJWbWFNYezCPb4q0e3z-FVk4zK_cwCDAWS52uI3-02GiktdWuFvC4ev4' },
  { label: 'FREEZER', time: 'Yesterday', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMQUx3d4L9rnDJDPZTqT8Xzq7NxsOX-r8jNXNM8n4DD6sGbCA0gasIm7EiXU43hy2twnzrNvD-zLOcmVye6CpghyII9hWwBaicOzhXQ-l7RkFmNAXj-VoQzl6jczrmxiJPgHg2mU0Q-35UJBTEgmeTalkvhw-hvgzqMhdy1lUXI4YtsYuuUaJ9cI-8nrzVtFLrXxouGc6IjIYvQdK9nKGeQJiAbnZmkLL29k_sAUjHRsjbkogFDRfRJtEuvejgMB0EDeuoe4jC87tb' },
];

// Map item name → material icon
const ICON_MAP = {
  apple: 'nutrition',
  tomato: 'eco',
  lemon: 'light_mode',
  banana: 'nutrition',
  spinach: 'eco',
  milk: 'water_drop',
  egg: 'egg',
  eggs: 'egg',
  yogurt: 'lunch_dining',
  avocado: 'nutrition',
  butter: 'bakery_dining',
};

const getItemIcon = (name) => {
  const key = name.toLowerCase();
  for (const [keyword, icon] of Object.entries(ICON_MAP)) {
    if (key.includes(keyword)) return icon;
  }
  return 'inventory_2';
};

const getStatusStyles = (status) => {
  switch (status) {
    case 'SPOILED':
      return { label: 'SPOILED', statusColor: 'text-error', dotColor: 'bg-error', iconBg: 'bg-red-50', iconColor: 'text-error' };
    case 'SPOILING':
      return { label: 'SPOILING', statusColor: 'text-amber-600', dotColor: 'bg-amber-500', iconBg: 'bg-amber-50', iconColor: 'text-amber-700' };
    case 'UNKNOWN':
      return { label: 'UNKNOWN', statusColor: 'text-on-surface-variant', dotColor: 'bg-surface-variant', iconBg: 'bg-surface-container', iconColor: 'text-on-surface-variant' };
    case 'FRESH':
    default:
      return { label: 'FRESH', statusColor: 'text-primary', dotColor: 'bg-primary', iconBg: 'bg-emerald-100', iconColor: 'text-primary' };
  }
};

const Dashboard = () => {
  // ── State ──
  const [temperature, setTemperature] = useState(0);
  const [humidity, setHumidity] = useState(0);
  const [items, setItems] = useState([]);
  const [captures, setCaptures] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [system, setSystem] = useState(null);
  const [lastSync, setLastSync] = useState('—');
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const intervalRef = useRef(null);
  const fileInputRef = useRef(null);

  // ── Data fetching ──
  // ── Data logic ──
  const applyData = (data) => {
    setTemperature(data.temperature ?? 0);
    setHumidity(data.humidity ?? 0);
    // Use inventory (latest image only) for display; fallback to items for backward compat
    setItems(data.inventory ?? data.items ?? []);

    if (data.images && data.images.length > 0) {
      // Data.images can now be an array of image objects with isLatest flag
      const apiCaptures = data.images.map((img, i) => {
        // Handle queue object containing full URL, filename and timestamp
        const labelStr = img.filename ? img.filename.replace(/[._]/g, ' ').toUpperCase().slice(0, 12) : `SCAN ${i + 1}`;
        const timeStr = img.timestamp ? new Date(img.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : img.time_ago || 'Just now';
        return {
          label: labelStr,
          time: timeStr,
          img: img.url || getImageUrl(img.path),
          isLatest: img.isLatest === true
        };
      });
      setCaptures(apiCaptures.reverse()); // Show newest first
    }

    const inventoryItems = data.inventory ?? data.items ?? [];
    const criticalItems = inventoryItems.filter(i => i.status === 'SPOILED');
    setAlerts(criticalItems);
  };

  const loadData = async () => {
    try {
      const data = await fetchData();
      applyData(data);
    } catch (err) {
      console.warn('Dashboard fetch failed:', err.message);
    }

    try {
      const sys = await fetchSystem();
      setSystem(sys);
      setLastSync(sys.last_sync || '—');
    } catch { /* Non-critical */ }
  };

  // ── Lifecycle: initial fetch once ──
  useEffect(() => {
    document.title = `${BRAND.name} | Dashboard`;
    loadData();
    // Polling removed per senior debugging requirement
  }, []);

  // ── Manual Scan Handlers ──
  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      // FIX: Event-based update. Response contains full dashboard state.
      const newData = await uploadScan(file);
      // Wait for complete data sync because upload result contains aggregated final data
      await loadData();
      
      // Still fetch system status in background
      const sys = await fetchSystem();
      setSystem(sys);
      setLastSync(sys.last_sync || '—');
    } catch (err) {
      console.error('Scan failed:', err);
      alert('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
      e.target.value = '';
    }
  };

  // ── Derived values ──
  const tempStatus = temperature >= 2 && temperature <= 6 ? 'Optimal' : 'Warning';
  const humidityStatus = humidity >= 40 && humidity <= 70 ? 'Perfect' : humidity > 70 ? 'High' : 'Low';
  const totalItems = items.length;
  const visibleAlerts = alerts.filter((_, i) => !dismissedAlerts.has(i));

  return (
    <section className="pt-8 px-8 lg:px-12 pb-12 relative overflow-hidden">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        aria-label="Upload inventory scan image"
        className="hidden"
      />

      {/* Image Modal overlay for click-to-zoom */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer transition-opacity duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-5xl max-h-full cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button"
              aria-label="Close zoomed image modal"
              className="absolute -top-4 -right-4 md:-top-6 md:-right-6 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-colors z-10 cursor-pointer" 
              onClick={() => setSelectedImage(null)}
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
            <img 
              src={selectedImage} 
              alt="Zoomed Capture" 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-outline-variant/30" 
            />
          </div>
        </div>
      )}

      {/* Analysis Overlay */}
      {isAnalyzing && (
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
        >
          <div className="relative w-64 h-64 mb-8 rounded-3xl overflow-hidden border-4 border-primary/20 bg-surface-container-low shadow-2xl">
            {/* Scanning Line Animation */}
            <motion.div
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-primary/60 shadow-[0_0_15px_rgba(1,109,68,0.8)] z-10"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-7xl text-primary/30 animate-pulse">vision_performance</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>
          </div>
          <h2 className="text-3xl font-black text-on-surface tracking-tighter mb-2">Analyzing Inventory</h2>
          <p className="text-on-surface-variant font-medium max-w-xs mx-auto">
            Our AI is detecting items, classifying freshness, and predicting shelf life...
          </p>
          <div className="mt-10 flex gap-2">
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-2.5 h-2.5 rounded-full bg-primary"
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Recent Captures ── */}
      <motion.div {...fadeUp} className="mb-10">
        <div className="flex justify-between items-end mb-5">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tighter text-on-surface">Recent Captures</h2>
            <p className="text-on-surface-variant text-sm mt-1">Visual logs from internal sensors</p>
          </div>
          <motion.button
            whileHover={{ x: 4 }}
            className="flex items-center gap-1 text-primary font-semibold text-sm cursor-pointer"
          >
            View History
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </motion.button>
        </div>

        {/* Capture Strip */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar p-2 -m-2">
          {captures.length > 0 ? (
            captures.map((cap, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                whileHover={{ y: -4, boxShadow: '0 12px 28px -8px rgba(0,0,0,0.15)' }}
                className={`flex-shrink-0 w-[170px] h-[140px] rounded-2xl overflow-hidden relative group cursor-pointer ${cap.isLatest ? 'ring-4 ring-primary ring-offset-2 ring-offset-surface shadow-lg shadow-primary/20' : ''}`}
                onClick={() => setSelectedImage(cap.img)}
              >
                <img
                  src={cap.img}
                  alt={cap.label}
                  className="w-full h-full object-cover brightness-[0.45] group-hover:brightness-[0.55] group-hover:scale-110 transition-all duration-500"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-3 pointer-events-none">
                  <span className="text-white font-bold text-xs tracking-wider uppercase">{cap.label}</span>
                  <span className="text-white/70 text-[11px] font-medium">{cap.time}</span>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full h-[140px] rounded-2xl border-2 border-dashed border-outline-variant/30 bg-surface-container-lowest flex flex-col items-center justify-center text-on-surface-variant gap-2"
            >
              <span className="material-symbols-outlined text-3xl opacity-50">hide_image</span>
              <span className="font-semibold text-sm">No images uploaded</span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ── Environment + Priority Alerts ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10"
      >
        {/* Environment Panel */}
        <div>
          <h3 className="text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] mb-4">Environment</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Temperature Card */}
            <motion.div
              whileHover={{ y: -3 }}
              className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-container/50 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-primary text-xl">thermostat</span>
              </div>
              <span className="text-3xl font-extrabold tracking-tighter text-on-surface">{temperature}°C</span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">Temperature</span>
              <span className={`mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                tempStatus === 'Optimal'
                  ? 'bg-primary-container/40 text-primary'
                  : 'bg-error-container/40 text-error'
              }`}>{tempStatus}</span>
            </motion.div>

            {/* Humidity Card */}
            <motion.div
              whileHover={{ y: -3 }}
              className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary-container/50 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-secondary text-xl">humidity_percentage</span>
              </div>
              <span className="text-3xl font-extrabold tracking-tighter text-on-surface">{humidity}%</span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">Humidity</span>
              <span className={`mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                humidityStatus === 'Perfect'
                  ? 'bg-secondary-container/40 text-secondary'
                  : 'bg-amber-100/40 text-amber-700'
              }`}>{humidityStatus}</span>
            </motion.div>
          </div>

          {/* System Status */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-surface-container-lowest rounded-2xl px-5 py-4 border border-outline-variant/10 flex items-center gap-3 transition-all"
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
              visibleAlerts.length === 0 ? 'bg-primary/10' : 'bg-error/10'
            }`}>
              <span
                className={`material-symbols-outlined text-lg ${visibleAlerts.length === 0 ? 'text-primary' : 'text-error'}`}
                style={{fontVariationSettings: "'FILL' 1"}}
              >
                {visibleAlerts.length === 0 ? 'check_circle' : 'error'}
              </span>
            </div>
            <div>
              <p className="font-bold text-on-surface text-sm">
                {visibleAlerts.length === 0 ? 'System Optimal' : `${visibleAlerts.length} Alert${visibleAlerts.length > 1 ? 's' : ''} Active`}
              </p>
              <p className="text-xs text-on-surface-variant">
                {visibleAlerts.length === 0
                  ? 'No anomalies detected in last 24h'
                  : `${visibleAlerts.length} item${visibleAlerts.length > 1 ? 's' : ''} need${visibleAlerts.length === 1 ? 's' : ''} attention`}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Priority Alerts Panel */}
        <div>
          <h3 className="text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] mb-4">Priority Alerts</h3>
          <div className="space-y-4">
            {visibleAlerts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-surface-container-lowest rounded-2xl px-5 py-4 border border-outline-variant/10 flex items-center gap-4 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-on-surface text-sm">All clear!</p>
                  <p className="text-xs text-on-surface-variant">No critical items detected</p>
                </div>
              </motion.div>
            ) : (
              visibleAlerts.map((item, idx) => (
                <motion.div
                  key={`${item.name}-${idx}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + idx * 0.15 }}
                  whileHover={{ x: 4 }}
                  className="bg-surface-container-lowest rounded-2xl px-5 py-4 border border-outline-variant/10 flex items-center gap-4 group transition-all duration-300 hover:shadow-md cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-error">warning</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-on-surface text-sm">{item.name} — {item.shelf_life} remaining</p>
                    <p className="text-xs text-on-surface-variant">Freshness: {item.freshness}% • {item.state}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDismissedAlerts(prev => new Set([...prev, idx]))}
                    className="px-4 py-1.5 bg-primary text-on-primary rounded-full text-xs font-bold cursor-pointer shadow-sm shadow-primary/20"
                  >
                    DISMISS
                  </motion.button>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Detected Inventory ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold tracking-tighter text-on-surface">Detected Inventory</h2>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1.5 bg-surface-container-high rounded-full text-[10px] font-black text-on-surface uppercase tracking-wider">{totalItems} items total</span>
            <span className="text-xs text-on-surface-variant font-medium">Last synced: {lastSync}</span>
          </div>
        </div>

        {/* Inventory Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item, i) => {
            const styles = getStatusStyles(item.status);
            const icon = getItemIcon(item.name);
            return (
              <motion.div
                key={`${item.name}-${i}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.06 }}
                whileHover={{ y: -5, boxShadow: '0 10px 24px -6px rgba(1, 109, 68, 0.12)' }}
                className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/10 flex flex-col items-center text-center cursor-pointer transition-all duration-300 group"
              >
                <div className="relative mb-3">
                  <div className={`w-12 h-12 rounded-2xl ${styles.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <span className={`material-symbols-outlined ${styles.iconColor} text-2xl`}>{icon}</span>
                  </div>
                  {/* Status dot */}
                  <span className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full ${styles.dotColor} border-2 border-surface-container-lowest`}></span>
                </div>
                <p className="font-bold text-on-surface text-sm leading-tight mb-1">{item.name}</p>
                <span className={`text-[10px] font-black ${styles.statusColor} uppercase tracking-widest`}>
                  {item.freshness && item.freshness !== 'Not detected' ? `${item.freshness}% \u2022 ` : ''}{styles.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Floating Action Button (Camera) ── */}
      <motion.button
        whileHover={{ scale: 1.1, boxShadow: '0 12px 32px -6px rgba(1, 109, 68, 0.4)' }}
        whileTap={{ scale: 0.9 }}
        onClick={handleCameraClick}
        disabled={isAnalyzing}
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-on-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30 cursor-pointer z-40 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="material-symbols-outlined text-2xl">photo_camera</span>
      </motion.button>
    </section>
  );
};

export default Dashboard;
