import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { FiMail, FiArrowLeft } from 'react-icons/fi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/user/forgot-password', { email });
      setSuccess(`Password reset link has been sent to ${email}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-10 rounded-xl shadow-xl border border-indigo-100">
        <div className="flex items-center justify-center mb-6">
          <FiMail size={40} className="text-indigo-600" />
        </div>

        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6">
          Reset Password
        </h2>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md shadow-sm" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md shadow-sm" role="alert">
            {success}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Alamat Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Masukkan email Anda"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition"
          >
            {loading ? 'Mengirim...' : 'Kirim Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <Link
            to="/profile"
            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium transition"
          >
            <FiArrowLeft />
            Kembali ke Profil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
