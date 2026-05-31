import { useState } from 'react';
import { ArrowLeft, Trash2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    tableNumber: '',
    notes: '',
    paymentMethod: 'cash',
    orderType: 'dine-in',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">
            Pesanan Berhasil!
          </h1>
          <p className="text-gray-600 mb-6">
            Pesanan Anda telah diterima dan sedang diproses
          </p>

          <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Total Pembayaran:</strong>
            </p>
            <p className="text-2xl font-bold text-orange-600 mb-4">
              Rp {getTotalPrice().toLocaleString('id-ID')}
            </p>
            <p className="text-sm text-gray-600">
              Struk telah dicetak. Silakan menunggu pesanan Anda dipanggil.
            </p>
          </div>

          <button
            onClick={() => {
              navigate('/');
              window.location.reload();
            }}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Kembali ke Menu
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Validasi
      if (!formData.customerName.trim()) {
        alert('Nama pelanggan harus diisi');
        setIsProcessing(false);
        return;
      }

      if (!formData.phone.trim()) {
        alert('Nomor telepon harus diisi');
        setIsProcessing(false);
        return;
      }

      // Simulasi proses
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Buat receipt
      const receipt = {
        orderId: `ORD-${Date.now()}`,
        customerName: formData.customerName,
        phone: formData.phone,
        tableNumber: formData.orderType === 'dine-in'
          ? (formData.tableNumber || '-')
          : `Antrian-${Date.now().toString().slice(-4)}`,
        orderType: formData.orderType,
        items: cartItems,
        totalPrice: getTotalPrice(),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        timestamp: new Date().toISOString(),
        status: 'pending',
      };

      // Simpan ke localStorage (untuk kasir nanti bisa print)
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push(receipt);
      localStorage.setItem('orders', JSON.stringify(orders));

      // Clear cart
      clearCart();
      setOrderSuccess(true);
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Keranjang Anda Kosong
          </h1>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 mx-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            <ArrowLeft size={20} />
            Kembali ke Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6"
        >
          <ArrowLeft size={20} />
          Kembali
        </button>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Order Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Informasi Pesanan
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Customer Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nama Pelanggan *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                    placeholder="Masukkan nama Anda"
                    disabled={isProcessing}
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nomor Telepon *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                    placeholder="08xxxxxxxxxx"
                    disabled={isProcessing}
                  />
                </div>

                {/* Order Type Toggle */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipe Pesanan *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, orderType: 'dine-in' }))}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition ${
                        formData.orderType === 'dine-in'
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      🍽️ Dine In
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, orderType: 'take-away', tableNumber: '' }))}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition ${
                        formData.orderType === 'take-away'
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      🛍️ Take Away
                    </button>
                  </div>
                </div>

                {/* Table Number — only for Dine In */}
                {formData.orderType === 'dine-in' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nomor Meja *
                  </label>
                  <input
                    type="text"
                    name="tableNumber"
                    value={formData.tableNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                    placeholder="Contoh: A1, B5, dll"
                    disabled={isProcessing}
                  />
                </div>
                )}

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Metode Pembayaran
                  </label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                    disabled={isProcessing}
                  >
                    <option value="cash">💵 Tunai</option>
                    <option value="card">💳 Kartu Kredit/Debit</option>
                    <option value="transfer">🏦 Transfer Bank</option>
                    <option value="ewallet">📱 E-Wallet</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Catatan Pesanan (Opsional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                    placeholder="Contoh: Tanpa sambal, pedas, dll"
                    rows="3"
                    disabled={isProcessing}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                >
                  {isProcessing ? 'Memproses Pesanan...' : 'Konfirmasi Pesanan'}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-20">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Ringkasan Pesanan
              </h3>

              <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center pb-2 border-b border-gray-200"
                  >
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-800">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        x{item.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-orange-600">
                      Rp{' '}
                      {(item.price * item.quantity).toLocaleString(
                        'id-ID'
                      )}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-gray-300 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">
                    Rp {getTotalPrice().toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Pajak (10%):</span>
                  <span className="font-semibold">
                    Rp {Math.round(getTotalPrice() * 0.1).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-orange-600">
                    Rp{' '}
                    {Math.round(getTotalPrice() * 1.1).toLocaleString(
                      'id-ID'
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
