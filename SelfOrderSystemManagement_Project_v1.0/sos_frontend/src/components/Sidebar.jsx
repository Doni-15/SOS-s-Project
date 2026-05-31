import { useState } from 'react';
import { X, LogOut, Home, BarChart3, Users, Settings, ShoppingCart as CartIcon, LogIn, ShoppingBag, UtensilsCrossed, Package } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCartDrawer } from '../context/CartDrawerContext';

export const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout, isAuthenticated, isOwner, isKasir } = useAuth();
  const { closeCart } = useCartDrawer();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    closeCart();
    navigate('/login');
    setSidebarOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  // Menu items berdasarkan role
  const getMenuItems = () => {
    if (isOwner) {
      return [
        { label: 'Dashboard', icon: Home, href: '/owner', id: 'dashboard' },
        { label: 'Laporan Penjualan', icon: BarChart3, href: '/owner/reports', id: 'reports' },
        { label: 'Kelola Pengguna', icon: Users, href: '/owner/users', id: 'users' },
        { label: 'Menu', icon: CartIcon, href: '/owner/menu', id: 'menu' },
        { label: 'Pengaturan', icon: Settings, href: '/owner/settings', id: 'settings' },
      ];
    } else if (isKasir) {
      return [
        { label: 'Dashboard',        icon: Home,            href: '/kasir',          id: 'dashboard' },
        { label: 'Pesanan',          icon: Package,         href: '/kasir/orders',   id: 'orders'    },
        { label: 'Transaksi Take Away', icon: ShoppingBag,  href: '/kasir/takeaway', id: 'takeaway'  },
        { label: 'Kelola Menu',      icon: UtensilsCrossed, href: '/kasir/menu',     id: 'menu'      },
      ];
    } else {
      return [
        { label: 'Menu', icon: CartIcon, href: '/', id: 'menu' },
      ];
    }
  };

  const menuItems = getMenuItems();

  const getUserInitials = () => {
    if (!user) return '?';
    const nameParts = user.username.split('.');
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-20 h-[calc(100vh-80px)] bg-blue-600 text-white w-64 transform transition-transform duration-300 z-40 overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Close Button on Mobile */}
          <div className="flex md:hidden justify-between items-center p-4 border-b border-blue-500">
            <span className="font-semibold">Menu</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 hover:bg-blue-500 rounded transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto py-6">
            <div className="px-4 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive(item.href)
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* User Info & Logout */}
          {isAuthenticated ? (
            <div className="border-t border-blue-500 p-4 space-y-3">
              <div className="px-2 py-3 bg-blue-500 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                    {getUserInitials()}
                  </div>
                  <div>
                    <p className="text-xs text-blue-100 font-semibold">
                      {user?.role === 'kasir' ? 'KASIR' : 'PEMILIK'}
                    </p>
                    <p className="text-sm font-semibold">{user?.username}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 justify-center bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition font-semibold text-sm"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <div className="border-t border-blue-500 p-4">
              <Link
                to="/login"
                onClick={() => setSidebarOpen(false)}
                className="w-full flex items-center gap-2 justify-center bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition font-semibold text-sm"
              >
                <LogIn size={16} />
                Login
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};
