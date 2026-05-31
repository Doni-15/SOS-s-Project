import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { db, auth } from '../../utils/supabaseClient';
import { ShoppingCart, Plus, Minus, Trash2, Loader } from 'lucide-react';

export const CustomerDashboard = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();

  // Fetch menus from Supabase
  useEffect(() => {
    fetchMenus();
  }, [selectedCategory]);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = { is_available: true };
      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }
      
      const data = await db.getMenus(filters);
      setMenus(data);
    } catch (err) {
      setError('Gagal memuat menu. Silakan coba lagi.');
      console.error('Error fetching menus:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories
  const categories = ['all', ...new Set(menus.map(menu => menu.category).filter(Boolean))];

  // Handle add to cart
  const handleAddToCart = (menu) => {
    const cartItem = {
      id: menu.id,
      name: menu.name,
      price: menu.price,
      description: menu.description,
      image_url: menu.image_url,
      category: menu.category,
    };
    addToCart(cartItem);
  };

  // Handle order submission
  const handleOrderNow = async () => {
    try {
      setIsSubmitting(true);
      setOrderError(null);
      setOrderSuccess(false);

      // Get current user
      const user = await auth.getCurrentUser();
      if (!user) {
        setOrderError('Silakan login terlebih dahulu untuk melakukan pemesanan.');
        return;
      }

      // Calculate total amount
      const totalAmount = getTotalPrice();

      // Create order
      const orderData = {
        customer_id: user.id,
        total_amount: totalAmount,
        status: 'pending',
        notes: 'Order dari customer dashboard',
      };

      const order = await db.createOrder(orderData);

      // Create order items
      for (const item of cartItems) {
        const orderItemData = {
          order_id: order.id,
          menu_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.price * item.quantity,
        };
        await db.createOrderItem(orderItemData);
      }

      // Clear cart and show success
      clearCart();
      setOrderSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => setOrderSuccess(false), 3000);
    } catch (err) {
      setOrderError('Gagal melakukan pemesanan. Silakan coba lagi.');
      console.error('Error creating order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchMenus}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Menu Kami</h1>
          <p className="text-gray-600 mt-1">Pilih menu favorit Anda dan pesan sekarang</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Menu Section */}
          <div className="flex-1">
            {/* Category Filter */}
            <div className="mb-6 flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category === 'all' ? 'Semua' : category}
                </button>
              ))}
            </div>

            {/* Menu Grid */}
            {menus.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500">Tidak ada menu yang tersedia saat ini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {menus.map((menu) => (
                  <div
                    key={menu.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {menu.image_url && (
                      <img
                        src={menu.image_url}
                        alt={menu.name}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{menu.name}</h3>
                        {menu.category && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {menu.category}
                          </span>
                        )}
                      </div>
                      {menu.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{menu.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-gray-900">
                          Rp {menu.price.toLocaleString('id-ID')}
                        </span>
                        <button
                          onClick={() => handleAddToCart(menu)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Tambah
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Section */}
          <div className="lg:w-96">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Keranjang
                </h2>
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {cartItems.length} item
                </span>
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Keranjang kosong</p>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 pb-3 border-b">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                          <p className="text-sm text-gray-600">
                            Rp {item.price.toLocaleString('id-ID')}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="ml-auto text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>Rp {getTotalPrice().toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Pajak (10%)</span>
                      <span>Rp {(getTotalPrice() * 0.1).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                      <span>Total</span>
                      <span>Rp {(getTotalPrice() * 1.1).toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {/* Order Button */}
                  <button
                    onClick={handleOrderNow}
                    disabled={isSubmitting}
                    className="w-full mt-4 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader className="w-5 h-5 animate-spin" />
                        Memproses...
                      </span>
                    ) : (
                      'Pesan Sekarang'
                    )}
                  </button>

                  {/* Success/Error Messages */}
                  {orderSuccess && (
                    <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm">
                      Pesanan berhasil dibuat! Pesanan Anda sedang diproses.
                    </div>
                  )}
                  {orderError && (
                    <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
                      {orderError}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
