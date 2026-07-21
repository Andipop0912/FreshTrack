import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../config/branding';

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', icon: 'home', label: 'Home' },
    { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/recipes', icon: 'menu_book', label: 'Recipes' },
    { to: '/profile', icon: 'person', label: 'Profile' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col p-6 bg-emerald-50/60 backdrop-blur-3xl h-screen w-64 border-r border-emerald-100/10 z-50">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-inner">
          <span className="material-symbols-outlined text-on-primary" style={{fontVariationSettings: "'FILL' 1"}}>potted_plant</span>
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-emerald-900 leading-none">{BRAND.name}</h1>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mt-1 font-bold">{BRAND.tagline}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2" aria-label="Sidebar Navigation">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            aria-label={link.label}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-emerald-100/50 text-primary active:scale-[0.98]'
                  : 'text-on-surface-variant/70 hover:text-primary hover:bg-emerald-100/30'
              }`
            }
          >
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform duration-200">{link.icon}</span>
            <span className="font-medium">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Links */}
      <div className="space-y-2 pt-6 border-t border-outline-variant/10">
        <button onClick={handleLogout} aria-label="Logout" className="flex items-center gap-3 text-on-surface-variant/70 hover:text-error px-4 py-2 text-sm transition-colors group w-full cursor-pointer">
          <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">logout</span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

