import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchExpiring, fetchRecipes } from '../services/api';
import { BRAND } from '../config/branding';


const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

// Map API urgency → card styling
const getIngredientStyle = (urgency) => {
  switch (urgency) {
    case 'CRITICAL':
      return {
        icon: 'warning', iconColor: 'text-error',
        badge: 'Critical', badgeColor: 'text-error bg-on-error',
        bgColor: 'bg-error-container/30', borderColor: 'border-error/10',
        timeColor: 'text-error', opacity: '',
      };
    case 'MODERATE':
      return {
        icon: 'hourglass_empty', iconColor: 'text-secondary',
        badge: 'Moderate', badgeColor: 'text-secondary bg-secondary-container',
        bgColor: 'bg-surface-container-highest', borderColor: '',
        timeColor: 'text-on-surface-variant', opacity: '',
      };
    default:
      return {
        icon: 'schedule', iconColor: 'text-outline',
        badge: 'Stable', badgeColor: 'text-outline bg-surface-container-high',
        bgColor: 'bg-surface-container-highest', borderColor: '',
        timeColor: 'text-on-surface-variant', opacity: 'opacity-60',
      };
  }
};

const Recipes = () => {
  const [activeFilter, setActiveFilter] = useState('All Recipes');
  const [priorityIngredients, setPriorityIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [useExpiringOnly, setUseExpiringOnly] = useState(false);
  const filters = ['All Recipes', 'Quick Meals', 'Healthy'];

  // ── Fetch dynamic data from API ──
  useEffect(() => {
    document.title = `${BRAND.name} | Recipes`;
    const loadContent = async () => {
      try {
        // 1. Load priority (expiring) ingredients
        const expData = await fetchExpiring();
        const mapped = (expData || []).map((item) => {
          const style = getIngredientStyle(item.urgency);
          return {
            ...style,
            name: item.item.charAt(0).toUpperCase() + item.item.slice(1),
            time: item.time_left,
          };
        });
        setPriorityIngredients(mapped);

        // 2. Load dynamic recipe recommendations
        const recipeData = await fetchRecipes();
        setRecipes(recipeData || []);

      } catch (err) {
        console.warn('Recipes: could not fetch dynamic content:', err.message);
      }
    };

    loadContent();
    const interval = setInterval(loadContent, 10000);
    return () => clearInterval(interval);
  }, []);

  // ── Filtered recipes ──
  const displayRecipes = (() => {
    let filtered = recipes;
    if (useExpiringOnly) {
      filtered = recipes.filter(r => r.expiring);
    }
    if (activeFilter === 'Quick Meals') {
      filtered = filtered.filter(r => parseInt(r.time) < 10);
    } else if (activeFilter === 'Healthy') {
      filtered = filtered.filter(r => parseInt(r.kcal) < 350);
    }
    return filtered.length > 0 ? filtered : recipes;
  })();

  return (
    <div className="max-w-7xl mx-auto px-6 pb-12 space-y-12 py-10 w-full">
      {/* Hero Section */}
      <motion.section {...fadeUp} className="relative overflow-hidden rounded-3xl bg-primary-container/20 p-8 md:p-12">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center px-3 py-1 bg-primary text-on-primary rounded-full text-xs font-bold tracking-wider uppercase">
              Reduce waste, cook smarter
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-on-background tracking-tight leading-tight">
              Smart Recipe <br/><span className="text-primary">Suggestions</span>
            </h1>
            <p className="text-lg text-on-surface-variant max-w-md font-medium leading-relaxed">
              Cook meals based on items that are about to expire. Save your ingredients and the planet.
            </p>
          </div>
          <div className="flex-1 w-full max-w-sm">
            <motion.div
              whileHover={{ rotate: 1, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="aspect-square rounded-2xl overflow-hidden shadow-2xl rotate-3"
            >
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzw2_tvEf2kEME4Ki4gPJwLPOY97TY-5g6mbZ5FyLaPiLGw9NNDVRJE9DTH-t_xLXDtMQSeYn2QZfB3sg9h2jyOGhrPgE5IO2J4jquD_2N-QGKgdQiIISiGG75797zArI3c9xkPCbqApNqPXbrsn2oqSg71eYlh8Ml5vdcWzE8Vatzy7cbA6PGqinWbou7vRE-hWRMagXBPGJEQ14NeJHkDyjhmj-M6r4jL0Wtui_h9Uac_ijya9X0mub4oc25Q3CXI5Ut5EqVxDmI" alt="Healthy recipe on tablet" />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Priority Ingredients */}
      <motion.section {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-on-background">Priority Ingredients</h2>
          <span className="text-xs font-bold text-error tracking-widest uppercase">Expiring soon</span>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {priorityIngredients.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
              whileHover={{ y: -4, boxShadow: '0 8px 24px -8px rgba(0,0,0,0.1)' }}
              className={`flex-shrink-0 w-48 p-4 rounded-2xl ${item.bgColor} ${item.borderColor ? `border ${item.borderColor}` : ''} ${item.opacity} cursor-pointer transition-all duration-300`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`material-symbols-outlined ${item.iconColor}`}>{item.icon}</span>
                <span className={`text-[10px] font-bold ${item.badgeColor} px-2 py-0.5 rounded-full uppercase`}>{item.badge}</span>
              </div>
              <p className="font-bold text-on-surface mb-1">{item.name}</p>
              <p className={`text-xs ${item.timeColor} font-semibold`}>{item.time}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Recipe Filters & Grid */}
      <motion.section {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }} className="space-y-6">
        <div className="flex flex-wrap gap-3">
          {filters.map((filter) => (
            <motion.button
              key={filter}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setActiveFilter(filter); setUseExpiringOnly(false); }}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${
                activeFilter === filter && !useExpiringOnly
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              {filter}
            </motion.button>
          ))}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setUseExpiringOnly(!useExpiringOnly)}
            className={`px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              useExpiringOnly
                ? 'bg-tertiary text-on-tertiary shadow-lg'
                : 'bg-tertiary-container text-on-tertiary-container hover:bg-tertiary-fixed'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">eco</span>
            Use Expiring Items
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayRecipes.map((recipe, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.12 }}
              whileHover={{ y: -6 }}
              className="group cursor-pointer bg-surface-container-lowest rounded-3xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl"
            >
              <div className="relative h-64 overflow-hidden">
                <img src={recipe.img} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                {recipe.expiring && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-4 right-4 bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-xs font-bold shadow-md"
                  >
                    Uses Expiring
                  </motion.div>
                )}
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl text-on-surface mb-2 group-hover:text-primary transition-colors duration-300">{recipe.title}</h3>
                <div className="flex gap-4 text-sm text-on-surface-variant font-medium mb-4">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">timer</span> {recipe.time}</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">local_fire_department</span> {recipe.kcal}</span>
                </div>
                {recipe.shared_items && recipe.shared_items.length > 0 && (
                  <div className="pt-4 border-t border-outline-variant/30">
                     <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Ingredients in your fridge</p>
                     <div className="flex flex-wrap gap-1.5">
                       {recipe.shared_items.map(item => (
                         <span key={item} className="px-2 py-0.5 bg-primary/5 text-primary border border-primary/10 rounded-md text-[10px] font-bold capitalize">
                           {item}
                         </span>
                       ))}
                     </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};

export default Recipes;
