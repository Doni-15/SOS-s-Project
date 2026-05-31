import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

export const KasirLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!username || !password) {
        setError('Username dan password harus diisi');
        setIsLoading(false);
        return;
      }

      if (username.length < 3) {
        setError('Username minimal 3 karakter');
        setIsLoading(false);
        return;
      }

      if (password.length < 4) {
        setError('Password minimal 4 karakter');
        setIsLoading(false);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const success = login(username, password, 'kasir');
      if (success) {
        navigate('/kasir');
      } else {
        setError('Login gagal');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-row bg-white">
      {/* Left Side - Gradient Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 flex-col justify-center items-center p-12">
        <div className="text-center text-white">
          <div className="text-6xl mb-6">🏪</div>
          <h1 className="text-4xl font-bold mb-4">Kelola Transaksi,</h1>
          <h2 className="text-4xl font-bold mb-8">Layani dengan Cepat.</h2>
          <p className="text-blue-100 text-lg max-w-md">
            Sistem kasir andal untuk operasional restoran yang efisien dan profesional.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 transition"
          >
            <ArrowLeft size={20} />
            Kembali
          </button>

          {/* Header */}
          <div className="text-center mb-10">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💳</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Kedai Nusantara</h1>
            <p className="text-gray-600">Sistem Kasir Resto Nusantara</p>
          </div>

          {/* Role Badge */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-center">
            <span className="text-blue-600 font-semibold">💳 Akses Kasir / Internal</span>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">👤</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-600 hover:text-gray-800"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 border border-gray-300 rounded cursor-pointer accent-blue-600"
                  disabled={isLoading}
                />
                <span className="text-gray-700">Ingat saya</span>
              </label>
              <a href="#" className="text-blue-600 hover:text-blue-700 transition">
                Lupa password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-4 rounded-lg transition mt-6"
            >
              {isLoading ? 'Sedang login...' : 'Login'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600 justify-center">
              <span>✓</span>
              <span>Akses hanya untuk kasir yang terdaftar dan terverifikasi.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
