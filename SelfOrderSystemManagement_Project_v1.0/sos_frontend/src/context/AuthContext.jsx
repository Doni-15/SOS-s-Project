import { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Restore user dari localStorage
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (username, password, role) => {
    // Validasi sederhana
    if (username && password && role) {
      const userData = {
        id: Date.now(),
        username,
        role, // 'kasir' atau 'owner'
        loginTime: new Date().toISOString(),
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('authToken', `token_${Date.now()}`);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isKasir: user?.role === 'kasir',
    isOwner: user?.role === 'owner',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
