import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, updateUserProfile, resetSystem } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from storage on mount
  useEffect(() => {
    try {
      const sessionUser = sessionStorage.getItem('freshtrack_user');
      const localUser = localStorage.getItem('freshtrack_user');
      
      if (sessionUser) {
        setUser(JSON.parse(sessionUser));
      } else if (localUser) {
        setUser(JSON.parse(localUser));
      }
    } catch {
      sessionStorage.removeItem('freshtrack_user');
      localStorage.removeItem('freshtrack_user');
    }
    setLoading(false);

    // Call resetSystem when the browser window/tab is closed (only if not persistent)
    const handleBeforeUnload = () => {
      if (!localStorage.getItem('freshtrack_user')) {
        resetSystem();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const login = async (email, password, stayFresh) => {
    const data = await loginUser(email, password);
    setUser(data);
    if (stayFresh) {
      localStorage.setItem('freshtrack_user', JSON.stringify(data));
    } else {
      sessionStorage.setItem('freshtrack_user', JSON.stringify(data));
    }
    return data;
  };

  const register = async (name, email, password, gender) => {
    const data = await registerUser(name, email, password, gender);
    setUser(data);
    sessionStorage.setItem('freshtrack_user', JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('freshtrack_user');
    sessionStorage.removeItem('freshtrack_user');
    resetSystem(); // Erase backend image & analytics state
  };

  const updateProfile = async (updates) => {
    if (!user) return;
    const data = await updateUserProfile(user.email, updates);
    const merged = { ...user, ...data };
    setUser(merged);
    
    if (localStorage.getItem('freshtrack_user')) {
      localStorage.setItem('freshtrack_user', JSON.stringify(merged));
    } else {
      sessionStorage.setItem('freshtrack_user', JSON.stringify(merged));
    }
    return merged;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
