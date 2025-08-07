import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import MedicineFormPage from './pages/admin/MedicineFormPage';
import EditMedicinePage from './pages/admin/EditMedicinePage';
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerProfile from './pages/customer/Profile';
import NotFound from './pages/NotFound';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminMedicines from './pages/admin/Medicines';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex">
            <Sidebar />
            <main className="flex-1">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Admin Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <PrivateRoute allowedRoles={['Admin']}>
                      <AdminDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <PrivateRoute allowedRoles={['Admin']}>
                      <AdminUsers />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin/medicines"
                  element={
                    <PrivateRoute allowedRoles={['Admin']}>
                      <AdminMedicines />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin/medicines/create"
                  element={
                    <PrivateRoute allowedRoles={['Admin']}>
                      <MedicineFormPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin/medicines/edit/:id"
                  element={
                    <PrivateRoute allowedRoles={['Admin']}>
                      <EditMedicinePage />
                    </PrivateRoute>
                  }
                />
                {/* <Route
                  path="/admin/reports"
                  element={
                    <PrivateRoute allowedRoles={['Admin']}>
                      <AdminReports />
                    </PrivateRoute>
                  }
                /> */}
                
                {/* Customer Routes */}
                <Route
                  path="/customer/dashboard"
                  element={
                    <PrivateRoute allowedRoles={['Pelanggan']}>
                      <CustomerDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/customer/profile"
                  element={
                    <PrivateRoute allowedRoles={['Pelanggan']}>
                      <CustomerProfile />
                    </PrivateRoute>
                  }
                />
                
                {/* Redirect based on role */}
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      {({ user }) => (
                        <Navigate
                          to={
                            user?.role === 'Admin'
                              ? '/admin/dashboard'
                              : '/customer/dashboard'
                          }
                        />
                      )}
                    </PrivateRoute>
                  }
                />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;