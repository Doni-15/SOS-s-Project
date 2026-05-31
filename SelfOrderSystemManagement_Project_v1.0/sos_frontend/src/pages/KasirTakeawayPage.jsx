import { useState } from 'react';
import { TransaksiPanel } from '../components/TransaksiPanel';
import { ShoppingBag } from 'lucide-react';

const DEFAULT_MENUS = [
  { id: 1, name: 'Nasi Goreng Spesial', category: 'Makanan', price: 32000, stock: 10 },
  { id: 2, name: 'Ayam Bakar Madu',     category: 'Makanan', price: 38000, stock: 8  },
];

export const KasirTakeawayPage = () => {
  const [menus] = useState(() => {
    const saved = localStorage.getItem('menus');
    return saved ? JSON.parse(saved) : DEFAULT_MENUS;
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : [];
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingBag size={24} className="text-purple-600" />
            Transaksi Take Away
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Input pesanan mandiri untuk pelanggan take away
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-6">
        <TransaksiPanel
          menus={menus}
          orders={orders}
          setOrders={setOrders}
          mode="takeaway"
        />
      </div>
    </div>
  );
};
