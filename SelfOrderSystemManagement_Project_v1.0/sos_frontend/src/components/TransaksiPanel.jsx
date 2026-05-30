import { useState, useMemo } from 'react';
import { Search, ShoppingCart, Minus, Plus, X, Download, Printer, CheckCircle } from 'lucide-react';
import { printReceipt } from '../utils/printReceipt';

const CATEGORIES = ['Semua', 'Makanan', 'Minuman', 'Snack'];
const PAY_METHODS = [
  { value: 'cash',  label: '💵 Tunai' },
  { value: 'qris',  label: '📱 QRIS'  },
  { value: 'card',  label: '💳 Kartu'  },
];

export const TransaksiPanel = ({ menus, orders, setOrders }) => {
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('Semua');
  const [cart, setCart]           = useState([]);
  const [table, setTable]         = useState('');
  const [payMethod, setPayMethod] = useState('cash');
  const [cash, setCash]           = useState('');
  const [note, setNote]           = useState('');
  const [success, setSuccess]     = useState(null);

  /* ── Filtered menu ── */
  const filteredMenus = useMemo(() => {
    return menus.filter((m) => {
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
      const matchCat    = category === 'Semua' || m.category === category;
      return matchSearch && matchCat;
    });
  }, [menus, search, category]);

  /* ── Totals ── */
  const subtotal  = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax       = Math.round(subtotal * 0.1);
  const service   = Math.round(subtotal * 0.025);
  const total     = subtotal + tax + service;
  const cashNum   = parseInt(cash.replace(/\D/g, '')) || 0;
  const change    = cashNum - total;

  /* ── Cart helpers ── */
  const addItem = (menu) => {
    if (menu.stock <= 0) return;
    setCart((prev) => {
      const exists = prev.find((i) => i.id === menu.id);
      return exists
        ? prev.map((i) => i.id === menu.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...menu, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((i) => i.id === id ? { ...i, qty: i.qty + delta } : i)
        .filter((i) => i.qty > 0)
    );
  };

  const removeItem = (id) => setCart((prev) => prev.filter((i) => i.id !== id));

  /* ── Reset ── */
  const reset = () => {
    setCart([]); setTable(''); setPayMethod('cash');
    setCash(''); setNote(''); setSuccess(null);
  };

  /* ── Save ── */
  const save = () => {
    if (cart.length === 0)              { alert('Keranjang kosong!'); return; }
    if (!table.trim())                  { alert('Nomor meja harus diisi!'); return; }
    if (payMethod === 'cash' && cashNum < total) { alert('Uang yang diberikan kurang!'); return; }

    const order = {
      orderId:       `ORD-${Date.now()}`,
      customerName:  `Meja ${table}`,
      tableNumber:   table,
      paymentMethod: payMethod,
      items:         cart.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.qty })),
      subtotal, tax, serviceCharge: service,
      totalPrice:    total,
      cashPaid:      payMethod === 'cash' ? cashNum : total,
      change:        payMethod === 'cash' ? change : 0,
      notes:         note,
      timestamp:     new Date().toISOString(),
    };

    const updated = [...orders, order];
    setOrders(updated);
    localStorage.setItem('orders', JSON.stringify(updated));
    setSuccess(order);
  };

  /* ── Success screen ── */
  if (success) {
    return (
      <div className="max-w-lg mx-auto mt-8 bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={36} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-green-600 mb-1">Transaksi Berhasil!</h2>
        <p className="text-gray-400 mb-6 font-mono text-sm">{success.orderId}</p>

        <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6 text-sm">
          {[
            ['Meja',          success.tableNumber],
            ['Subtotal',      `Rp ${success.subtotal.toLocaleString('id-ID')}`],
            ['Pajak (10%)',   `Rp ${success.tax.toLocaleString('id-ID')}`],
            ['Service (2.5%)',`Rp ${success.serviceCharge.toLocaleString('id-ID')}`],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between">
              <span className="text-gray-500">{label}</span>
              <span>{val}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-base border-t pt-2">
            <span>Total Tagihan</span>
            <span className="text-blue-600">Rp {success.totalPrice.toLocaleString('id-ID')}</span>
          </div>
          {success.paymentMethod === 'cash' && (
            <div className="flex justify-between text-green-700 font-bold">
              <span>Kembalian</span>
              <span>Rp {success.change.toLocaleString('id-ID')}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => printReceipt(success)}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
          >
            <Printer size={18} /> Cetak Struk
          </button>
          <button
            onClick={reset}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition"
          >
            Transaksi Baru
          </button>
        </div>
      </div>
    );
  }

  /* ── Main layout ── */
  return (
    <div className="grid lg:grid-cols-5 gap-6 mt-2">

      {/* LEFT — Menu picker */}
      <div className="lg:col-span-3 space-y-4">
        {/* Search & Category */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Cari menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
                  category === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[480px] overflow-y-auto pr-1">
          {filteredMenus.length === 0 && (
            <p className="col-span-3 text-center text-gray-400 py-10">Menu tidak ditemukan</p>
          )}
          {filteredMenus.map((menu) => {
            const inCart     = cart.find((i) => i.id === menu.id);
            const unavailable = menu.stock <= 0;
            return (
              <button
                key={menu.id}
                onClick={() => addItem(menu)}
                disabled={unavailable}
                className={`relative text-left p-3 rounded-xl border-2 transition ${
                  unavailable
                    ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    : inCart
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                }`}
              >
                {inCart && (
                  <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {inCart.qty}
                  </span>
                )}
                <p className="font-semibold text-gray-800 text-sm leading-tight mb-1 pr-5">{menu.name}</p>
                <p className="text-xs text-gray-400 mb-2">{menu.category}</p>
                <p className="text-blue-600 font-bold text-sm">Rp {menu.price.toLocaleString('id-ID')}</p>
                <p className={`text-xs mt-1 ${menu.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  Stok: {menu.stock}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT — Order summary + form */}
      <div className="lg:col-span-2 flex flex-col gap-4">

        {/* Ringkasan Pesanan */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
            <span className="font-semibold flex items-center gap-2">
              <ShoppingCart size={16} /> Ringkasan Pesanan
            </span>
            {cart.length > 0 && (
              <button onClick={() => setCart([])} className="text-blue-200 hover:text-white text-xs underline">
                Kosongkan
              </button>
            )}
          </div>

          {/* Items */}
          <div className="max-h-52 overflow-y-auto p-3 space-y-2">
            {cart.length === 0 ? (
              <p className="text-center text-gray-400 py-6 text-sm">Pilih menu dari kiri</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center gap-2 text-sm">
                  <div className="flex-grow min-w-0">
                    <p className="font-semibold text-gray-800 truncate leading-tight">{item.name}</p>
                    <p className="text-gray-400 text-xs">Rp {item.price.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full">
                      <Minus size={12} />
                    </button>
                    <span className="w-5 text-center font-bold text-sm">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full">
                      <Plus size={12} />
                    </button>
                    <button onClick={() => removeItem(item.id)} className="w-6 h-6 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-full ml-0.5">
                      <X size={12} />
                    </button>
                  </div>
                  <span className="w-20 text-right font-semibold text-gray-700 text-xs shrink-0">
                    Rp {(item.price * item.qty).toLocaleString('id-ID')}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Totals */}
          <div className="border-t border-gray-100 p-3 space-y-1 text-sm">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>Rp {subtotal.toLocaleString('id-ID')}</span></div>
            <div className="flex justify-between text-gray-500"><span>Pajak (10%)</span><span>Rp {tax.toLocaleString('id-ID')}</span></div>
            <div className="flex justify-between text-gray-500"><span>Service (2.5%)</span><span>Rp {service.toLocaleString('id-ID')}</span></div>
            <div className="flex justify-between font-bold text-base pt-2 border-t">
              <span>Total Tagihan</span>
              <span className="text-blue-600">Rp {total.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Form input */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
          {/* Nomor Meja */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Nomor Meja *</label>
            <input
              type="text"
              placeholder="Contoh: 1, A5, VIP-2"
              value={table}
              onChange={(e) => setTable(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Metode Pembayaran */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Metode Pembayaran</label>
            <div className="grid grid-cols-3 gap-2">
              {PAY_METHODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setPayMethod(m.value)}
                  className={`py-2 rounded-lg text-xs font-semibold border-2 transition ${
                    payMethod === m.value
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nominal (cash only) */}
          {payMethod === 'cash' && (
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Nominal Dibayar</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 text-sm font-semibold">Rp</span>
                <input
                  type="text"
                  placeholder="0"
                  value={cash}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    setCash(raw ? parseInt(raw).toLocaleString('id-ID') : '');
                  }}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              {cashNum > 0 && (
                <div className={`mt-2 px-3 py-2 rounded-lg text-sm font-bold flex justify-between ${
                  change >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                }`}>
                  <span>{change >= 0 ? 'Kembalian' : 'Kurang'}</span>
                  <span>Rp {Math.abs(change).toLocaleString('id-ID')}</span>
                </div>
              )}
            </div>
          )}

          {/* Catatan */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Catatan (Opsional)</label>
            <textarea
              placeholder="Tulis catatan jika diperlukan..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={300}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={reset}
              className="flex-1 py-2.5 rounded-lg border-2 border-gray-300 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              onClick={save}
              disabled={cart.length === 0}
              className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download size={16} />
              Simpan Transaksi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
