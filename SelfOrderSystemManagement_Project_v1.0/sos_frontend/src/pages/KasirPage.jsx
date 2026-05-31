import { useState } from 'react';
import { LogOut, ChefHat } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { OrderList }      from '../components/OrderList';
import { MenuManager }    from '../components/MenuManager';
import { TransaksiPanel } from '../components/TransaksiPanel';

const DEFAULT_MENUS = [
  { id: 1, name: 'Nasi Goreng Spesial', category: 'Makanan', price: 32000, stock: 10 },
  { id: 2, name: 'Ayam Bakar Madu',     category: 'Makanan', price: 38000, stock: 8  },
];

const TABS = [
  { key: 'orders',    label: '📦 Pesanan'    },
  { key: 'transaksi', label: '💳 Transaksi'  },
  { key: 'menu',      label: '🍽️ Kelola Menu' },
];

export const KasirPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders');
  const [selectedTable, setSelectedTable] = useState(() => {
    const saved = localStorage.getItem('selectedTable');
    return saved ? parseInt(saved) : null;
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [menus, setMenus] = useState(() => {
    const saved = localStorage.getItem('menus');
    return saved ? JSON.parse(saved) : DEFAULT_MENUS;
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSelectTable = (tableNumber) => {
    setSelectedTable(tableNumber);
    localStorage.setItem('selectedTable', tableNumber.toString());
  };

  const handleClearTable = () => {
    setSelectedTable(null);
    localStorage.removeItem('selectedTable');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header with Table Info */}
      {/* <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 shadow-lg relative z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ChefHat size={24} />
              <h1 className="text-3xl font-bold">Dashboard Kasir</h1>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-5 py-2.5 rounded-lg font-semibold transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div> */}

      {/* Tabs */}
      <div className="bg-white border-b border-gray-300 sticky top-20 z-20">
        <div className="max-w-7xl mx-auto flex gap-0">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-6 py-4 font-semibold transition border-b-4 ${
                activeTab === key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              {label}
              {key === 'orders' && ` (${orders.length})`}
              {key === 'menu'   && ` (${menus.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'orders'    && <OrderList      orders={orders} />}
        {activeTab === 'transaksi' && <TransaksiPanel menus={menus} orders={orders} setOrders={setOrders} tableNumber={selectedTable} />}
        {activeTab === 'menu'      && <MenuManager    menus={menus}  setMenus={setMenus} />}
      </div>
    </div>
  );
};
