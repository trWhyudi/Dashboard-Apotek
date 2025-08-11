import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RedirectToDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    if (user.role === 'Admin') {
      navigate('/dashboard', { replace: true });
    } else if (user.role === 'Cashier') {
      navigate('/cashier/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return null;
};

export default RedirectToDashboard;
