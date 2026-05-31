import { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Check, X } from 'lucide-react';

export const UserManagementPage = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      namaLengkap: 'Andi Wijaya',
      username: 'andi.wijaya',
      email: 'andi.wijaya@example.com',
      noTelepon: '0812 3456 7890',
      peran: 'Kasir',
      status: 'Aktif',
    },
    {
      id: 2,
      namaLengkap: 'Siti Nurhaliza',
      username: 'siti.nurhaliza',
      email: 'siti.nurhaliza@example.com',
      noTelepon: '0812 3456 7891',
      peran: 'Kasir',
      status: 'Aktif',
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    namaLengkap: '',
    username: '',
    email: '',
    noTelepon: '',
    password: '',
    konfirmasiPassword: '',
    peran: 'Kasir',
    status: 'Aktif',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.namaLengkap ||
      !formData.username ||
      !formData.email ||
      !formData.noTelepon
    ) {
      alert('Semua field harus diisi');
      return;
    }

    if (!editingId && (!formData.password || !formData.konfirmasiPassword)) {
      alert('Password harus diisi');
      return;
    }

    if (
      formData.password &&
      formData.password !== formData.konfirmasiPassword
    ) {
      alert('Password tidak sesuai');
      return;
    }

    if (editingId) {
      setUsers(
        users.map((user) =>
          user.id === editingId
            ? {
                ...user,
                namaLengkap: formData.namaLengkap,
                username: formData.username,
                email: formData.email,
                noTelepon: formData.noTelepon,
                status: formData.status,
              }
            : user
        )
      );
      setEditingId(null);
    } else {
      const newUser = {
        id: Date.now(),
        namaLengkap: formData.namaLengkap,
        username: formData.username,
        email: formData.email,
        noTelepon: formData.noTelepon,
        peran: formData.peran,
        status: formData.status,
      };
      setUsers([...users, newUser]);
    }

    setFormData({
      namaLengkap: '',
      username: '',
      email: '',
      noTelepon: '',
      password: '',
      konfirmasiPassword: '',
      peran: 'Kasir',
      status: 'Aktif',
    });
    setShowForm(false);
  };

  const handleEdit = (user) => {
    setFormData({
      namaLengkap: user.namaLengkap,
      username: user.username,
      email: user.email,
      noTelepon: user.noTelepon,
      password: '',
      konfirmasiPassword: '',
      peran: user.peran,
      status: user.status,
    });
    setEditingId(user.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      setUsers(users.filter((user) => user.id !== id));
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      namaLengkap: '',
      username: '',
      email: '',
      noTelepon: '',
      password: '',
      konfirmasiPassword: '',
      peran: 'Kasir',
      status: 'Aktif',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">←</span>
            <h1 className="text-3xl font-bold text-gray-800">Tambah / Edit Pengguna</h1>
          </div>
          <p className="text-gray-600">
            Kelola akun pengguna yang dapat mengakses sistem Kedai Nusantara.
          </p>
        </div>

        {/* Add User Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            <Plus size={20} />
            Tambah Pengguna Baru
          </button>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingId ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nama Lengkap */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="namaLengkap"
                    value={formData.namaLengkap}
                    onChange={handleInputChange}
                    placeholder="Masukkan nama lengkap"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Masukkan username"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Masukkan email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Nomor Telepon */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    name="noTelepon"
                    value={formData.noTelepon}
                    onChange={handleInputChange}
                    placeholder="Masukkan nomor telepon"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {!editingId && (
                  <>
                    {/* Password */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Masukkan password"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2 text-gray-600 hover:text-gray-800"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    {/* Konfirmasi Password */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Konfirmasi Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="konfirmasiPassword"
                          value={formData.konfirmasiPassword}
                          onChange={handleInputChange}
                          placeholder="Konfirmasi password"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2 text-gray-600 hover:text-gray-800"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Peran */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Peran
                  </label>
                  <select
                    name="peran"
                    value={formData.peran}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Kasir">Kasir</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-2"
                >
                  <Check size={18} />
                  {editingId ? 'Simpan Perubahan' : 'Simpan Pengguna'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-gray-700 font-semibold">
                    Nama Lengkap
                  </th>
                  <th className="px-6 py-4 text-left text-gray-700 font-semibold">
                    Username
                  </th>
                  <th className="px-6 py-4 text-left text-gray-700 font-semibold">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-gray-700 font-semibold">
                    Nomor Telepon
                  </th>
                  <th className="px-6 py-4 text-left text-gray-700 font-semibold">
                    Peran
                  </th>
                  <th className="px-6 py-4 text-left text-gray-700 font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-gray-700 font-semibold">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 text-gray-800">{user.namaLengkap}</td>
                    <td className="px-6 py-4 text-gray-800">{user.username}</td>
                    <td className="px-6 py-4 text-gray-800">{user.email}</td>
                    <td className="px-6 py-4 text-gray-800">{user.noTelepon}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                        💳 {user.peran}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                          user.status === 'Aktif'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            user.status === 'Aktif' ? 'bg-green-500' : 'bg-gray-500'
                          }`}
                        />
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Permissions Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">
            ℹ️ Ringkasan Hak Akses
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💳</span>
              <div>
                <p className="font-semibold text-blue-900">Kasir</p>
                <p className="text-sm text-blue-700">
                  Dapat mengakses dashboard kasir dan mengelola transaksi
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-semibold text-blue-900">Status Aktif</p>
                <p className="text-sm text-blue-700">
                  Pengguna dapat login dan menggunakan sistem
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
