import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
// import { LogOut, TrendingUp } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom';

export const OwnerPage = () => {
  // const { user, logout } = useAuth();
  // const navigate = useNavigate();

  // Simulasi data dari orders
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');

  // Statistics
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Data untuk chart - pendapatan per hari
  const revenueByDay = {};
  orders.forEach((order) => {
    const date = new Date(order.timestamp).toLocaleDateString('id-ID');
    revenueByDay[date] = (revenueByDay[date] || 0) + order.totalPrice;
  });

  const chartData = Object.entries(revenueByDay).map(([date, revenue]) => ({
    name: date,
    revenue,
  }));

  // Popular items
  const itemSales = {};
  orders.forEach((order) => {
    order.items.forEach((item) => {
      itemSales[item.name] = (itemSales[item.name] || 0) + item.quantity;
    });
  });

  const topItems = Object.entries(itemSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, quantity]) => ({
      name,
      value: quantity,
    }));

  const COLORS = [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
  ];

  // const handleLogout = () => {
  //   logout();
  //   navigate('/login');
  // };

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 shadow-lg relative z-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Dashboard Owner</h1>
          <p className="text-blue-100 mt-1">Pantau performa bisnis Anda secara real-time</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Total Orders */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Pesanan</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">
                  {totalOrders}
                </p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Pendapatan</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  Rp {totalRevenue.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>

          {/* Average Order Value */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">
                  Rata-rata Pesanan
                </p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  Rp {avgOrderValue.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>
        </div>

        {/* Charts */}
        {chartData.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Pendapatan Harian
              </h2>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value) =>
                        `Rp ${value.toLocaleString('id-ID')}`
                      }
                    />
                    <Bar dataKey="revenue" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Belum ada data penjualan
                </p>
              )}
            </div>

            {/* Top Items */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Menu Populer
              </h2>
              {topItems.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={topItems}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {topItems.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Belum ada data penjualan
                </p>
              )}
            </div>
          </div>
        )}

        {/* Recent Orders */}
        {orders.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Pesanan Terbaru
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Order ID
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Nama Pelanggan
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      No. Meja
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Jumlah Item
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(-10).reverse().map((order) => (
                    <tr
                      key={order.orderId}
                      className="border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                      <td className="py-3 px-4 text-sm text-gray-800 font-mono">
                        {order.orderId}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800">
                        {order.customerName}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800">
                        {order.tableNumber}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)}{' '}
                        items
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-bold text-orange-600">
                        Rp {order.totalPrice.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {orders.length === 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg font-semibold">
              Belum ada pesanan
            </p>
            <p className="text-gray-400 mt-2">
              Pesanan akan muncul di sini saat ada customer yang melakukan
              pemesanan
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
