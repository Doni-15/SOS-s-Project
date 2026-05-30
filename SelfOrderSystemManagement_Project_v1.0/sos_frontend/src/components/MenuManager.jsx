
import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const EMPTY_FORM = { name: '', category: 'Makanan', price: '', stock: '' };

export const MenuManager = ({ menus, setMenus }) => {
  const [showForm, setShowForm]     = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [formData, setFormData]     = useState(EMPTY_FORM);

  const openAdd = () => {
    setEditingMenu(null);
    setFormData(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (menu) => {
    setEditingMenu(menu);
    setFormData(menu);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingMenu(null);
    setFormData(EMPTY_FORM);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock) {
      alert('Semua field harus diisi');
      return;
    }

    const entry = {
      id: editingMenu?.id ?? Date.now(),
      ...formData,
      price: parseInt(formData.price),
      stock: parseInt(formData.stock),
    };

    const updated = editingMenu
      ? menus.map((m) => (m.id === editingMenu.id ? entry : m))
      : [...menus, entry];

    setMenus(updated);
    localStorage.setItem('menus', JSON.stringify(updated));
    closeForm();
  };

  const handleDelete = (id) => {
    if (!confirm('Hapus menu ini?')) return;
    const updated = menus.filter((m) => m.id !== id);
    setMenus(updated);
    localStorage.setItem('menus', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Kelola Menu</h2>
        <button
          onClick={showForm ? closeForm : openAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition"
        >
          <Plus size={18} />
          {showForm ? 'Batal' : 'Tambah Menu'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            {editingMenu ? '✏️ Edit Menu' : '➕ Menu Baru'}
          </h3>
          <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nama Menu *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="md:col-span-2 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="Makanan">🍽️ Makanan</option>
              <option value="Minuman">🥤 Minuman</option>
              <option value="Snack">🍿 Snack</option>
            </select>
            <input
              type="number"
              placeholder="Harga (Rp) *"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <input
              type="number"
              placeholder="Stok *"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="md:col-span-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-semibold transition"
            >
              {editingMenu ? 'Simpan Perubahan' : 'Tambah Menu'}
            </button>
          </form>
        </div>
      )}

      {/* Menu Grid */}
      {menus.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center shadow-sm">
          <p className="text-4xl mb-3">🍽️</p>
          <p className="text-gray-500 font-semibold">Belum ada menu</p>
          <p className="text-gray-400 text-sm mt-1">Klik "Tambah Menu" untuk memulai</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menus.map((menu) => (
            <div
              key={menu.id}
              className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-grow">
                  <h3 className="font-bold text-gray-800 leading-tight">{menu.name}</h3>
                  <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-semibold">
                    {menu.category}
                  </span>
                </div>
                <div className="flex gap-1.5 shrink-0 ml-2">
                  <button
                    onClick={() => openEdit(menu)}
                    className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(menu.id)}
                    className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Harga</span>
                  <span className="font-bold text-orange-600">
                    Rp {menu.price.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Stok</span>
                  <span className={`font-bold ${menu.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {menu.stock > 0 ? menu.stock : 'Habis'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
