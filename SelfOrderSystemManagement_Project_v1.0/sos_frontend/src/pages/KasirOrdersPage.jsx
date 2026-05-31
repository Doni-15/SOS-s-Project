import { useState, useEffect } from 'react';
import { Download, Search, Filter, CheckCircle, Clock, Package, RefreshCw, Trash2 } from 'lucide-react';
import { printReceipt } from '../utils/printReceipt';

const STATUS_OPTIONS = ['Semua', 'pending', 'selesai'];
const TYPE_OPTIONS   = ['Semua', 'dine-in', 'take-away'];

export const KasirOrdersPage = () => {
  const [orders, setOrders]     = useState([]);
  const [search, setSearch]     = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [filterType, setFilterType]     = useState('Semua');

  // Load orders
  const loadOrders = () => {
    const saved = localStorage.getItem('orders');
    setOrders(saved ? JSON.parse(saved) : []);
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000); // auto-refresh 5s
    return () => clearInterval(interval);
  }, []);

  // Update status pesanan
  const updateStatus = (orderId, newStatus) => {
    const updated = orders.map((o) =>
      o.orderId === orderId ? { ...o, status: newStatus } : o
    );
    setOrders(updated);
    localStorage.setItem('orders', JSON.stringify(updated));
  };

  // Hapus pesanan
  const deleteOrder = (orderId) => {
    if (!window.confirm('Hapus pesanan ini?')) return;
    const updated = orders.filter((o) => o.orderId !== orderId);
    setOrders(updated);
    localStorage.setItem('orders', JSON.stringify(updated));
  };

  // Filter
  const filtered = orders
    .filter((o) => {
      const q = search.toLowerCase();
      const matchSearch =
        o.orderId.toLowerCase().includes(q) ||
        (o.customerName || '').toLowerCase().includes(q) ||
        (o.tableNumber || '').toLowerCase().includes(q);
      const matchStatus = filterStatus === 'Semua' || (o.status || 'pending') === filterStatus;
      const matchType   = filterType   === 'Semua' || (o.orderType || 'dine-in') === filterType;
      return matchSearch && matchStatus && matchType;
    })
    .slice()
    .reverse();

  const countByStatus = (s) => orders.filter((o) => (o.status || 'pending') === s).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-4 items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Package size={24} className="text-blue-600" />
              Manajemen Pesanan
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Kelola semua pesanan masuk dari pelanggan
            </p>
          </div>
          {/* Stats */}
          <div className="flex gap-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-center">
              <p className="text-2xl font-bold text-yellow-600">{countByStatus('pending')}</p>
              <p className="text-xs text-yellow-700 font-semibold">Pending</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-center">
              <p className="text-2xl font-bold text-green-600">{countByStatus('selesai')}</p>
              <p className="text-xs text-green-700 font-semibold">Selesai</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-center">
              <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
              <p className="text-xs text-blue-700 font-semibold">Total</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-6 space-y-4">
        {/* Filters Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-grow min-w-[200px]">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Cari pesanan, nama, meja..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-gray-500" />
              <span className="text-xs text-gray-500 font-semibold">Status:</span>
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition capitalize ${
                    filterStatus === s
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                  }`}
                >
                  {s === 'Semua' ? 'Semua' : s === 'pending' ? '⏳ Pending' : '✅ Selesai'}
                </button>
              ))}
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-semibold">Tipe:</span>
              {TYPE_OPTIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition capitalize ${
                    filterType === t
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                  }`}
                >
                  {t === 'Semua' ? 'Semua' : t === 'dine-in' ? '🍽️ Dine In' : '🛍️ Take Away'}
                </button>
              ))}
            </div>

            {/* Refresh */}
            <button
              onClick={loadOrders}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition ml-auto"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>

        {/* Orders List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500 text-lg font-semibold">Belum ada pesanan</p>
            <p className="text-gray-400 text-sm mt-1">
              Pesanan dari pelanggan akan muncul di sini secara otomatis
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => {
              const status    = order.status || 'pending';
              const orderType = order.orderType || 'dine-in';
              const isPending = status === 'pending';

              return (
                <div
                  key={order.orderId}
                  className={`bg-white rounded-xl shadow-sm border-l-4 transition hover:shadow-md ${
                    isPending ? 'border-l-yellow-400' : 'border-l-green-500'
                  } border border-gray-200`}
                >
                  {/* Order Header */}
                  <div className="flex flex-wrap gap-3 items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-sm font-bold text-gray-700">{order.orderId}</span>

                      {/* Type Badge */}
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        orderType === 'dine-in'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {orderType === 'dine-in' ? '🍽️ Dine In' : '🛍️ Take Away'}
                      </span>

                      {/* Status Badge */}
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        isPending
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {isPending ? <Clock size={11} /> : <CheckCircle size={11} />}
                        {isPending ? 'Pending' : 'Selesai'}
                      </span>
                    </div>

                    <span className="text-xs text-gray-400">
                      {new Date(order.timestamp).toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Order Body */}
                  <div className="px-5 py-4">
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Pelanggan</p>
                        <p className="font-semibold text-gray-800">{order.customerName || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                          {orderType === 'dine-in' ? 'No. Meja' : 'No. Antrian'}
                        </p>
                        <p className="font-semibold text-gray-800">{order.tableNumber || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Pembayaran</p>
                        <p className="font-semibold text-gray-800 capitalize">{order.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Total</p>
                        <p className="font-bold text-orange-600">
                          Rp {(order.totalPrice || 0).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Item Pesanan</p>
                      <div className="space-y-1">
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              {item.name} <span className="text-gray-400">×{item.quantity}</span>
                            </span>
                            <span className="font-semibold text-gray-700">
                              Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {order.notes && (
                      <div className="mb-4 text-sm text-gray-600 italic bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                        📝 {order.notes}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {isPending ? (
                        <button
                          onClick={() => updateStatus(order.orderId, 'selesai')}
                          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                        >
                          <CheckCircle size={15} />
                          Tandai Selesai
                        </button>
                      ) : (
                        <button
                          onClick={() => updateStatus(order.orderId, 'pending')}
                          className="flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                        >
                          <Clock size={15} />
                          Kembalikan Pending
                        </button>
                      )}
                      <button
                        onClick={() => printReceipt(order)}
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                      >
                        <Download size={15} />
                        Cetak Struk
                      </button>
                      <button
                        onClick={() => deleteOrder(order.orderId)}
                        className="flex items-center gap-1.5 border border-red-200 text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-semibold transition ml-auto"
                      >
                        <Trash2 size={15} />
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
