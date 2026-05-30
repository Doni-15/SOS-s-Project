# Self-Order System (SOS) - Resto Nusantara

Sistem pemesanan otomatis (Self-Order System) untuk restoran dengan role-based access untuk pelanggan, kasir, dan pemilik restoran.

## 🎯 Fitur Utama

### 1. **Mode User (Pelanggan Umum)**
- ✅ Akses tanpa login (tidak perlu autentikasi)
- ✅ Browsing menu dengan fitur pencarian
- ✅ Filter menu berdasarkan kategori (Makanan, Minuman, Snack)
- ✅ Tambah ke keranjang belanja
- ✅ Checkout dengan informasi pelanggan
- ✅ Dukungan berbagai metode pembayaran
- ✅ Responsive design untuk mobile dan desktop

### 2. **Mode Kasir (Login Required)**
- ✅ Kelola menu (Tambah, Edit, Hapus)
- ✅ Atur stok makanan/minuman
- ✅ Lihat daftar pesanan masuk
- ✅ Cetak struk pemesanan
- ✅ Verifikasi pembelian

### 3. **Mode Owner (Login Required)**
- ✅ Dashboard analytics dengan statistik penjualan
- ✅ Grafik pendapatan harian
- ✅ Analisis menu populer (pie chart)
- ✅ Riwayat pesanan lengkap
- ✅ KPI: Total Pesanan, Total Pendapatan, Rata-rata Pesanan

## 📱 Responsive Design

Website dioptimalkan untuk berbagai ukuran layar:
- **Mobile First**: Primary design untuk smartphone
- **Tablet**: Optimasi layout untuk tablet
- **Desktop**: Full experience untuk layar besar

## 🛠️ Tech Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v7
- **UI Icons**: Lucide React
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Package Manager**: npm

## 📁 Struktur Folder

```
src/
├── pages/                 # Halaman-halaman utama
│   ├── UserPage.jsx      # Halaman menu untuk pelanggan
│   ├── CheckoutPage.jsx  # Halaman checkout
│   ├── LoginPage.jsx     # Halaman login (kasir/owner)
│   ├── KasirPage.jsx     # Dashboard kasir
│   └── OwnerPage.jsx     # Dashboard owner
├── components/           # Komponen reusable
│   ├── Navbar.jsx        # Navigation bar
│   ├── MenuItem.jsx      # Card menu item
│   ├── CartDrawer.jsx    # Drawer keranjang belanja
│   └── ProtectedRoute.jsx # Protected route component
├── context/              # Context API untuk state management
│   ├── AuthContext.jsx   # Authentication context
│   └── CartContext.jsx   # Shopping cart context
├── hooks/                # Custom hooks (opsional)
├── App.jsx              # Main app component dengan routing
├── main.jsx             # Entry point
└── index.css            # Global styles
```

## 🔐 Authentication

### Demo Credentials

**Kasir:**
- Username: `kasir`
- Password: `pass123`

**Owner:**
- Username: `owner`
- Password: `pass456`

### Role-Based Access Control
- **User**: Tidak perlu login, hanya bisa melihat menu dan checkout
- **Kasir**: Login diperlukan, bisa manage menu dan verify orders
- **Owner**: Login diperlukan, akses dashboard analytics

## 🚀 Instalasi & Running

### Prerequisites
- Node.js (v14+)
- npm atau yarn

### Setup

1. **Clone/Navigate ke project**
```bash
cd sos_frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

Server akan berjalan di `http://localhost:5173` (atau port yang tersedia)

### Build untuk Production
```bash
npm run build
```

## 📝 Fitur Detail

### User Menu Page
- **Search**: Cari menu berdasarkan nama atau deskripsi
- **Filter**: Kategori (Semua, Makanan, Minuman, Snack)
- **Menu Card**: Tampil gambar, harga, stok, dan tombol tambah
- **Status**: Indikator ketersediaan (Tersedia/Habis)
- **Cart**: Floating button di mobile atau sidebar di desktop

