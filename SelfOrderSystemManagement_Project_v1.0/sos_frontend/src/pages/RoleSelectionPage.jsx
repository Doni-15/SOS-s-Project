import { useNavigate } from 'react-router-dom';

export const RoleSelectionPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🍽</div>
          <h1 className="text-4xl font-bold text-white mb-2">Kedai Nusantara</h1>
          <p className="text-blue-100 text-lg">Sistem Kasir Resto Nusantara</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kasir Login Card */}
          <div
            onClick={() => navigate('/login/kasir')}
            className="bg-white rounded-2xl shadow-2xl p-8 cursor-pointer transform transition hover:scale-105 hover:shadow-3xl"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">💳</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Akses Kasir</h2>
              <p className="text-gray-600 mb-6">
                Login sebagai kasir untuk mengoperasikan sistem transaksi
              </p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition">
                Masuk Sebagai Kasir
              </button>
            </div>
          </div>

          {/* Owner Login Card */}
          <div
            onClick={() => navigate('/login/owner')}
            className="bg-white rounded-2xl shadow-2xl p-8 cursor-pointer transform transition hover:scale-105 hover:shadow-3xl"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">👔</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Akses Pemilik</h2>
              <p className="text-gray-600 mb-6">
                Login sebagai pemilik untuk mengelola bisnis dan laporan
              </p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition">
                Masuk Sebagai Pemilik
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
