import { useAuth } from '../context/AuthContext';
import AdminDashboard from './admin/Dashboard';
import CashierDashboard from './cashier/Dashboard';

const DashboardPage = () => {
  const { user } = useAuth();

  if (user?.role === 'Admin') return <AdminDashboard />;
  return <CashierDashboard />;
};

export default DashboardPage;
