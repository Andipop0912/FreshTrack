import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../config/branding';


const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('male');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = `${BRAND.name} | Signup`;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await register(name, email, password, gender);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center overflow-hidden">
      {/* Ambient Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-container/20 blur-[120px]"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] rounded-full bg-secondary-container/30 blur-[100px]"></div>
        <div className="absolute top-1/4 right-1/4 w-[20%] h-[20%] rounded-full bg-tertiary-container/20 blur-[80px]"></div>
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYISxaYPCshTiqDUSHk6W_DYFFIfz2zcDMWAKD2oQi0z6MTE_VNvNc7Cym3i8PAgjbIRJeblTicFGdivwphXjBd2XrPdXSrKQy0Cec3L_lWf5jII_SFQuIxYL7Sdl57fQsgP0DuDHwIstgIU56uVhzkIW1aBgxn_N_qmWFY58tBtzj8V6jl6I0nQfKbJ1qOcFc8h2BiAK4qFxf9txavtL1lqhiVFEZidmH3UNP7shD9nVYv_o8LHYB4TRbNezyOuI0tn5M0vOg_v9H"
          alt="Fresh vegetables in a greenhouse"
          className="absolute inset-0 w-full h-full object-cover opacity-5 mix-blend-overlay"
        />
      </div>

      {/* Main Authentication Canvas */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[480px] px-6 py-12 flex flex-col items-center"
      >
        {/* Branding */}
        <header className="mb-10 text-center flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-16 h-16 bg-primary-container rounded-3xl flex items-center justify-center mb-6 shadow-sm"
          >
            <span className="material-symbols-outlined text-primary text-4xl" style={{fontVariationSettings: "'FILL' 0"}}>potted_plant</span>
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-on-surface mb-2">Create your {BRAND.name} account</h1>
          <p className="text-on-surface-variant font-medium text-center max-w-[320px]">Start monitoring food freshness with AI.</p>
        </header>

        {/* Create Account Card */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-panel border border-white/40 w-full rounded-[2.5rem] p-8 md:p-10 shadow-[0_32px_64px_-16px_rgba(44,52,50,0.08)]"
        >
          <div className="flex flex-col gap-8">
            {/* Toggle Controls */}
            <div className="flex justify-start gap-8 mb-2">
              <Link to="/login" className="text-on-surface-variant font-medium text-lg hover:text-on-surface transition-colors pb-1">Sign In</Link>
              <Link to="/signup" className="text-on-surface font-bold text-lg border-b-2 border-primary pb-1">Create Account</Link>
            </div>

            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="relative floating-label-group">
                <input
                  type="text"
                  id="full_name"
                  placeholder=" "
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="peer w-full bg-surface-container-highest/50 border-none rounded-2xl px-5 py-4 pt-6 text-on-surface focus:ring-1 focus:ring-primary/20 input-glow transition-all"
                />
                <label
                  htmlFor="full_name"
                  className="absolute left-5 top-4 text-on-surface-variant transition-all pointer-events-none origin-left
                  peer-focus:-translate-y-3 peer-focus:scale-75 peer-[:not(:placeholder-shown)]:-translate-y-3 peer-[:not(:placeholder-shown)]:scale-75
                  peer-focus:text-primary"
                >
                  Full Name
                </label>
              </div>

              {/* Email Address */}
              <div className="relative floating-label-group">
                <input
                  type="email"
                  id="signup-email"
                  placeholder=" "
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="peer w-full bg-surface-container-highest/50 border-none rounded-2xl px-5 py-4 pt-6 text-on-surface focus:ring-1 focus:ring-primary/20 input-glow transition-all"
                />
                <label
                  htmlFor="signup-email"
                  className="absolute left-5 top-4 text-on-surface-variant transition-all pointer-events-none origin-left
                  peer-focus:-translate-y-3 peer-focus:scale-75 peer-[:not(:placeholder-shown)]:-translate-y-3 peer-[:not(:placeholder-shown)]:scale-75
                  peer-focus:text-primary"
                >
                  Email Address
                </label>
              </div>

              {/* Password */}
              <div className="relative floating-label-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="signup-password"
                  placeholder=" "
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="peer w-full bg-surface-container-highest/50 border-none rounded-2xl px-5 py-4 pt-6 text-on-surface focus:ring-1 focus:ring-primary/20 input-glow transition-all"
                />
                <label
                  htmlFor="signup-password"
                  className="absolute left-5 top-4 text-on-surface-variant transition-all pointer-events-none origin-left
                  peer-focus:-translate-y-3 peer-focus:scale-75 peer-[:not(:placeholder-shown)]:-translate-y-3 peer-[:not(:placeholder-shown)]:scale-75
                  peer-focus:text-primary"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>

              {/* Gender Selection */}
              <div className="relative floating-label-group">
                <select
                  id="signup-gender"
                  value={gender}
                  aria-label="Gender"
                  onChange={(e) => setGender(e.target.value)}
                  required
                  className="w-full bg-surface-container-highest/50 border-none rounded-2xl px-5 py-4 text-on-surface focus:ring-1 focus:ring-primary/20 input-glow transition-all appearance-none cursor-pointer"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <label
                  htmlFor="signup-gender"
                  className="absolute left-5 -top-2 text-on-surface-variant text-xs font-semibold pointer-events-none"
                >
                  Gender
                </label>
                <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-lg">expand_more</span>
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-error text-sm font-medium text-center -mt-2">{error}</p>
              )}

              {/* Action Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.01, boxShadow: "0 16px 32px -8px rgba(1,109,68,0.25)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gradient-to-br from-primary to-primary-dim text-on-primary rounded-2xl font-bold text-lg shadow-lg shadow-primary/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
                {!isLoading && <span className="material-symbols-outlined">arrow_forward</span>}
              </motion.button>
            </form>

            {/* Social Entry Divider */}
            <div className="flex items-center gap-4 px-2">
              <div className="h-px flex-1 bg-outline-variant opacity-20"></div>
              <span className="text-xs font-bold text-outline uppercase tracking-widest">Social Entry</span>
              <div className="h-px flex-1 bg-outline-variant opacity-20"></div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                type="button"
                aria-label="Sign up with Google"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-3 py-3 rounded-2xl bg-surface-container-lowest border border-white/60 hover:bg-white transition-all cursor-pointer"
              >
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAv1YBVOMHjJ5IxhCorCRpNCS26s02BtpNCfLYfyJzAB0DCPUvBRQKEDzmIivTeRtK6WFxws0ZzUQhctR2PrYIBpMX24xjZllckyZrdN4clOOHYV9l7JHvRaFS95TjKI0ygIKIQrKiobHd7l67ZISP60jmbihxrXhkzBUNw7ibI-Ra04Gg5LtzqN6tQx9VZWg6GWO-00-9dZQmld56cF9hsxvdO8dyezjNdqnUwtWdse7HFuPI6Fh48QFCsOS2akg3lI8R19opdyDJV" alt="Google" className="w-5 h-5 grayscale hover:grayscale-0 transition-all" />
                <span className="text-sm font-semibold text-on-surface-variant">Google</span>
              </motion.button>
              <motion.button
                type="button"
                aria-label="Sign up with Apple"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-3 py-3 rounded-2xl bg-surface-container-lowest border border-white/60 hover:bg-white transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-on-surface text-xl">brand_awareness</span>
                <span className="text-sm font-semibold text-on-surface-variant">Apple</span>
              </motion.button>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="mt-12 flex flex-col items-center gap-6">
          <nav className="flex gap-8">
            <a href="#" className="text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors font-semibold">Privacy Policy</a>
            <a href="#" className="text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors font-semibold">Terms of Service</a>
            <a href="#" className="text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors font-semibold">Sustainability</a>
          </nav>
          <p className="text-[10px] uppercase tracking-widest text-outline">© 2026 {BRAND.name}<span style={{letterSpacing: "0.1em"}}>. All rights reserved.</span></p>
        </footer>
      </motion.main>

      {/* Side Decoration */}
      <div className="hidden lg:block fixed right-0 top-0 bottom-0 w-1/4 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-l from-primary/5 to-transparent"></div>
        <div className="h-full flex flex-col justify-center gap-12 px-12 -rotate-[4deg] opacity-40">
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="bg-surface-container-lowest/80 p-6 rounded-3xl shadow-xl w-64 backdrop-blur-md"
          >
            <span className="material-symbols-outlined text-primary mb-4" style={{fontVariationSettings: "'FILL' 1"}}>spa</span>
            <p className="font-bold text-on-surface leading-tight">Reduce waste by 40% with smart shelf-life monitoring.</p>
          </motion.div>
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="bg-surface-container-lowest/80 p-6 rounded-3xl shadow-xl w-64 translate-x-12 backdrop-blur-md"
          >
            <span className="material-symbols-outlined text-secondary mb-4" style={{fontVariationSettings: "'FILL' 1"}}>eco</span>
            <p className="font-bold text-on-surface leading-tight">Support local regenerative farming with every scan.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
