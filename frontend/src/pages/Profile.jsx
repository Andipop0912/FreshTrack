import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchUser, fetchDeviceStatus, fetchSystem, fetchActivity, updateUserProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../config/branding';


const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const ToggleSwitch = ({ defaultChecked = false, label = "Toggle setting" }) => {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <label className="relative inline-flex items-center cursor-pointer" aria-label={label} onClick={() => setChecked(!checked)}>
      <input type="checkbox" checked={checked} onChange={() => {}} className="sr-only" aria-label={label} />
      <div className={`w-12 h-7 rounded-full transition-all duration-300 ${checked ? 'bg-primary' : 'bg-surface-container-highest'} shadow-inner`}>
        <motion.div
          className="absolute top-[4px] w-[19px] h-[19px] bg-white rounded-full shadow-sm"
          animate={{ left: checked ? '24px' : '4px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
    </label>
  );
};

const Profile = () => {
  const { user: authUser, updateProfile: ctxUpdateProfile } = useAuth();

  // ── State ──
  const [user, setUser] = useState({
    name: authUser?.name || 'Guest User',
    email: authUser?.email || '',
    role: authUser?.role || 'Guest',
    gender: authUser?.gender || 'male',
    avatar: authUser?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAm7Tq5tJmDjej07EXe9gtJnUdbfGXRvPG7yiwy-Iuytp_FoTD22iT2DAoKD3liNjfbUXysdeGayXO1UC8SX9vLhAsS2DALR52eN0s84P4Bz6nFLTzueF_m9iOF1aoSnqwcEXo6yTivIBXAeuShcTvhvryfWdixB1oHxDyyqeFf3N-2sf7lGTVhRSugOJ-1ISUGxQZwjx8TB9J-0-ANVbuCGwmqP5YIfCYMcqVqe1QpX97dwIA88KFNeUk7IHxbvsCD-h10QHrEmRka',
    stats: { items_tracked: 0, expiring_soon: 0, food_saved: '0kg', days_active: 1 }
  });

  useEffect(() => {
    if (authUser) {
      setUser(prev => ({
        ...prev,
        name: authUser.name || prev.name,
        email: authUser.email || prev.email,
        role: authUser.role || prev.role,
        gender: authUser.gender || prev.gender,
        avatar: authUser.avatar || prev.avatar
      }));
      setAge(authUser.age || '');
      setPreferences(authUser.preferences || '');
    }
  }, [authUser]);

  // Extra profile info
  const [age, setAge] = useState(authUser?.age || '');
  const [preferences, setPreferences] = useState(authUser?.preferences || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const [device, setDevice] = useState({
    device_name: 'Raspberry Pi 5',
    device_id: 'FT-8821-X',
    connected: true,
    last_sync: '2m ago',
    vision_sensors: 'ACTIVE',
  });

  const [activityFeed, setActivityFeed] = useState([
    { icon: 'add_shopping_cart', iconBg: 'bg-primary-container', iconTextColor: 'text-on-primary-container', title: 'Spinach detected', sub: 'Drawer A • 14:30 PM' },
    { icon: 'priority_high', iconBg: 'bg-error-container', iconTextColor: 'text-on-error-container', title: 'Alert: Milk expiring', sub: 'Main Ref • 10:15 AM' },
    { icon: 'cloud_done', iconBg: 'bg-tertiary-container', iconTextColor: 'text-on-tertiary-container', title: 'Cloud Sync Complete', sub: 'All Sensors • 08:00 AM' },
  ]);

  // ── Fetch data from API ──
  useEffect(() => {
    document.title = `${BRAND.name} | Profile`;
    const loadProfile = async () => {
      // Fetch user profile (pass email for authenticated requests)
      try {
        const userData = await fetchUser(authUser?.email);
        if (userData) {
          setUser(prev => ({ ...prev, ...userData }));
          if (userData.age) setAge(userData.age);
          if (userData.preferences) setPreferences(userData.preferences);
        }
      } catch (err) {
        console.warn('Profile: could not fetch user:', err.message);
      }

      // Fetch device status
      try {
        const deviceData = await fetchDeviceStatus();
        if (deviceData) setDevice(deviceData);
      } catch (err) {
        console.warn('Profile: could not fetch device status:', err.message);
      }

      // Fetch activity feed
      try {
        const activityData = await fetchActivity();
        if (activityData && activityData.length > 0) {
          const mapped = activityData.map((a) => {
            // Map state → activity icon/style
            let icon = 'add_shopping_cart';
            let iconBg = 'bg-primary-container';
            let iconTextColor = 'text-on-primary-container';

            if (a.state === 'SPOILED' || a.state === 'SPOILING') {
              icon = 'priority_high';
              iconBg = 'bg-error-container';
              iconTextColor = 'text-on-error-container';
            } else if (a.state === 'FRESH') {
              icon = 'add_shopping_cart';
              iconBg = 'bg-primary-container';
              iconTextColor = 'text-on-primary-container';
            }

            return {
              icon,
              iconBg,
              iconTextColor,
              title: `${a.item.charAt(0).toUpperCase() + a.item.slice(1)} — ${a.state}`,
              sub: `Freshness: ${a.freshness}% • ${a.time_ago || ''}`,
            };
          });
          setActivityFeed(mapped);
        }
      } catch (err) {
        console.warn('Profile: could not fetch activity:', err.message);
      }
    };

    loadProfile();
    // Refresh every 10 seconds
    const interval = setInterval(loadProfile, 10000);
    return () => clearInterval(interval);
  }, []);

  // ── Derived stat cards ──
  const stats = [
    { icon: 'inventory', iconBg: 'bg-emerald-100', iconColor: 'text-primary', label: 'Items Tracked', value: String(user.stats?.items_tracked ?? 248) },
    { icon: 'warning', iconBg: 'bg-red-50', iconColor: 'text-error', label: 'Expiring Soon', value: String(user.stats?.expiring_soon ?? 3) },
    { icon: 'recycling', iconBg: 'bg-secondary-container/30', iconColor: 'text-secondary', label: 'Food Saved', value: user.stats?.food_saved ?? '12.4kg' },
    { icon: 'calendar_month', iconBg: 'bg-surface-container', iconColor: 'text-on-surface-variant', label: 'Days Active', value: String(user.stats?.days_active ?? 156) },
  ];

  return (
    <div className="p-8 lg:p-12 mb-12 max-w-7xl mx-auto space-y-10 w-full overflow-x-hidden">
      {/* Section 1: User Identity & Stats */}
      <motion.div {...fadeUp} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Profile Card */}
        <section className="lg:col-span-5 bg-surface-container-lowest rounded-[2.5rem] p-10 backdrop-blur-xl border border-outline-variant/10 flex flex-col items-center text-center shadow-xl shadow-emerald-900/5">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative group cursor-pointer"
          >
            <img alt={`${user.name} Profile`} className="w-36 h-36 rounded-full object-cover ring-[6px] ring-primary-container group-hover:ring-primary transition-all duration-300" src={user.avatar}/>
            <motion.button
              type="button"
              aria-label="Edit user avatar"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className="absolute bottom-1 right-1 bg-primary text-on-primary w-10 h-10 rounded-full flex items-center justify-center border-4 border-surface-container-lowest shadow-lg cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">edit</span>
            </motion.button>
          </motion.div>
          <div className="mt-6">
            <h3 className="text-3xl font-extrabold text-on-surface tracking-tight">{user.name}</h3>
            <p className="text-on-surface-variant font-medium mt-1">{user.email}</p>
            <span className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-primary-container/40 text-on-primary-container rounded-full text-xs font-black uppercase tracking-[0.1em]">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              {user.role}
            </span>
          </div>
          <div className="w-full mt-10 grid grid-cols-2 gap-4">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} className="bg-primary-container text-on-primary-container py-3.5 rounded-2xl font-bold text-sm transition-all hover:bg-primary-fixed shadow-sm cursor-pointer">Edit Profile</motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} className="bg-surface-container-highest text-on-surface py-3.5 rounded-2xl font-bold text-sm transition-all hover:bg-surface-dim cursor-pointer">Security</motion.button>
          </div>
        </section>

        {/* Stat Cards */}
        <section className="lg:col-span-7 grid grid-cols-2 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              whileHover={{ y: -4, boxShadow: '0 12px 32px -8px rgba(1, 109, 68, 0.1)' }}
              className="bg-surface-container-lowest p-8 rounded-[2.5rem] border border-outline-variant/10 flex flex-col justify-between cursor-default transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-2xl ${stat.iconBg} flex items-center justify-center`}>
                <span className={`material-symbols-outlined ${stat.iconColor} text-3xl`}>{stat.icon}</span>
              </div>
              <div className="mt-4">
                <p className="text-on-surface-variant text-sm font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-4xl font-black text-on-surface">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </section>
      </motion.div>

      {/* Section 2: AI Intelligence & Onboarding */}
      <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* AI Insights */}
        <section className="lg:col-span-2 bg-gradient-to-br from-emerald-100/50 to-primary-container/40 rounded-[2.5rem] p-10 border border-primary/20 relative overflow-hidden flex flex-col">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
              </div>
              <h3 className="text-2xl font-black text-emerald-900 tracking-tight">AI Botanical Insights</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { tag: 'Observation', text: 'Frequent Banana Waste Detected' },
                { tag: 'Optimal State', text: 'Ideal Veggie Humidity: 40%' },
                { tag: 'Efficiency', text: 'Average Shelf Life: +2 Days' },
              ].map((insight, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -4, boxShadow: '0 8px 20px -6px rgba(0,0,0,0.08)' }}
                  className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-sm transition-all duration-300 cursor-default"
                >
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">{insight.tag}</p>
                  <p className="text-on-surface font-bold leading-tight">{insight.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-primary/20 rounded-full blur-[80px]"></div>
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px]"></div>
        </section>

        {/* Onboarding Profile */}
        <section className="bg-surface-container-lowest rounded-[2.5rem] p-10 border border-outline-variant/10 shadow-lg shadow-emerald-900/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-on-surface tracking-tight">Onboarding Profile</h3>
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-3">Dietary Type</p>
              <div className="flex flex-wrap gap-2">
                {['Veg', 'Vegan', 'Non-Veg'].map((type, i) => (
                  <motion.button
                    key={type}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-full text-xs font-black cursor-pointer transition-all ${
                      preferences === type.toLowerCase()
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                    onClick={() => setPreferences(type.toLowerCase())}
                  >
                    {type}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Extra Info: Age */}
            <div>
              <p className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-3">Age</p>
              <input
                type="number"
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter your age"
                className="w-full bg-surface-container-highest/50 rounded-2xl px-5 py-3 text-on-surface text-sm border-none focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Save Extra Info */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              disabled={savingProfile}
              onClick={async () => {
                setSavingProfile(true);
                setProfileSaved(false);
                try {
                  await ctxUpdateProfile({ age: parseInt(age) || null, preferences });
                  setProfileSaved(true);
                  setTimeout(() => setProfileSaved(false), 2000);
                } catch (err) {
                  console.error('Save failed:', err);
                } finally {
                  setSavingProfile(false);
                }
              }}
              className="w-full py-3 bg-primary text-on-primary rounded-2xl font-bold text-sm cursor-pointer disabled:opacity-60 transition-all"
            >
              {savingProfile ? 'Saving...' : profileSaved ? '✓ Saved!' : 'Save Profile Info'}
            </motion.button>

            <div>
              <p className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-3">Allergies & Favorites</p>
              <div className="flex flex-wrap gap-2">
                {['Plant-Based', 'Gluten-Free'].map((tag) => (
                  <div key={tag} className="px-4 py-2 bg-secondary-container/50 text-on-secondary-container rounded-full text-xs font-black flex items-center gap-2 border border-secondary/10">
                    <span className="material-symbols-outlined text-xs">check</span>
                    {tag}
                  </div>
                ))}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-surface-container-high text-on-surface-variant rounded-full text-xs font-bold hover:bg-surface-variant transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xs">add</span>
                  Add Tag
                </motion.button>
              </div>
            </div>
          </div>
        </section>
      </motion.div>

      {/* Section 3: Device Control & Settings */}
      <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Smart Alerts */}
        <section className="lg:col-span-4 bg-surface-container-lowest rounded-[2.5rem] p-10 border border-outline-variant/10 space-y-8 shadow-lg shadow-emerald-900/5">
          <h3 className="text-xl font-black text-on-surface tracking-tight">Smart Alerts</h3>
          <div className="space-y-6">
            {[
              { icon: 'notification_important', iconBg: 'bg-red-50', iconColor: 'text-error', label: 'Expiry Alerts', defaultChecked: true },
              { icon: 'device_thermostat', iconBg: 'bg-blue-50', iconColor: 'text-blue-600', label: 'Temperature', defaultChecked: true },
              { icon: 'restaurant_menu', iconBg: 'bg-emerald-50', iconColor: 'text-primary', label: 'Recipe Tips', defaultChecked: false },
            ].map((alert, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${alert.iconBg} flex items-center justify-center`}>
                    <span className={`material-symbols-outlined ${alert.iconColor}`}>{alert.icon}</span>
                  </div>
                  <span className="font-bold text-on-surface">{alert.label}</span>
                </div>
                <ToggleSwitch defaultChecked={alert.defaultChecked} />
              </div>
            ))}
          </div>
        </section>

        {/* Device & Activity Grid */}
        <section className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* System Node */}
          <div className="bg-surface-container-lowest rounded-[2.5rem] p-10 border border-outline-variant/10 flex flex-col justify-between shadow-lg shadow-emerald-900/5">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-on-surface tracking-tight">System Node</h3>
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${device.connected ? 'bg-primary' : 'bg-error'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${device.connected ? 'bg-primary' : 'bg-error'}`}></span>
              </span>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary">memory</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{device.device_name}</span>
                    <span className="text-[10px] text-on-surface-variant font-black">ID: {device.device_id}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest ${
                  device.connected
                    ? 'text-primary bg-primary-container'
                    : 'text-error bg-error-container'
                }`}>{device.connected ? 'Connected' : 'Offline'}</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-on-surface-variant">sync_saved_locally</span>
                  <span className="font-bold text-sm">Last Sync</span>
                </div>
                <span className="text-sm font-black text-on-surface-variant">{device.last_sync}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary">sensors</span>
                  <span className="font-bold text-sm">Vision Sensors</span>
                </div>
                <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest ${
                  device.vision_sensors === 'ACTIVE'
                    ? 'text-primary bg-primary-container'
                    : 'text-amber-700 bg-amber-100'
                }`}>{device.vision_sensors}</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-surface-container-lowest rounded-[2.5rem] p-10 border border-outline-variant/10 shadow-lg shadow-emerald-900/5">
            <h3 className="text-xl font-black text-on-surface tracking-tight mb-8">Recent Activity</h3>
            <div className="space-y-6 relative before:content-[''] before:absolute before:left-5 before:top-2 before:bottom-2 before:w-px before:bg-outline-variant/30">
              {activityFeed.map((activity, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.12 }}
                  className="flex gap-6 items-start relative"
                >
                  <div className={`w-10 h-10 rounded-full ${activity.iconBg} flex items-center justify-center shrink-0 z-10 border-4 border-surface-container-lowest`}>
                    <span className={`material-symbols-outlined ${activity.iconTextColor} text-sm`}>{activity.icon}</span>
                  </div>
                  <div className="pt-1">
                    <p className="font-black text-sm text-on-surface leading-none">{activity.title}</p>
                    <p className="text-xs text-on-surface-variant mt-1 font-medium">{activity.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </motion.div>

      {/* Section 4: Security Footer */}
      <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.3 }} className="bg-emerald-900 text-white rounded-[2.5rem] p-10 overflow-hidden relative shadow-2xl shadow-emerald-950/20">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2">
            <h3 className="text-2xl font-black tracking-tight">Security & Governance</h3>
            <div className="flex items-center gap-2 text-emerald-200/70 text-sm font-bold">
              <span className="material-symbols-outlined text-base">verified_user</span>
              Last security review: 12 days ago
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-emerald-950 rounded-2xl font-black text-sm hover:bg-emerald-50 transition-all shadow-lg cursor-pointer"
            >
              Change Password
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border-2 border-emerald-700 hover:bg-emerald-800/50 rounded-2xl font-black text-sm transition-all cursor-pointer"
            >
              Two-Factor Auth
            </motion.button>
          </div>
        </div>
        <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none scale-150 transform rotate-12">
          <span className="material-symbols-outlined text-[300px]">eco</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
