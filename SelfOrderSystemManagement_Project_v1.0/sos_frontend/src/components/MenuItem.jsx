import { Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const MenuItem = ({ item }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(item);
  };

  const isAvailable = item.stock > 0;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow flex flex-row sm:flex-row gap-4 p-4 h-full">
      {/* Image - Left on desktop, top on mobile */}
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0 overflow-hidden bg-gray-200 rounded-lg">
        <img
          src={item.image || 'https://via.placeholder.com/200x200?text=No+Image'}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        {!isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-sm">Habis</span>
          </div>
        )}
      </div>

      {/* Content - Right on desktop, below on mobile */}
      <div className="flex flex-col sm:flex-col grow w-full">
        {/* Header: Title, Category Badge, Bestseller Badge */}
        <div className="flex items-start gap-2 mb-1 flex-wrap">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-800 text-sm sm:text-base truncate">
              {item.name}
            </h3>
          </div>
          {item.isBestseller && (
            <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-semibold shrink-0">
              🔥 Paling Laris
            </span>
          )}
        </div>

        {/* Category and Status */}
        <div className="flex items-center gap-2 mb-2 flex-wrap text-xs">
          <span className="text-gray-600">{item.category}</span>
          <span className={`px-2 py-0.5 rounded-full font-semibold ${
            isAvailable
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {isAvailable ? 'Tersedia' : 'Habis'}
          </span>
        </div>

        {/* Description - One line max */}
        <p className="text-xs text-gray-600 mb-2 line-clamp-1">
          {item.description}
        </p>

        {/* Price */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <p className="text-base sm:text-lg font-bold text-orange-600">
            Rp {item.price.toLocaleString('id-ID')}
          </p>
        </div>

        {/* Stock and Button Row */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          {isAvailable && item.stock && (
            <p className="text-xs text-gray-500">Stok: {item.stock}</p>
          )}
          <button
            onClick={handleAddToCart}
            disabled={!isAvailable}
            className={`ml-auto py-1.5 px-3 rounded-lg font-semibold flex items-center justify-center gap-1 transition text-xs sm:text-sm whitespace-nowrap ${
              isAvailable
                ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Plus size={16} />
            Tambah
          </button>
        </div>
      </div>
    </div>
  );
};
