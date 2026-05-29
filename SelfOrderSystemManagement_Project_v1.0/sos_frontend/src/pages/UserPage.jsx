import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { MenuItem } from '../components/MenuItem';
import { CartDrawer } from '../components/CartDrawer';
import { useCart } from '../context/CartContext';

// Sample menu data
const SAMPLE_MENU = [
  {
    id: 1,
    name: 'Nasi Goreng Spesial',
    category: 'Makanan',
    price: 32000,
    stock: 10,
    description: 'Nasi goreng dengan telur, sayuran segar, udang dan telur puyuh',
    image: 'https://images.unsplash.com/photo-1623339663908-14762b8fc03e?w=300&h=300&fit=crop',
  },
  {
    id: 2,
    name: 'Ayam Bakar Madu',
    category: 'Makanan',
    price: 38000,
    stock: 8,
    description: 'Ayam bakar dengan bumbu madu yang lezat dan gurih',
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=300&h=300&fit=crop',
  },
  {
    id: 3,
    name: 'Mie Goreng Seafood',
    category: 'Makanan',
    price: 29000,
    stock: 12,
    description: 'Mie goreng dengan udang, cumi, dan berbagai seafood pilihan',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc025?w=300&h=300&fit=crop',
  },
  {
    id: 4,
    name: 'Sate Ayam',
    category: 'Makanan',
    price: 25000,
    stock: 0,
    description: 'Sate ayam dengan bumbu kacang dan sambal pedas',
    image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd64b98?w=300&h=300&fit=crop',
  },
  {
    id: 5,
    name: 'Rendang Sapi',
    category: 'Makanan',
    price: 40000,
    stock: 5,
    description: 'Rendang sapi tradisional dengan santan dan rempah pilihan',
    image: 'https://images.unsplash.com/photo-1585937421841-c8526f6e9c1b?w=300&h=300&fit=crop',
  },
  {
    id: 6,
    name: 'Es Cendol',
    category: 'Minuman',
    price: 12000,
    stock: 20,
    description: 'Es cendol dingin dengan santan manis dan gula jawa',
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5da27?w=300&h=300&fit=crop',
  },
  {
    id: 7,
    name: 'Jus Mangga',
    category: 'Minuman',
    price: 15000,
    stock: 15,
    description: 'Jus mangga segar tanpa pengawet',
    image: 'https://images.unsplash.com/photo-1599599810221-ae2a02f148fe?w=300&h=300&fit=crop',
  },
  {
    id: 8,
    name: 'Kopi Hitam',
    category: 'Minuman',
    price: 8000,
    stock: 25,
    description: 'Kopi hitam panas dengan rasa yang nikmat',
    image: 'https://images.unsplash.com/photo-1559056169-641ef0ac8b9b?w=300&h=300&fit=crop',
  },
  {
    id: 9,
    name: 'Lumpia Goreng',
    category: 'Snack',
    price: 10000,
    stock: 18,
    description: 'Lumpia goreng renyah dengan isi daging dan sayuran',
    image: 'https://images.unsplash.com/photo-1599599810840-0e3234f09590?w=300&h=300&fit=crop',
  },
  {
    id: 10,
    name: 'Tahu Goreng',
    category: 'Snack',
    price: 7000,
    stock: 22,
    description: 'Tahu goreng emas dengan daging halus dan bumbu spesial',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=300&fit=crop',
  },
];

export const UserPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const { getTotalItems } = useCart();

  const categories = ['Semua', 'Makanan', 'Minuman', 'Snack'];

  const filteredMenu = useMemo(() => {
    return SAMPLE_MENU.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === 'Semua' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-blue-600 text-white sticky top-16 z-40 px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-bold mb-4">Pilih menu favorit Anda</h1>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-semibold transition whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-white text-blue-600'
                    : 'bg-blue-500 text-white hover:bg-blue-400'
                }`}
              >
                {category === 'Makanan' && '🍽️ '}
                {category === 'Minuman' && '🥤 '}
                {category === 'Snack' && '🍿 '}
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Floating Button (Mobile) */}
      {getTotalItems() > 0 && (
        <button
          onClick={() => setCartDrawerOpen(true)}
          className="fixed bottom-6 right-6 sm:hidden bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg font-bold text-lg hover:bg-blue-700 transition"
        >
          🛒 {getTotalItems()}
        </button>
      )}

      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredMenu.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMenu.map((item) => (
              <MenuItem key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg font-semibold">
              Menu tidak ditemukan
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Coba ubah filter atau kata kunci pencarian
            </p>
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
      />

      {/* Desktop Cart Sidebar */}
      <div className="hidden sm:fixed sm:bottom-0 sm:right-0 sm:top-16 sm:w-96 sm:bg-gray-100 sm:border-l sm:border-gray-300 sm:flex sm:flex-col sm:block">
        <CartDrawer isOpen={true} onClose={() => {}} />
      </div>
    </div>
  );
};
