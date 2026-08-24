# Self-Order System Management

Project mata kuliah/kelompok berupa aplikasi web self-order berbasis QR Code untuk alur pelanggan, kasir, dan pemilik usaha. Repository ini digunakan sebagai project pembelajaran full-stack; kesiapan untuk penggunaan production belum diklaim.

## Fitur yang Tersedia

- pemesanan pelanggan melalui sesi QR meja;
- pengelolaan pesanan dan pembayaran tunai oleh kasir;
- manajemen menu, meja, pengguna, laporan, dan audit log oleh pemilik;
- autentikasi JWT dan role-based access control untuk area internal;
- upload gambar menu yang dibatasi ukuran dan divalidasi berdasarkan isi file;
- script backup dan restore PostgreSQL serta file upload.

## Teknologi

- Backend: Node.js, Express, Prisma ORM, PostgreSQL, Zod, dan JWT.
- Frontend: React, Vite, React Router, TanStack Query, dan Tailwind CSS.
- Operasional: Docker, script pemeriksaan, serta backup/restore berbasis PostgreSQL CLI.

## Struktur Repository

Source utama berada di folder [`SelfOrderSystemManagement_Project_v1.0`](SelfOrderSystemManagement_Project_v1.0/README.md).

```text
SelfOrderSystemManagement_Project_v1.0/
├── sos_backend/   REST API dan akses database
└── sos_frontend/  antarmuka pelanggan, kasir, dan pemilik
```

## Menjalankan Project

Gunakan Node.js 22 atau versi kompatibel. Siapkan konfigurasi dari `.env.example`; jangan commit `.env`.

```bash
cd SelfOrderSystemManagement_Project_v1.0/sos_backend
npm ci
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Pada terminal lain:

```bash
cd SelfOrderSystemManagement_Project_v1.0/sos_frontend
npm ci
npm run dev
```

Dokumentasi konfigurasi, endpoint, deployment, dan backup tersedia pada [README project](SelfOrderSystemManagement_Project_v1.0/README.md).

## Catatan Keamanan

- Secret runtime wajib diberikan melalui environment dan tidak memiliki fallback production.
- Bootstrap akun production membutuhkan credential sementara dari environment, tidak menulis password ke log, dan tidak menimpa akun yang sudah ada.
- Database yang pernah dibuat dengan seed versi lama harus mereset credential akun privileged sebelum digunakan kembali.
- URL publik upload berasal dari konfigurasi canonical, bukan header `Host` dari request.
- File upload menggunakan nama acak, batas ukuran, allowlist format, dan pemeriksaan magic bytes.
- Script backup/restore meneruskan path sebagai argument langsung tanpa `sh -c`.

## Yang Dipelajari

Project ini mempraktikkan pemisahan layer backend, pemodelan data, autentikasi dan otorisasi berbasis role, integrasi frontend–API, validasi input, serta hardening konfigurasi dan alur file.

## Status

Aktif dikembangkan sebagai coursework dan portfolio pembelajaran. Review konfigurasi deployment, rotasi secret, migration, backup, dan kontrol akses tetap diperlukan sebelum penggunaan nyata.
