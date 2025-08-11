import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/user/me');
        setUser(response.data.user);
      } catch (error) {
        if (error.response?.status === 401) {
          setUser(null);
        } else {
          console.error('Auth check failed:', error);
        }
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/user/login-user', { email, password });
      const loggedInUser = response.data.user;
      setUser(loggedInUser);
      
      navigate('/dashboard');
      
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = async () => {
    setLogoutLoading(true);
    try {
      await api.get('/user/logout-user');
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Logout gagal, coba lagi.');
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logoutLoading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
