import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FiEdit, FiLogOut, FiSave, FiX, FiMail, FiUser } from 'react-icons/fi';
import { MdOutlinePassword } from 'react-icons/md';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/user/me');
        setFormData({
          name: response.data.user.name,
          email: response.data.user.email
        });
      } catch (err) {
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.put(`/user/update-user/${user._id}`, formData);
      setSuccess('Profile updated successfully');
      setEditMode(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError('Failed to logout');
    }
  };

  if (loading && !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg font-medium text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="ml-64 pt-16 px-6 mt-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-gray-800">👤 Profile Settings</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-all"
          >
            <FiLogOut size={18} />
            Logout
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-1"><FiUser /> Full Name</span>
            </label>
            {editMode ? (
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            ) : (
              <p className="text-gray-800 text-lg">{formData.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-1"><FiMail /> Email Address</span>
            </label>
            {editMode ? (
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            ) : (
              <p className="text-gray-800 text-lg">{formData.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <p className="text-gray-800 capitalize">{user?.role}</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            {editMode ? (
              <>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
                >
                  <FiX /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition disabled:opacity-50"
                >
                  <FiSave />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition"
              >
                <FiEdit />
                Edit Profile
              </button>
            )}
          </div>
        </form>

        <div className="mt-10 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <MdOutlinePassword size={20} />
            Change Password
          </h2>
          <Link
            to="/forgot-password"
            className="text-indigo-600 hover:underline font-medium"
          >
            Reset Password via Email
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;
