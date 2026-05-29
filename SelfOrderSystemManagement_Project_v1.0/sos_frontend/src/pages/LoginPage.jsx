import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('kasir');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validasi sederhana
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

      // Simulasi login
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const success = login(username, password, role);
      if (success) {
        navigate(role === 'kasir' ? '/kasir' : '/owner');
      } else {
        setError('Login gagal');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-4 rounded-full">
              <Shield size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Resto Nusantara
          </h1>
          <p className="text-gray-600">Akses Admin Panel</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <label
              className={`p-3 rounded-lg border-2 cursor-pointer transition text-center font-semibold ${
                role === 'kasir'
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              <input
                type="radio"
                value="kasir"
                checked={role === 'kasir'}
                onChange={(e) => setRole(e.target.value)}
                className="hidden"
              />
              💳 Kasir
            </label>
            <label
              className={`p-3 rounded-lg border-2 cursor-pointer transition text-center font-semibold ${
                role === 'owner'
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              <input
                type="radio"
                value="owner"
                checked={role === 'owner'}
                onChange={(e) => setRole(e.target.value)}
                className="hidden"
              />
              👔 Owner
            </label>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
              placeholder="Masukkan username"
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
              placeholder="Masukkan password"
              disabled={isLoading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm font-semibold">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Memproses...' : 'Login'}
          </button>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 mb-2">
              📝 Demo Credentials:
            </p>
            <p className="text-xs text-gray-600 mb-1">
              <strong>Kasir:</strong> kasir / pass123
            </p>
            <p className="text-xs text-gray-600">
              <strong>Owner:</strong> owner / pass456
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            User biasa?{' '}
            <a href="/" className="text-blue-600 font-semibold hover:underline">
              Kembali ke Menu
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
