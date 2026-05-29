import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserPage } from './pages/UserPage';
import { LoginPage } from './pages/LoginPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { KasirPage } from './pages/KasirPage';
import { OwnerPage } from './pages/OwnerPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<UserPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />

            {/* Protected Routes - Kasir */}
            <Route
              path="/kasir"
              element={
                <ProtectedRoute requiredRole="kasir">
                  <KasirPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes - Owner */}
            <Route
              path="/owner"
              element={
                <ProtectedRoute requiredRole="owner">
                  <OwnerPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback Route */}
            <Route path="*" element={<UserPage />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
