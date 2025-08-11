import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Profile from './pages/Profile';

import AdminUsers from './pages/admin/Users';
import AdminMedicines from './pages/admin/Medicines';
import AdminMedicineForm from './pages/admin/MedicineFormPage';
import AdminEditMedicine from './pages/admin/EditMedicinePage';
import AdminTransactions from './pages/admin/Transactions';
import AdminCreateTransaction from './pages/admin/CreateTransaction';
import AdminTransactionDetail from './pages/admin/TransactionDetail';
import AdminReports from './pages/admin/Reports';
import AdminReportDetail from './pages/admin/ReportDetail';
import AdminGenerateReport from './pages/admin/GenerateReport';

import CashierMedicines from './pages/cashier/Medicines';
import CashierMedicineForm from './pages/cashier/MedicineFormPage';
import CashierEditMedicine from './pages/cashier/EditMedicinePage';
import CashierTransactions from './pages/cashier/Transactions';
import CashierCreateTransaction from './pages/cashier/CreateTransaction';
import CashierTransactionDetail from './pages/cashier/TransactionDetail';

import NotFound from './pages/NotFound';
import PrivateRoute from './components/auth/PrivateRoute';
import RedirectToDashboard from './pages/RedirectToDashboard';

import DashboardPage from './pages/DashboardPage';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;

const AppContent = () => {
  const { user } = useAuth();
  const location = useLocation();

  const hideSidebarPaths = ['/login', '/register', '/forgot-password'];
  const showSidebar = user && !hideSidebarPaths.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        {showSidebar && <Sidebar />}
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

            {/* Private Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute allowedRoles={['Admin', 'Kasir']}>
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/users"
              element={
                <PrivateRoute allowedRoles={['Admin']}>
                  <AdminUsers />
                </PrivateRoute>
              }
            />
            <Route
              path="/medicines"
              element={
                <PrivateRoute allowedRoles={['Admin', 'Kasir']}>
                  {user?.role === 'Admin' ? <AdminMedicines /> : <CashierMedicines />}
                </PrivateRoute>
              }
            />
            <Route
              path="/medicines/create"
              element={
                <PrivateRoute allowedRoles={['Admin', 'Kasir']}>
                  {user?.role === 'Admin' ? <AdminMedicineForm /> : <CashierMedicineForm />}
                </PrivateRoute>
              }
            />
            <Route
              path="/medicines/edit/:id"
              element={
                <PrivateRoute allowedRoles={['Admin', 'Kasir']}>
                  {user?.role === 'Admin' ? <AdminEditMedicine /> : <CashierEditMedicine />}
                </PrivateRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <PrivateRoute allowedRoles={['Admin', 'Kasir']}>
                  {user?.role === 'Admin' ? <AdminTransactions /> : <CashierTransactions />}
                </PrivateRoute>
              }
            />
            <Route
              path="/transactions/create"
              element={
                <PrivateRoute allowedRoles={['Admin', 'Kasir']}>
                  {user?.role === 'Admin' ? <AdminCreateTransaction /> : <CashierCreateTransaction />}
                </PrivateRoute>
              }
            />
            <Route
              path="/transactions/:id"
              element={
                <PrivateRoute allowedRoles={['Admin', 'Kasir']}>
                  {user?.role === 'Admin' ? <AdminTransactionDetail /> : <CashierTransactionDetail />}
                </PrivateRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <PrivateRoute allowedRoles={['Admin']}>
                  <AdminReports />
                </PrivateRoute>
              }
            />
            <Route
              path="/reports/:id"
              element={
                <PrivateRoute allowedRoles={['Admin']}>
                  <AdminReportDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/reports/generate"
              element={
                <PrivateRoute allowedRoles={['Admin']}>
                  <AdminGenerateReport />
                </PrivateRoute>
              }
            />

            {/* Redirect root to dashboard */}
            <Route
              path="/"
              element={
                <PrivateRoute allowedRoles={['Admin', 'Kasir']}>
                  <RedirectToDashboard />
                </PrivateRoute>
              }
            />

            {/* Not found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};
