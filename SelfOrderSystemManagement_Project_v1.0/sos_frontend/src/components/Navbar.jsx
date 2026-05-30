import { useState } from 'react';
import { Menu, X, LogOut, ShoppingCart as CartIcon, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCartDrawer } from '../context/CartDrawerContext';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { getTotalItems } = useCart();
  const { closeCart } = useCartDrawer();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    closeCart();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    closeCart();
  };

  return (
    <nav className="sticky top-0 z-50 bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold">
              🍽
            </div>
            <span className="sm:inline mx-2">Resto Nusantara</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="hover:text-blue-100 transition">
              Menu
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm bg-blue-500 px-3 py-1 rounded-full">
                  {user.role === 'kasir' ? '💳 Kasir' : '👔 Owner'}
                </span>
                <span className="text-sm">{user.username}</span>
                {user.role === 'kasir' && (
                  <Link
                    to="/kasir"
                    className="bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded transition"
                  >
                    Dashboard
                  </Link>
                )}
                {user.role === 'owner' && (
                  <Link
                    to="/owner"
                    className="bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded transition"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 px-4 py-2 rounded transition"
              >
                <LogIn size={18} />
                Login
              </Link>
            )}

            {!isAuthenticated && (
              <Link
                to="/cart"
                className="relative hover:text-blue-100 transition"
              >
                <CartIcon size={24} />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            {!isAuthenticated && (
              <Link to="/cart" className="relative">
                <CartIcon size={24} />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-blue-400">
            <Link
              to="/"
              className="block py-2 px-4 hover:bg-blue-500 rounded transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Menu
            </Link>

            {isAuthenticated ? (
              <>
                <div className="py-2 px-4 border-y border-blue-400 my-2">
                  <div className="text-sm font-semibold mb-2">
                    {user.role === 'kasir' ? '💳 Kasir' : '👔 Owner'}: {user.username}
                  </div>
                </div>
                {user.role === 'kasir' && (
                  <Link
                    to="/kasir"
                    className="block py-2 px-4 hover:bg-blue-500 rounded transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard Kasir
                  </Link>
                )}
                {user.role === 'owner' && (
                  <Link
                    to="/owner"
                    className="block py-2 px-4 hover:bg-blue-500 rounded transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard Owner
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 px-4 hover:bg-red-500 rounded transition mt-2 flex items-center gap-2"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="py-2 px-4 hover:bg-green-500 rounded transition mt-2 flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LogIn size={18} />
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
