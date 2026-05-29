import { X, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export const CartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl z-40 transform transition-transform duration-300 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-blue-600 text-white p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart size={24} />
            Keranjang
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-blue-500 rounded">
            <X size={24} />
          </button>
        </div>

        {/* Items */}
        <div className="p-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-semibold">Keranjang Anda Kosong</p>
              <p className="text-gray-400 text-sm mt-2">
                Tambahkan menu untuk memulai pemesanan
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  {/* Item Image */}
                  <div className="w-20 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={item.image || 'https://via.placeholder.com/100'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-grow">
                    <h3 className="font-semibold text-gray-800 text-sm mb-1">
                      {item.name}
                    </h3>
                    <p className="text-orange-600 font-bold text-sm mb-2">
                      Rp {item.price.toLocaleString('id-ID')}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded transition"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 space-y-3">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total:</span>
              <span className="text-orange-600">
                Rp {getTotalPrice().toLocaleString('id-ID')}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Lanjut Pembayaran
            </button>
          </div>
        )}
      </div>
    </>
  );
};
