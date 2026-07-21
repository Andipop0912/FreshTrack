import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BRAND } from '../config/branding';


const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const staggerChildren = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } }
};

const childFade = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

const Landing = () => {
  useEffect(() => {
    document.title = `${BRAND.name} | Home`;
  }, []);

  return (
    <div className="text-on-surface bg-surface selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      {/* TopNavBar Shell */}
      <nav className="fixed top-0 w-full z-50 bg-emerald-50/80 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(44,52,50,0.04)] flex justify-between items-center px-8 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-base" style={{fontVariationSettings: "'FILL' 1"}}>potted_plant</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tighter text-emerald-900 leading-none">{BRAND.name}</span>
            <span className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">{BRAND.tagline}</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8 font-['Plus_Jakarta_Sans'] tracking-tight leading-relaxed">
          {/* Navigation links hidden on landing page */}
        </div>
        <div className="flex items-center gap-4 pr-2">
          <Link to="/login" className="text-emerald-900 font-bold hover:text-primary transition-colors text-sm px-2">
            Login
          </Link>
          <Link to="/signup" className="bg-primary text-on-primary px-6 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            Create Account
          </Link>
        </div>
      </nav>

      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative px-8 py-20 lg:py-32 overflow-hidden">
          <motion.div {...fadeUp} className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="z-10">
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-block px-4 py-1.5 mb-6 text-on-primary-fixed-variant bg-tertiary-container rounded-full text-xs font-semibold tracking-widest uppercase"
              >
                {BRAND.badge}
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="text-7xl lg:text-9xl font-bold tracking-tighter text-emerald-900 mb-6 whitespace-nowrap"
              >
                {BRAND.name}
              </motion.h2>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="text-5xl lg:text-7xl font-bold tracking-tight text-on-surface mb-8 leading-[1.1]"
              >
                Smart Food Monitoring <br />
                <span className="text-primary italic font-medium">with ML</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-lg lg:text-xl text-on-surface-variant mb-10 leading-relaxed max-w-xl"
              >
                Experience the art of freshness with intelligent tracking. Ensure zero waste by knowing exactly what is in your fridge.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex flex-wrap gap-4"
              >
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -8px rgba(1,109,68,0.3)" }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 bg-primary text-on-primary rounded-2xl font-semibold shadow-lg shadow-primary/20 transition-all cursor-pointer"
                  >
                    Get Started
                  </motion.button>
                </Link>
              </motion.div>
            </div>

            <div className="relative">
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary-container/30 blur-[100px] rounded-full"></div>
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 rounded-2xl overflow-hidden shadow-2xl"
              >
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrOkJg_vElWnk74FUFQtRozV2c0rYRIHU3jnfCdRX7qb6GP0-tByuSj5MBYDPg_CuhWP5RqwX4stz_mNtimxIuT4_lUm8kiwZpkeOy1OYRhcPUcKHeUOoA1BBQSnudaqNsDme0zLkAIQ06ikoq7Ysu7fx8sgcpZMf5Qw8VDhYh4xNx6KOZ6z1o2LxUoW1iIoyZfzFREk_22MoN_LwwlCpLJs7k9D7cJabEBQVVfmxKBBhIvR4Ja51VhSJJ3guHdPyPcwRmmvqDLO8a"
                  alt="Fresh Produce"
                  className="w-full h-[600px] object-cover hover:scale-[1.02] transition-transform duration-700"
                />
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Feature Bento Grid */}
        <section className="px-8 py-24 bg-surface-container-low">
          <motion.div
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            className="max-w-7xl mx-auto"
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Cultivating Sustainability</h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto">Precision monitoring meets elegant design to create a zero-waste ecosystem for your home.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Large Feature */}
              <motion.div variants={childFade} className="md:col-span-2 relative group overflow-hidden rounded-2xl bg-surface-container-lowest p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-emerald-100/10">
                <div className="relative z-10 flex flex-col h-full">
                  <span className="material-symbols-outlined text-primary text-4xl mb-6">analytics</span>
                  <h3 className="text-2xl font-bold mb-4">Deep Learning Freshness</h3>
                  <p className="text-on-surface-variant max-w-md mb-8">Our proprietary AI identifies subtle color shifts and texture changes in produce before they are visible to the human eye.</p>
                  <img
                    src="https://images.openai.com/static-rsc-4/xlPcaBkXJH1D-4Q_fMMLiSqY8mGs-MXP4dd43pKeFYXJYcKncihaAbNlhe8Av0VBtamSdobiz75I4foGdDZpQqqSsG7NBqMctXPYZ3t87DLTntlgrRhs9OtDzTj9gUJr48YJR0dcmBBi59W3FCOsEbRqgoHCMQIg0IYj9W7HMC3QTCXxIMgGVbrUozoK6YNZ?purpose=fullsize"
                    alt="AI Analysis"
                    className="mt-auto rounded-xl h-48 object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                </div>
              </motion.div>

              {/* Small Feature 1 */}
              <motion.div variants={childFade} className="bg-primary p-8 rounded-2xl flex flex-col justify-between text-on-primary group hover:shadow-lg transition-all duration-300">
                <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform duration-300">inventory_2</span>
                <div>
                  <h3 className="text-xl font-bold mb-2">Inventory Cloud</h3>
                  <p className="text-primary-fixed-dim text-sm">Sync your pantry across all devices with instant scanning.</p>
                </div>
              </motion.div>

              {/* Small Feature 2 */}
              <motion.div variants={childFade} className="bg-surface-container-highest p-8 rounded-2xl flex flex-col justify-between border border-emerald-100/10 group hover:shadow-lg transition-all duration-300">
                <span className="material-symbols-outlined text-primary text-4xl group-hover:scale-110 transition-transform duration-300">qr_code_scanner</span>
                <div>
                  <h3 className="text-xl font-bold mb-2">Batch Tracking</h3>
                  <p className="text-on-surface-variant text-sm">Monitor large harvests or weekly groceries with unique batch IDs.</p>
                </div>
              </motion.div>

              {/* Medium Feature */}
              <motion.div variants={childFade} className="md:col-span-2 relative overflow-hidden rounded-2xl min-h-[300px] group">
                <img
                  src="https://images.openai.com/static-rsc-4/m8uyHPWYQdtZxFocApOjzIJlfWQKLMX-OxbptUFWQv-FZGww-v1lvB_Ah-rY1UYGQuBjNN6GQjvfOQsCCH4E-k_y--lwT1ByakC2IE8fS9HNtVMg8vX9IH850ThYxcodNL0J9BJtGIrx9Tr2ho6Mw2ejaw4ByD42OS8JlBuhrvgBdhZvp6BlijJgaZYN5vKJ?purpose=fullsize"
                  alt="Healthy Cooking"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-8 left-8 text-white">
                  <h3 className="text-2xl font-bold mb-2">Nutritional Intelligence</h3>
                  <p className="text-white/80 max-w-sm">Automatically calculates macro-nutrients based on your current fresh inventory.</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Newsletter / CTA */}
        <section className="px-8 py-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-5xl mx-auto rounded-3xl bg-emerald-950 p-12 lg:p-20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-20">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrzfhUnQtjtzqncueePUXqAQBcZqCZET5nrdxgFnxrQVa7QqA4iCVzl5P5oGXkSPBPuhUx0idfMoV8DyxIezB6jvK9k92Ec8rxXe77F49niRabzS1CILhHTlLNcBd5eJ8xMBT9PAe3tQn7o--spst6zjGx511DLBEtAEP804nHoR-zsGyWS9SPM6sFIpUNVG-mPid1viqe2wulYopIHDbOGpY9_B7g_rC2aNYBl6MM0LpINhjuLc6uoqL9SjmiUn2D30Let6XXWFnV" alt="Botanical Texture" className="w-full h-full object-cover" />
            </div>

            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl lg:text-5xl font-bold text-emerald-50 mb-6">Ready to transform <br /> your kitchen?</h2>
              <p className="text-emerald-100/70 mb-10 text-lg">Join 50,000+ conscious consumers reducing food waste and living more vibrantly every single day.</p>

              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  aria-label="Email address for newsletter"
                  placeholder="Enter your email"
                  className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-emerald-100/50"
                />
                <motion.button
                  type="button"
                  aria-label="Subscribe to newsletter"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-primary-container text-on-primary-container px-8 py-4 rounded-2xl font-bold transition-all cursor-pointer"
                >
                  Subscribe
                </motion.button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-8 bg-emerald-50 font-['Plus_Jakarta_Sans'] text-xs uppercase tracking-widest text-emerald-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-emerald-700/50">© 2026 {BRAND.name}. All rights reserved.</div>
          <div className="flex gap-8">
            <a href="#" className="text-emerald-700/50 hover:text-emerald-800 transition-colors">Privacy Policy</a>
            <a href="#" className="text-emerald-700/50 hover:text-emerald-800 transition-colors">Terms of Service</a>
            <a href="#" className="text-emerald-700/50 hover:text-emerald-800 transition-colors">Sustainability Report</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
