import { Download } from 'lucide-react';
import { printReceipt } from '../utils/printReceipt';

export const OrderList = ({ orders }) => {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg p-12 text-center shadow-sm">
        <p className="text-4xl mb-3">📦</p>
        <p className="text-gray-500 text-lg font-semibold">Belum ada pesanan</p>
        <p className="text-gray-400 text-sm mt-1">
          Pesanan dari pelanggan atau transaksi kasir akan muncul di sini
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">
        Daftar Pesanan
      </h2>

      <div className="grid gap-4">
        {[...orders].reverse().map((order) => (
          <div
            key={order.orderId}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
          >
            {/* Header info */}
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Order ID</p>
                <p className="font-bold text-gray-800 font-mono text-sm">{order.orderId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Nama / Meja</p>
                <p className="font-bold text-gray-800">{order.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">No. Meja</p>
                <p className="font-bold text-gray-800">{order.tableNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Pembayaran</p>
                <p className="font-bold capitalize text-gray-800">{order.paymentMethod}</p>
              </div>
            </div>

            {/* Items */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="font-semibold text-gray-700 mb-2 text-sm">Item Pesanan:</p>
              <div className="space-y-1">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.name} <span className="text-gray-400">x{item.quantity}</span>
                    </span>
                    <span className="font-semibold text-gray-800">
                      Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <p className="text-xs text-gray-500">Total Pembayaran</p>
                <p className="text-2xl font-bold text-orange-600">
                  Rp {order.totalPrice.toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(order.timestamp).toLocaleString('id-ID')}
                </p>
              </div>
              <button
                onClick={() => printReceipt(order)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold transition"
              >
                <Download size={18} />
                Cetak Struk
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
