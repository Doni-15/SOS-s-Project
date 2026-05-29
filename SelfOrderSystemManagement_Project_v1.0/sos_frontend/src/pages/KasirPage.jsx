import { useState } from 'react';
import { Edit2, Trash2, Plus, Eye, EyeOff, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            name: 'Nasi Goreng Spesial',
            category: 'Makanan',
            price: 32000,
            stock: 10,
          },
          {
            id: 2,
            name: 'Ayam Bakar Madu',
            category: 'Makanan',
            price: 38000,
            stock: 8,
          },
        ];
  });
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Makanan',
    price: '',
    stock: '',
  });

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
