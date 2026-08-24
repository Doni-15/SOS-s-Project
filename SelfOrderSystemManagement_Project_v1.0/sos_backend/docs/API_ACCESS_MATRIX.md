# Matriks Akses API

Dokumen ini merangkum batas akses yang diterapkan oleh route backend. Identitas internal berasal dari JWT yang diverifikasi middleware `authenticate`; role dari request body tidak digunakan sebagai sumber otorisasi.

| Area | PUBLIC | CASHIER | OWNER |
| --- | :---: | :---: | :---: |
| Health dan readiness | Baca | Baca | Baca |
| Validasi QR, menu publik, dan pesanan pelanggan | Ya | Ya | Ya |
| Pesanan internal dan pembayaran | Tidak | Ya | Ya |
| Baca menu internal | Tidak | Ya | Ya |
| Ubah ketersediaan/detail menu | Tidak | Ya | Ya |
| Buat/hapus menu dan kategori | Tidak | Tidak | Ya |
| Upload gambar menu | Tidak | Ya | Ya |
| Laporan, pengguna, audit log, dan administrasi QR | Tidak | Tidak | Ya |

Endpoint representatif:

- `GET /api/health/ready` — PUBLIC.
- `POST /api/public/qr/validate` — PUBLIC; token QR tetap divalidasi di service.
- `POST /api/internal/menu-items` — OWNER.
- `PATCH /api/internal/menu-items/:id` — OWNER atau CASHIER.
- `POST /api/internal/orders/:id/payments` — OWNER atau CASHIER.
- `GET /api/internal/reports/sales-summary` — OWNER.

Perubahan route atau role harus disertai pembaruan matriks ini dan diverifikasi dengan `npm run check:access`.
