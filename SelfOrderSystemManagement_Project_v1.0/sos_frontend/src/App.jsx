import './App.css';
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CartDrawerProvider } from './context/CartDrawerContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserPage } from './pages/UserPage';
import { RoleSelectionPage } from './pages/RoleSelectionPage';
import { KasirLoginPage } from './pages/KasirLoginPage';
import { OwnerLoginPage } from './pages/OwnerLoginPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { KasirPage } from './pages/KasirPage';
import { KasirOrdersPage } from './pages/KasirOrdersPage';
import { KasirTakeawayPage } from './pages/KasirTakeawayPage';
import { KasirMenuPage } from './pages/KasirMenuPage';
import { OwnerPage } from './pages/OwnerPage';
import { UserManagementPage } from './pages/UserManagementPage';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <CartDrawerProvider>
            <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <main className="pt-20">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<UserPage />} />
                <Route path="/login" element={<RoleSelectionPage />} />
                <Route path="/login/kasir" element={<KasirLoginPage />} />
                <Route path="/login/owner" element={<OwnerLoginPage />} />
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
                <Route
                  path="/kasir/orders"
                  element={
                    <ProtectedRoute requiredRole="kasir">
                      <KasirOrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/kasir/takeaway"
                  element={
                    <ProtectedRoute requiredRole="kasir">
                      <KasirTakeawayPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/kasir/menu"
                  element={
                    <ProtectedRoute requiredRole="kasir">
                      <KasirMenuPage />
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

                <Route
                  path="/owner/users"
                  element={
                    <ProtectedRoute requiredRole="owner">
                      <UserManagementPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback Route */}
                <Route path="*" element={<UserPage />} />
              </Routes>
            </main>
          </CartDrawerProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
