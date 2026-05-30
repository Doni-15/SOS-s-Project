# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

# Self-Order System Management - Frontend

Frontend untuk aplikasi **Self-Order System Management**, yaitu sistem pemesanan mandiri berbasis web untuk restoran/kedai. Aplikasi ini menyediakan halaman pelanggan untuk melakukan self-order, halaman kasir untuk memantau pesanan dan memproses transaksi, serta halaman pemilik untuk melihat ringkasan dan laporan penjualan.

## Tech Stack

- React.js
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Lucide React

## Modul Utama

### 1. Customer Self-Order

Modul pelanggan digunakan oleh customer setelah mengakses halaman pemesanan melalui QR Code meja.

Fitur utama:

- Menampilkan daftar menu
- Menampilkan kategori menu: Makanan, Minuman, dan Snack
- Menampilkan status menu: Tersedia atau Habis
- Memilih satu atau lebih menu
- Mengatur jumlah item pesanan
- Menampilkan ringkasan pesanan
- Mengirim pesanan ke sistem kasir

### 2. Cashier POS

Modul kasir digunakan oleh staf internal untuk mengelola pesanan dan transaksi.

Fitur utama:

- Menampilkan daftar pesanan masuk
- Melihat detail pesanan
- Menampilkan total pembayaran
- Input nominal pembayaran pelanggan
- Menghitung kembalian otomatis
- Menyimpan transaksi
- Menampilkan atau mencetak struk transaksi

### 3. Owner Dashboard

Modul pemilik digunakan untuk memantau performa penjualan kedai.

Fitur utama:

- Menampilkan total pemasukan hari ini
- Menampilkan jumlah transaksi hari ini
- Menampilkan menu terlaris
- Melihat laporan penjualan berdasarkan periode
- Melihat riwayat transaksi

### 4. Authentication

Modul autentikasi digunakan oleh pengguna internal seperti kasir dan pemilik.

Fitur utama:

- Login pengguna internal
- Logout
- Penyimpanan token login
- Pembatasan akses berdasarkan role
- Redirect berdasarkan role pengguna

## Struktur Folder

```txt
frontend/
├── public/
├── src/
│   ├── api/
│   │   └── axiosInstance.js
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   ├── customer/
│   │   ├── cashier/
│   │   └── owner/
│   ├── data/
│   │   └── menuData.js
│   ├── layouts/
│   │   ├── AuthLayout.jsx
│   │   └── DashboardLayout.jsx
│   ├── pages/
│   │   ├── auth/
│   │   │   └── LoginPage.jsx
│   │   ├── customer/
│   │   │   └── CustomerMenuPage.jsx
│   │   ├── cashier/
│   │   │   └── CashierDashboardPage.jsx
│   │   └── owner/
│   │       └── OwnerDashboardPage.jsx
│   ├── routes/
│   │   └── AppRoutes.jsx
│   ├── utils/
│   │   └── formatCurrency.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env.example
├── package.json
└── README.md
```

## Instalasi

Pastikan Node.js dan npm sudah terinstall.

Cek versi:

```bash
node -v
npm -v
```

Clone repository atau masuk ke folder project:

```bash
cd SelfOrderSystemManagement_Project_v1.0
```

Buat project frontend menggunakan Vite:

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
```

Install dependency tambahan:

```bash
npm install react-router-dom axios lucide-react
```

Install Tailwind CSS:

```bash
npm install tailwindcss @tailwindcss/vite
```

## Konfigurasi Tailwind CSS

Edit file `vite.config.js`:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

Edit file `src/index.css`:

```css
@import "tailwindcss";
```

## Environment Variable

Buat file `.env` di dalam folder `frontend`.

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Contoh file `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Menjalankan Project

Jalankan development server:

```bash
npm run dev
```

Secara default aplikasi akan berjalan di:

```txt
http://localhost:5173
```

## Routing Aplikasi

