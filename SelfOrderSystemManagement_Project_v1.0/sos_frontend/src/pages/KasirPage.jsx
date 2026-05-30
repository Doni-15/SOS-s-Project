import { useState, useMemo } from 'react';
import { Edit2, Trash2, Plus, Download, Search, ShoppingCart, X, Minus, Printer, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DEFAULT_MENUS = [
  { id: 1, name: 'Nasi Goreng Spesial', category: 'Makanan', price: 32000, stock: 10 },
  { id: 2, name: 'Ayam Bakar Madu', category: 'Makanan', price: 38000, stock: 8 },
];

export const KasirPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [menus, setMenus] = useState(() => {
    const saved = localStorage.getItem('menus');
    return saved ? JSON.parse(saved) : DEFAULT_MENUS;
  });

  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Makanan',
    price: '',
    stock: '',
  });

  // ── Transaksi state ──────────────────────────────────────────
  const [txSearch, setTxSearch] = useState('');
  const [txCategory, setTxCategory] = useState('Semua');
  const [txCart, setTxCart] = useState([]);
  const [txTable, setTxTable] = useState('');
  const [txPayMethod, setTxPayMethod] = useState('cash');
  const [txCash, setTxCash] = useState('');
  const [txNote, setTxNote] = useState('');
  const [txSuccess, setTxSuccess] = useState(null); // holds last saved order

  // Filtered menu for transaksi panel
  const txMenus = useMemo(() => {
    return menus.filter((m) => {
      const matchSearch = m.name.toLowerCase().includes(txSearch.toLowerCase());
      const matchCat = txCategory === 'Semua' || m.category === txCategory;
      return matchSearch && matchCat;
    });
  }, [menus, txSearch, txCategory]);

  const txSubtotal = txCart.reduce((s, i) => s + i.price * i.qty, 0);
  const txTax = Math.round(txSubtotal * 0.1);
  const txService = Math.round(txSubtotal * 0.025);
  const txTotal = txSubtotal + txTax + txService;
  const txCashNum = parseInt(txCash.replace(/\D/g, '')) || 0;
  const txChange = txCashNum - txTotal;

  const txAddItem = (menu) => {
    if (menu.stock <= 0) return;
    setTxCart((prev) => {
      const exists = prev.find((i) => i.id === menu.id);
      if (exists) {
        return prev.map((i) => i.id === menu.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...menu, qty: 1 }];
    });
  };

  const txUpdateQty = (id, delta) => {
    setTxCart((prev) =>
      prev
        .map((i) => i.id === id ? { ...i, qty: i.qty + delta } : i)
        .filter((i) => i.qty > 0)
    );
  };

  const txRemoveItem = (id) => setTxCart((prev) => prev.filter((i) => i.id !== id));

  const txReset = () => {
    setTxCart([]);
    setTxTable('');
    setTxPayMethod('cash');
    setTxCash('');
    setTxNote('');
    setTxSuccess(null);
  };

  const txSave = () => {
    if (txCart.length === 0) { alert('Keranjang kosong!'); return; }
    if (!txTable.trim()) { alert('Nomor meja harus diisi!'); return; }
    if (txPayMethod === 'cash' && txCashNum < txTotal) {
      alert('Uang yang diberikan kurang!'); return;
    }

    const newOrder = {
      orderId: `ORD-${Date.now()}`,
      customerName: `Meja ${txTable}`,
      tableNumber: txTable,
      paymentMethod: txPayMethod,
      items: txCart.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.qty })),
      totalPrice: txTotal,
      subtotal: txSubtotal,
      tax: txTax,
      serviceCharge: txService,
      cashPaid: txPayMethod === 'cash' ? txCashNum : txTotal,
      change: txPayMethod === 'cash' ? txChange : 0,
      notes: txNote,
      timestamp: new Date().toISOString(),
    };

    const updated = [...orders, newOrder];
    setOrders(updated);
    localStorage.setItem('orders', JSON.stringify(updated));
    setTxSuccess(newOrder);
  };

  const txPrint = (order) => {
    const win = window.open('', '', 'height=700,width=420');
    win.document.write(`
      <!DOCTYPE html><html><head><title>Struk</title>
      <style>
        body{font-family:'Courier New',monospace;padding:20px;font-size:13px;}
        h2{text-align:center;margin:0 0 4px;}
        .sub{text-align:center;color:#555;font-size:11px;margin-bottom:12px;}
        .line{border-top:1px dashed #000;margin:10px 0;}
        .row{display:flex;justify-content:space-between;margin:4px 0;}
        .bold{font-weight:bold;}
        .total{font-size:15px;font-weight:bold;}
        .center{text-align:center;}
        .badge{background:#000;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;}
      </style></head><body>
      <h2>Kedai Nusantara</h2>
      <div class="sub">Sistem Kasir Resto Nusantara</div>
      <div class="line"></div>
      <div class="row"><span>No. Pesanan:</span><span class="bold">${order.orderId}</span></div>
      <div class="row"><span>Meja:</span><span class="bold">${order.tableNumber}</span></div>
      <div class="row"><span>Waktu:</span><span>${new Date(order.timestamp).toLocaleString('id-ID')}</span></div>
      <div class="line"></div>
      ${order.items.map(i => `
        <div class="row"><span>${i.name}</span><span></span></div>
        <div class="row"><span>&nbsp;&nbsp;${i.quantity} x Rp ${i.price.toLocaleString('id-ID')}</span><span>Rp ${(i.price * i.quantity).toLocaleString('id-ID')}</span></div>
      `).join('')}
      <div class="line"></div>
      <div class="row"><span>Subtotal</span><span>Rp ${order.subtotal.toLocaleString('id-ID')}</span></div>
      <div class="row"><span>Pajak (10%)</span><span>Rp ${order.tax.toLocaleString('id-ID')}</span></div>
      <div class="row"><span>Service (2.5%)</span><span>Rp ${order.serviceCharge.toLocaleString('id-ID')}</span></div>
      <div class="line"></div>
      <div class="row total"><span>TOTAL TAGIHAN</span><span>Rp ${order.totalPrice.toLocaleString('id-ID')}</span></div>
      ${order.paymentMethod === 'cash' ? `
        <div class="row"><span>Tunai</span><span>Rp ${order.cashPaid.toLocaleString('id-ID')}</span></div>
        <div class="row bold"><span>Kembalian</span><span>Rp ${order.change.toLocaleString('id-ID')}</span></div>
      ` : `<div class="row"><span>Metode</span><span>${order.paymentMethod.toUpperCase()}</span></div>`}
      <div class="line"></div>
      <div class="center" style="margin-top:16px;font-size:12px;">Terima kasih telah berkunjung!</div>
      <div class="center" style="font-size:11px;color:#555;">Simpan struk ini sebagai bukti pembayaran</div>
      </body></html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 300);
  };

  const handleAddMenu = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock) {
      alert('Semua field harus diisi');
      return;
    }

    const newMenu = {
      id: editingMenu?.id || Date.now(),
      ...formData,
      price: parseInt(formData.price),
      stock: parseInt(formData.stock),
    };

    let updatedMenus;
    if (editingMenu) {
      updatedMenus = menus.map((m) => (m.id === editingMenu.id ? newMenu : m));
    } else {
      updatedMenus = [...menus, newMenu];
    }

    setMenus(updatedMenus);
    localStorage.setItem('menus', JSON.stringify(updatedMenus));
    setFormData({ name: '', category: 'Makanan', price: '', stock: '' });
    setEditingMenu(null);
    setShowMenuForm(false);
  };

  const handleEditMenu = (menu) => {
    setEditingMenu(menu);
    setFormData(menu);
    setShowMenuForm(true);
  };

  const handleDeleteMenu = (id) => {
    if (confirm('Hapus menu ini?')) {
      const updatedMenus = menus.filter((m) => m.id !== id);
      setMenus(updatedMenus);
      localStorage.setItem('menus', JSON.stringify(updatedMenus));
    }
  };

  const handlePrintReceipt = (order) => {
    const printWindow = window.open('', '', 'height=600,width=400');
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Struk</title>
        <style>
          body { font-family: 'Courier New', monospace; padding: 20px; }
          .receipt { width: 100%; max-width: 300px; }
          h2 { text-align: center; margin-bottom: 10px; }
          .line { border-bottom: 1px dashed #000; margin: 10px 0; }
          .item { display: flex; justify-content: space-between; margin: 5px 0; }
          .total { font-weight: bold; font-size: 16px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <h2>Resto Nusantara</h2>
          <div class="line"></div>
          <div class="item">
            <span>Order ID:</span>
            <span>${order.orderId}</span>
          </div>
          <div class="item">
            <span>Nama:</span>
            <span>${order.customerName}</span>
          </div>
          <div class="item">
            <span>No. Meja:</span>
            <span>${order.tableNumber}</span>
          </div>
          <div class="line"></div>
          ${order.items.map(item => `
            <div class="item">
              <span>${item.name} x${item.quantity}</span>
              <span>Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</span>
            </div>
          `).join('')}
          <div class="line"></div>
          <div class="item total">
            <span>TOTAL:</span>
            <span>Rp ${order.totalPrice.toLocaleString('id-ID')}</span>
          </div>
          <div class="line"></div>
          <p class="footer">Terima kasih telah berbelanja!</p>
          <p class="footer">${new Date(order.timestamp).toLocaleString('id-ID')}</p>
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Kasir</h1>
            <p className="text-blue-100">Selamat datang, {user?.username}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-lg font-semibold transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-0 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-4 font-semibold transition border-b-4 ${
              activeTab === 'orders'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            📦 Pesanan ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-6 py-4 font-semibold transition border-b-4 ${
              activeTab === 'menu'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            🍽️ Kelola Menu ({menus.length})
          </button>
          <button
            onClick={() => { setActiveTab('transaksi'); txReset(); }}
            className={`px-6 py-4 font-semibold transition border-b-4 ${
              activeTab === 'transaksi'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            💳 Transaksi
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Daftar Pesanan</h2>
            {orders.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <p className="text-gray-500 text-lg">Belum ada pesanan</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <div
                    key={order.orderId}
                    className="bg-white rounded-lg shadow-md p-6"
                  >
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Order ID</p>
                        <p className="font-bold text-lg">{order.orderId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Nama Pelanggan</p>
                        <p className="font-bold">{order.customerName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">No. Meja</p>
                        <p className="font-bold">{order.tableNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Metode Pembayaran</p>
                        <p className="font-bold capitalize">{order.paymentMethod}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded p-4 mb-4">
                      <p className="font-semibold text-gray-700 mb-2">
                        Item Pesanan:
                      </p>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm"
                          >
                            <span>
                              {item.name} x{item.quantity}
                            </span>
                            <span className="font-semibold">
                              Rp {(item.price * item.quantity).toLocaleString(
                                'id-ID'
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">Total Pembayaran</p>
                        <p className="text-2xl font-bold text-orange-600">
                          Rp {order.totalPrice.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <button
                        onClick={() => handlePrintReceipt(order)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                      >
                        <Download size={20} />
                        Cetak Struk
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Transaksi Tab ─────────────────────────────────── */}
        {activeTab === 'transaksi' && (
          <div>
            {txSuccess ? (
              /* ── Success Screen ── */
              <div className="max-w-lg mx-auto mt-8 bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={36} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-600 mb-1">Transaksi Berhasil!</h2>
                <p className="text-gray-500 mb-6">{txSuccess.orderId}</p>

                <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Meja</span><span className="font-semibold">{txSuccess.tableNumber}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>Rp {txSuccess.subtotal.toLocaleString('id-ID')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Pajak (10%)</span><span>Rp {txSuccess.tax.toLocaleString('id-ID')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Service (2.5%)</span><span>Rp {txSuccess.serviceCharge.toLocaleString('id-ID')}</span></div>
                  <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                    <span>Total Tagihan</span>
                    <span className="text-blue-600">Rp {txSuccess.totalPrice.toLocaleString('id-ID')}</span>
                  </div>
                  {txSuccess.paymentMethod === 'cash' && (
                    <div className="flex justify-between text-green-700 font-bold">
                      <span>Kembalian</span>
                      <span>Rp {txSuccess.change.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => txPrint(txSuccess)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
                  >
                    <Printer size={18} /> Cetak Struk
                  </button>
                  <button
                    onClick={txReset}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition"
                  >
                    Transaksi Baru
                  </button>
                </div>
              </div>
            ) : (
              /* ── Main Transaksi Layout ── */
              <div className="grid lg:grid-cols-5 gap-6 mt-2">

                {/* LEFT — Menu picker (3 cols) */}
                <div className="lg:col-span-3 space-y-4">
                  {/* Search & Category */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-grow">
                      <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Cari menu..."
                        value={txSearch}
                        onChange={(e) => setTxSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="flex gap-2 overflow-x-auto">
                      {['Semua', 'Makanan', 'Minuman', 'Snack'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setTxCategory(cat)}
                          className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
                            txCategory === cat
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
                    {txMenus.length === 0 && (
                      <div className="col-span-3 text-center py-10 text-gray-400">Menu tidak ditemukan</div>
                    )}
                    {txMenus.map((menu) => {
                      const inCart = txCart.find((i) => i.id === menu.id);
                      const unavailable = menu.stock <= 0;
                      return (
                        <button
                          key={menu.id}
                          onClick={() => txAddItem(menu)}
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

                {/* RIGHT — Order summary (2 cols) */}
                <div className="lg:col-span-2 flex flex-col gap-4">

                  {/* Ringkasan Pesanan */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
                      <span className="font-semibold flex items-center gap-2"><ShoppingCart size={16} /> Ringkasan Pesanan</span>
                      {txCart.length > 0 && (
                        <button onClick={() => setTxCart([])} className="text-blue-200 hover:text-white text-xs underline">
                          Kosongkan
                        </button>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-52 p-3 space-y-2">
                      {txCart.length === 0 ? (
                        <p className="text-center text-gray-400 py-6 text-sm">Pilih menu dari kiri</p>
                      ) : (
                        txCart.map((item) => (
                          <div key={item.id} className="flex items-center gap-2 text-sm">
                            <div className="flex-grow">
                              <p className="font-semibold text-gray-800 leading-tight">{item.name}</p>
                              <p className="text-gray-500 text-xs">Rp {item.price.toLocaleString('id-ID')}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button onClick={() => txUpdateQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition">
                                <Minus size={12} />
                              </button>
                              <span className="w-6 text-center font-bold text-sm">{item.qty}</span>
                              <button onClick={() => txUpdateQty(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition">
                                <Plus size={12} />
                              </button>
                              <button onClick={() => txRemoveItem(item.id)} className="w-6 h-6 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-full transition ml-1">
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
                      <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>Rp {txSubtotal.toLocaleString('id-ID')}</span></div>
                      <div className="flex justify-between text-gray-500"><span>Pajak (10%)</span><span>Rp {txTax.toLocaleString('id-ID')}</span></div>
                      <div className="flex justify-between text-gray-500"><span>Service (2.5%)</span><span>Rp {txService.toLocaleString('id-ID')}</span></div>
                      <div className="flex justify-between font-bold text-base pt-2 border-t">
                        <span>Total Tagihan</span>
                        <span className="text-blue-600">Rp {txTotal.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Input Form */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
                    {/* Nomor Meja */}
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Nomor Meja *</label>
                      <input
                        type="text"
                        placeholder="Contoh: 1, A5, VIP-2"
                        value={txTable}
                        onChange={(e) => setTxTable(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Metode Pembayaran */}
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Metode Pembayaran</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'cash', label: '💵 Tunai' },
                          { value: 'qris', label: '📱 QRIS' },
                          { value: 'card', label: '💳 Kartu' },
                        ].map((m) => (
                          <button
                            key={m.value}
                            onClick={() => setTxPayMethod(m.value)}
                            className={`py-2 rounded-lg text-xs font-semibold border-2 transition ${
                              txPayMethod === m.value
                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Nominal (hanya jika cash) */}
                    {txPayMethod === 'cash' && (
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Nominal Dibayar</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-gray-400 text-sm font-semibold">Rp</span>
                          <input
                            type="text"
                            placeholder="0"
                            value={txCash}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/\D/g, '');
                              setTxCash(raw ? parseInt(raw).toLocaleString('id-ID') : '');
                            }}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        {txCashNum > 0 && (
                          <div className={`mt-2 px-3 py-2 rounded-lg text-sm font-bold flex justify-between ${
                            txChange >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                          }`}>
                            <span>{txChange >= 0 ? 'Kembalian' : 'Kurang'}</span>
                            <span>Rp {Math.abs(txChange).toLocaleString('id-ID')}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Catatan */}
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Catatan (Opsional)</label>
                      <textarea
                        placeholder="Tulis catatan jika diperlukan..."
                        value={txNote}
                        onChange={(e) => setTxNote(e.target.value)}
                        rows={2}
                        maxLength={300}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={txReset}
                        className="flex-1 py-2.5 rounded-lg border-2 border-gray-300 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
                      >
                        Batal
                      </button>
                      <button
                        onClick={txSave}
                        disabled={txCart.length === 0}
                        className="flex-2 w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Download size={16} />
                        Simpan Transaksi
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Kelola Menu</h2>
              <button
                onClick={() => {
                  setShowMenuForm(!showMenuForm);
                  setEditingMenu(null);
                  setFormData({
                    name: '',
                    category: 'Makanan',
                    price: '',
                    stock: '',
                  });
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                <Plus size={20} />
                {showMenuForm ? 'Batal' : 'Tambah Menu'}
              </button>
            </div>

            {/* Form */}
            {showMenuForm && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-4">
                  {editingMenu ? 'Edit Menu' : 'Tambah Menu Baru'}
                </h3>
                <form onSubmit={handleAddMenu} className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nama Menu"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  >
                    <option value="Makanan">Makanan</option>
                    <option value="Minuman">Minuman</option>
                    <option value="Snack">Snack</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Harga"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                  <input
                    type="number"
                    placeholder="Stok"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                  <button
                    type="submit"
                    className="col-span-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
                  >
                    {editingMenu ? 'Update Menu' : 'Tambah Menu'}
                  </button>
                </form>
              </div>
            )}

            {/* Menu List */}
            <div className="grid md:grid-cols-2 gap-4">
              {menus.map((menu) => (
                <div
                  key={menu.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {menu.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {menu.category}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditMenu(menu)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteMenu(menu.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Harga:</span>
                      <span className="font-bold text-orange-600">
                        Rp {menu.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stok:</span>
                      <span
                        className={`font-bold ${
                          menu.stock > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {menu.stock} {menu.stock === 0 ? '(Habis)' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
