# Self Order System Management - Frontend

Frontend untuk aplikasi Self Order System Management berbasis React + Vite.

Aplikasi ini digunakan untuk dua role internal:

1. Owner
2. Cashier / Kasir

Frontend terhubung ke backend REST API melalui environment variable VITE_API_BASE_URL.

---

## Tech Stack

- React
- Vite
- React Router
- TanStack React Query
- Axios
- Tailwind CSS
- Lucide React
- QRCode generator

---

## Fitur Utama

### Authentication

- Login internal.
- Session disimpan di browser storage.
- Request API otomatis membawa Bearer token.
- Jika token tidak valid atau expired, user diarahkan kembali ke login.

### Owner

Owner memiliki akses ke fitur:

- Dashboard ringkasan.
- Laporan penjualan.
- Analitik.
- Manajemen menu.
- Manajemen pengguna.
- Manajemen meja dan QR.
- Pengaturan sistem.

### Cashier / Kasir

Kasir memiliki akses ke fitur:

- Daftar pesanan masuk.
- Detail pesanan.
- Accept pesanan.
- Cancel pesanan.
- Pembayaran cash.
- Transaksi berhasil.
- Struk pembayaran.
- Riwayat transaksi.
- Tampilan menu operasional.

### Meja & QR

Owner dapat:

- Menambahkan meja.
- Mengubah data meja.
- Mengaktifkan atau menonaktifkan meja.
- Generate QR meja.
- Copy link QR.
- Download QR.
- Print QR.
- Melihat riwayat QR token.
- Revoke / cabut QR token.

QR yang dibuat akan mengarah ke:

    /order?token=<raw-token>

Catatan:

- Raw token hanya muncul saat proses generate QR.
- Jika QR dicetak ketika masih menggunakan localhost, QR hanya cocok untuk environment lokal.
- Untuk production, set VITE_PUBLIC_ORDER_BASE_URL ke domain frontend yang bisa diakses customer.

---

## Struktur Folder Penting

    src/
    ├── app/
    ├── features/
    │   ├── auth/
    │   ├── cashier/
    │   ├── menu/
    │   ├── orders/
    │   ├── owner/
    │   ├── reports/
    │   ├── system/
    │   ├── tables/
    │   ├── transactions/
    │   ├── uploads/
    │   └── users/
    ├── routes/
    └── shared/

---

## Persiapan Development

Masuk ke folder frontend:

    cd sos_frontend

Install dependency:

    npm install

Buat file environment lokal:

    cp .env.example .env

Contoh isi .env untuk local development:

    VITE_API_BASE_URL=http://localhost:5000/api
    VITE_PUBLIC_ORDER_BASE_URL=http://localhost:5173

Contoh isi .env untuk production:

    VITE_API_BASE_URL=https://domain-backend-kalian.com/api
    VITE_PUBLIC_ORDER_BASE_URL=https://domain-frontend-kalian.com

---

## Menjalankan Frontend

Development mode:

    npm run dev

Default Vite biasanya berjalan di:

    http://localhost:5173

---

## Build Production

    npm run build

Output build akan dibuat di folder:

    dist/

Folder dist tidak perlu dicommit ke GitHub karena bisa dibuat ulang dengan command build.

---

## Preview Build

    npm run preview

---

## Lint

    npm run lint

---

## Pre-Push Review

Project ini menyediakan script review lokal:

    RUN_FRONTEND_CHECKS=true bash scripts/pre-push-review-frontend.sh

Script ini akan menjalankan pengecekan seperti:

- daftar file kandidat,
- syntax check config,
- lint,
- build,
- risk scan dummy/mock/debug,
- risk scan secret frontend,
- cek file environment,
- cek generated/runtime files.

---

## File yang Masuk GitHub

File/folder yang perlu dicommit:

- package.json
- package-lock.json
- .env.example
- .gitignore
- README.md
- eslint.config.js
- vite.config.js
- index.html
- public/
- scripts/
- src/

package-lock.json tetap dicommit agar dependency yang diinstall orang lain konsisten.

---

## File yang Tidak Boleh Masuk GitHub

File/folder berikut tidak boleh dicommit:

- .env
- .env.local
- .env.development
- .env.production
- node_modules/
- dist/
- build/
- coverage/
- .vite/
- test-results/
- .patch-backups/
- logs/

Alasannya:

- .env berisi konfigurasi lokal.
- node_modules bisa dibuat ulang dengan npm install.
- dist bisa dibuat ulang dengan npm run build.
- test-results hanya laporan lokal.
- .patch-backups hanya backup sementara saat patching.

---

## Status Saat Ini

Frontend internal sudah mencakup role:

- OWNER
- CASHIER

Fitur QR meja sudah disiapkan untuk discan customer melalui URL:

    /order?token=<raw-token>

Halaman public customer order belum menjadi bagian utama frontend internal saat ini. Jika flow customer sudah dikerjakan, route /order perlu dibuat agar QR bisa digunakan end-to-end oleh pelanggan.

---

## Catatan Keamanan

- Jangan commit .env.
- Jangan commit hasil build.
- Jangan commit laporan pre-push review.
- Jangan menaruh secret di variable frontend.
- Variable dengan prefix VITE_ akan masuk ke client bundle, jadi hanya gunakan untuk public configuration.