| Route | Halaman | Deskripsi |
|---|---|---|
| `/` | Redirect | Redirect ke halaman customer default |
| `/customer/table/:tableNumber` | Customer Menu | Halaman self-order pelanggan berdasarkan nomor meja |
| `/login` | Login | Halaman login pengguna internal |
| `/cashier` | Cashier Dashboard | Halaman POS kasir |
| `/owner` | Owner Dashboard | Halaman dashboard pemilik |

## Integrasi API

Frontend akan berkomunikasi dengan backend melalui REST API menggunakan Axios.

Contoh konfigurasi Axios:

```js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
```

Contoh endpoint yang akan digunakan:

| Method | Endpoint | Fungsi |
|---|---|---|
| `POST` | `/auth/login` | Login kasir atau pemilik |
| `GET` | `/menus` | Mengambil daftar menu |
| `POST` | `/orders` | Mengirim pesanan pelanggan |
| `GET` | `/orders` | Mengambil daftar pesanan masuk |
| `POST` | `/transactions` | Menyimpan transaksi |
| `GET` | `/reports/sales` | Mengambil laporan penjualan |
| `GET` | `/reports/top-menus` | Mengambil data menu terlaris |
| `GET` | `/users` | Mengambil daftar akun pengguna |
| `POST` | `/users` | Membuat akun pengguna baru |

## Naming Convention

### File dan Folder

- Folder menggunakan `kebab-case` atau nama sederhana lowercase.
- Component menggunakan `PascalCase`.
- File halaman menggunakan format `NamaPage.jsx`.
- Utility/helper menggunakan `camelCase`.

Contoh:

```txt
CustomerMenuPage.jsx
CashierDashboardPage.jsx
OwnerDashboardPage.jsx
formatCurrency.js
axiosInstance.js
```

### Component

```jsx
function CustomerMenuPage() {
  return <div>Customer Menu Page</div>;
}

export default CustomerMenuPage;
```

### Variable dan Function

```js
const totalPrice = 50000;

function formatCurrency(value) {
  return value;
}
```

## Script NPM

| Command | Fungsi |
|---|---|
| `npm run dev` | Menjalankan development server |
| `npm run build` | Membuat production build |
| `npm run preview` | Menjalankan preview hasil build |
| `npm run lint` | Menjalankan ESLint |

## Prioritas Pengembangan Frontend

### Tahap 1 - Setup Project

- Setup React + Vite
- Setup Tailwind CSS
- Setup routing
- Setup struktur folder
- Setup mock data

### Tahap 2 - Customer Self-Order

- Halaman daftar menu
- Filter kategori menu
- Status menu tersedia/habis
- Cart pesanan
- Ringkasan pesanan
- Tombol kirim pesanan

### Tahap 3 - Cashier POS

- Halaman daftar pesanan masuk
- Detail pesanan
- Input pembayaran
- Hitung kembalian
- Simpan transaksi
- Tampilan struk

### Tahap 4 - Owner Dashboard

- Card total pemasukan
- Card jumlah transaksi
- Menu terlaris
- Tabel riwayat transaksi
- Filter periode laporan

### Tahap 5 - Authentication

- Halaman login
- Simpan token
- Protected route
- Role-based redirect
- Logout

### Tahap 6 - Integrasi Backend

- Integrasi menu API
- Integrasi order API
- Integrasi transaksi API
- Integrasi laporan API
- Integrasi auth API

## Catatan Pengembangan

Untuk tahap awal, frontend dapat menggunakan mock data terlebih dahulu. Setelah backend siap, mock data diganti dengan request API menggunakan Axios.

Real-time order untuk kasir dapat ditambahkan setelah backend menyediakan Socket.IO atau mekanisme polling. Untuk versi awal, polling API setiap beberapa detik masih dapat digunakan agar implementasi lebih sederhana.

## Status Project

Status saat ini:

```txt
Frontend setup in progress
```

## Author

Self-Order System Management Team
