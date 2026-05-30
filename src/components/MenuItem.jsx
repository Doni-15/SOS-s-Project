import { Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const MenuItem = ({ item }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(item);
  };

  const isAvailable = item.stock > 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition h-full flex flex-col">
      {/* Image */}
      <div className="relative w-full h-40 overflow-hidden bg-gray-200">
        <img
          src={item.image || 'https://via.placeholder.com/200x200?text=No+Image'}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        {!isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Habis</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Title and Category */}
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="font-bold text-gray-800 flex-grow">{item.name}</h3>
          <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap font-semibold ${
            isAvailable
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {isAvailable ? 'Tersedia' : 'Habis'}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {item.description || 'Makanan lezat yang menggugah selera'}
        </p>

        {/* Price and Stock Info */}
        <div className="flex justify-between items-center mb-3 mt-auto">
          <div>
            <p className="text-lg font-bold text-orange-600">
              Rp {item.price.toLocaleString('id-ID')}
            </p>
            {isAvailable && (
              <p className="text-xs text-gray-500">Stok: {item.stock}</p>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!isAvailable}
          className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
            isAvailable
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Plus size={18} />
          Tambah
        </button>
      </div>
    </div>
  );
};
