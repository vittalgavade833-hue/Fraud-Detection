import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('fraudshield-token'));
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/auth/profile');
      setUser(res.data.user || res.data);
    } catch (err) {
      console.error('Failed to load user:', err);
      localStorage.removeItem('fraudshield-token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password, isAdmin = false) => {
    const endpoint = isAdmin ? '/auth/admin/login' : '/auth/login';
    const res = await api.post(endpoint, { email, password });
    const data = res.data;
    const newToken = data.token;
    localStorage.setItem('fraudshield-token', newToken);
    setToken(newToken);
    setUser(data.user);
    toast.success('Login successful!');
    return data;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const data = res.data;
    const newToken = data.token;
    localStorage.setItem('fraudshield-token', newToken);
    setToken(newToken);
    setUser(data.user);
    toast.success('Registration successful!');
    return data;
  };

  const logout = () => {
    localStorage.removeItem('fraudshield-token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (data) => {
    const res = await api.put('/auth/profile', data);
    setUser(res.data.user || res.data);
    toast.success('Profile updated!');
    return res.data;
  };

  const forgotPassword = async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    toast.success('Password reset instructions sent!');
    return res.data;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!token && !!user,
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      updateProfile,
      forgotPassword,
      loadUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
