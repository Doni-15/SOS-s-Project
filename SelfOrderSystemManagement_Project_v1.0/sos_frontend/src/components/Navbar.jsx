import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();

  const getUserInitials = () => {
    if (!user) return '?';
    const nameParts = user.username.split('.');
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b border-gray-200">
      <div className="flex justify-between items-center h-20 px-6">
        {/* Left - Logo & Hamburger */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-800"
            title="Toggle sidebar"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              🍽
            </div>
            <div className="sm:flex flex-row gap-1 ">
              <span className="text-2xl font-bold text-gray-800">Kedai</span>
              <span className="text-2xl text-gray-600">Nusantara</span>
            </div>
          </div>
        </div>

        {/* Right - Date & User Info */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm text-gray-600">
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <span className="text-xs text-gray-500">
              {new Date().toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* Notification & User Avatar */}
          {user && (
            <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                {getUserInitials()}
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xs text-gray-500 font-semibold">
                  {user.role === 'kasir' ? 'KASIR' : 'PEMILIK'}
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {user.username}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