### Checkout Page
- **Order Details**: Nama pelanggan, nomor telepon
- **Table Number**: Nomor meja (opsional)
- **Payment Method**: Tunai, Kartu, Transfer, E-Wallet
- **Special Notes**: Catatan pesanan (tidak ada sambal, dll)
- **Order Summary**: Ringkasan item dengan subtotal dan pajak
- **Receipt Generation**: Otomatis generate struk setelah checkout

### Kasir Dashboard
#### Tab Pesanan
- Daftar semua pesanan masuk
- Detail pesanan (Order ID, Nama, Meja, Items, Total)
- Tombol cetak struk

#### Tab Kelola Menu
- Tambah menu baru dengan form
- Edit menu yang sudah ada
- Hapus menu
- Tampil harga dan stok real-time

### Owner Dashboard
- **Statistics Cards**: Total pesanan, pendapatan, rata-rata
- **Revenue Chart**: Grafik pendapatan harian (bar chart)
- **Popular Items**: Pie chart menu yang paling laku
- **Recent Orders**: Tabel pesanan terbaru
- **Auto-refresh**: Data diupdate otomatis

## 💾 Data Storage

Data disimpan menggunakan **localStorage**:
- **`user`**: Informasi user login
- **`authToken`**: Token autentikasi
- **`cartItems`**: Item di keranjang belanja
- **`orders`**: Riwayat pesanan (untuk kasir/owner)
- **`menus`**: Data menu (untuk kasir management)

*Note: Untuk production, gunakan API backend yang proper dengan database*

## 🔄 Alur Aplikasi

### Alur Customer
1. Buka website → User Page (Menu listing)
2. Browse/Search menu → Filter kategori
3. Tambah ke keranjang → View cart
4. Checkout → Input data pelanggan
5. Generate struk → Order selesai

### Alur Kasir
1. Login dengan role kasir → Dashboard Kasir
2. Tab Pesanan: Lihat orders masuk, cetak struk
3. Tab Menu: Manage (add/edit/delete), atur stok
4. Verify pembayaran → Complete order

### Alur Owner
1. Login dengan role owner → Dashboard Owner
2. Lihat statistik penjualan real-time
3. Analisis revenue & menu populer
4. Monitor pesanan terbaru

## 🎨 Design Highlights

- **Mobile-First Design**: Prioritas pada mobile experience
- **Consistent Branding**: Color scheme biru-orange
- **Responsive Navigation**: Hamburger menu untuk mobile
- **Clear Typography**: Font sizes yang readable di semua device
- **Visual Feedback**: Status indikator untuk ketersediaan produk
- **Smooth Transitions**: Animasi halus untuk UX yang baik

## 🔧 Kustomisasi

### Mengubah Brand
Edit di beberapa file:
- `components/Navbar.jsx`: Ubah logo dan nama
- `pages/LoginPage.jsx`: Ubah brand identity
- Tailwind config: Ubah color scheme

### Menambah Menu
Edit di `pages/UserPage.jsx`, array `SAMPLE_MENU`:
```javascript
{
  id: 11,
  name: 'Menu Baru',
  category: 'Makanan',
  price: 35000,
  stock: 10,
  description: 'Deskripsi produk',
  image: 'URL_GAMBAR'
}
```

## 📊 Future Improvements

- [ ] Integrasi dengan backend API real
- [ ] Database untuk persistent storage
- [ ] Real-time updates dengan WebSocket
- [ ] Authentikasi JWT
- [ ] Email/SMS notifikasi
- [ ] QR code menu ordering
- [ ] Payment gateway integration
- [ ] Multiple language support
- [ ] Dark mode
- [ ] Rating & review system

## 🐛 Known Issues

1. **External Images**: Gambar dari Unsplash mungkin tidak load di beberapa network
   - Solusi: Upload gambar ke server sendiri

## 📞 Support

Untuk bantuan atau pertanyaan, hubungi developer.

---

**Version**: 1.0.0  
**Last Updated**: May 2026  
**License**: MIT
