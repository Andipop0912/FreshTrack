import React from 'react';
import { BRAND } from '../config/branding';

const Footer = () => {
  return (
    <footer className="bg-emerald-50 dark:bg-emerald-950 w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-6 mt-12 border-t border-outline-variant/10">
      <div className="flex flex-col items-center md:items-start gap-1 font-['Plus_Jakarta_Sans'] text-xs uppercase tracking-widest text-emerald-700/50 dark:text-emerald-400/50">
        <p>© 2026 {BRAND.name}. All rights reserved.</p>
        <p className="normal-case text-[10px] tracking-normal font-medium mt-1">{BRAND.tagline} • v{BRAND.version}</p>
      </div>
      <div className="flex gap-8">
        <a className="font-['Plus_Jakarta_Sans'] text-xs uppercase tracking-widest text-emerald-700/50 dark:text-emerald-400/50 hover:text-emerald-800 transition-colors" href="#">Privacy Policy</a>
        <a className="font-['Plus_Jakarta_Sans'] text-xs uppercase tracking-widest text-emerald-700/50 dark:text-emerald-400/50 hover:text-emerald-800 transition-colors" href="#">Terms of Service</a>
        <a className="font-['Plus_Jakarta_Sans'] text-xs uppercase tracking-widest text-emerald-700/50 dark:text-emerald-400/50 hover:text-emerald-800 transition-colors" href="#">Sustainability Report</a>
      </div>
    </footer>
  );
};

export default Footer;
