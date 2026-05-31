import { useState } from 'react';
import { MenuManager } from '../components/MenuManager';
import { UtensilsCrossed } from 'lucide-react';

const DEFAULT_MENUS = [
  { id: 1, name: 'Nasi Goreng Spesial', category: 'Makanan', price: 32000, stock: 10 },
  { id: 2, name: 'Ayam Bakar Madu',     category: 'Makanan', price: 38000, stock: 8  },
];

export const KasirMenuPage = () => {
  const [menus, setMenus] = useState(() => {
    const saved = localStorage.getItem('menus');
    return saved ? JSON.parse(saved) : DEFAULT_MENUS;
  });

  const handleSetMenus = (updated) => {
    setMenus(updated);
    localStorage.setItem('menus', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UtensilsCrossed size={24} className="text-green-600" />
            Kelola Menu
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Tambah, edit, atau hapus item menu restoran
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-6">
        <MenuManager menus={menus} setMenus={handleSetMenus} />
      </div>
    </div>
  );
};
