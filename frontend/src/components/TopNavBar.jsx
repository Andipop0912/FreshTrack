import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../config/branding';

const MALE_AVATAR = "https://lh3.googleusercontent.com/aida-public/AB6AXuAm7Tq5tJmDjej07EXe9gtJnUdbfGXRvPG7yiwy-Iuytp_FoTD22iT2DAoKD3liNjfbUXysdeGayXO1UC8SX9vLhAsS2DALR52eN0s84P4Bz6nFLTzueF_m9iOF1aoSnqwcEXo6yTivIBXAeuShcTvhvryfWdixB1oHxDyyqeFf3N-2sf7lGTVhRSugOJ-1ISUGxQZwjx8TB9J-0-ANVbuCGwmqP5YIfCYMcqVqe1QpX97dwIA88KFNeUk7IHxbvsCD-h10QHrEmRka";

const TopNavBar = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const avatarUrl = user?.avatar || MALE_AVATAR;
  const isHome = pathname === '/';
  return (
    <header className="fixed top-0 right-0 left-64 z-40 bg-emerald-50/80 backdrop-blur-xl flex justify-between items-center px-8 py-4 shadow-[0_8px_32px_0_rgba(44,52,50,0.04)]">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-base" style={{fontVariationSettings: "'FILL' 1"}}>potted_plant</span>
          </div>
          <span className="text-xl font-bold tracking-tighter text-emerald-900">{BRAND.name}</span>
        </div>
        {!isHome && (
          <nav aria-label="Header Navigation" className="hidden md:flex gap-6 font-['Plus_Jakarta_Sans'] tracking-tight leading-relaxed">
            <NavLink to="/" end aria-label="Home" className={({ isActive }) => isActive ? "text-emerald-900 font-semibold border-b-2 border-emerald-700 pb-1" : "text-emerald-700/70 hover:text-emerald-900 transition-colors duration-200"}>Home</NavLink>
            <NavLink to="/dashboard" aria-label="Dashboard" className={({ isActive }) => isActive ? "text-emerald-900 font-semibold border-b-2 border-emerald-700 pb-1" : "text-emerald-700/70 hover:text-emerald-900 transition-colors duration-200"}>Dashboard</NavLink>
            <NavLink to="/recipes" aria-label="Recipes" className={({ isActive }) => isActive ? "text-emerald-900 font-semibold border-b-2 border-emerald-700 pb-1" : "text-emerald-700/70 hover:text-emerald-900 transition-colors duration-200"}>Recipes</NavLink>
          </nav>
        )}
      </div>
      <div className="flex items-center gap-5">
        {!isHome ? (
          <>
            <Link to="/profile" aria-label="User profile" className="w-10 h-10 rounded-full border-2 border-primary-container overflow-hidden active:scale-95 transition-all cursor-pointer hover:ring-4 hover:ring-primary/10">
              <img alt="User profile" className="w-full h-full object-cover" src={avatarUrl} />
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-4 pr-2">
            <Link to="/login" aria-label="Login" className="text-emerald-900 font-bold hover:text-primary transition-colors text-sm px-2">
              Login
            </Link>
            <Link to="/signup" aria-label="Create Account" className="bg-primary text-on-primary px-6 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
              Create Account
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopNavBar;

