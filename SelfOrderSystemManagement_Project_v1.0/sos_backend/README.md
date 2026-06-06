# Self-Order System Management Backend

Backend API untuk sistem **Self-Order System Management**, yaitu sistem pemesanan mandiri berbasis QR Code untuk operasional kuliner skala kecil hingga menengah.

Sistem ini memungkinkan pelanggan melakukan pemesanan dari perangkat pribadi setelah memindai QR meja, sedangkan kasir mengelola pesanan dan pembayaran melalui panel internal. Pemilik dapat mengelola menu, meja, QR token, akun pengguna, laporan, dan audit log.

---

## 1. Status Project

Status backend saat ini: **production-ready untuk integrasi frontend**.

Backend sudah mencakup:

- REST API berbasis Express.
- PostgreSQL sebagai database utama.
- Prisma ORM dengan migration.
- Autentikasi JWT.
- Session/token hashing.
- RBAC untuk role `OWNER` dan `CASHIER`.
- Public self-order flow berbasis QR token.
- Menu management.
- Dining table management.
- QR token management.
- Internal order management.
- Payment flow.
- Receipt generation dan print attempt tracking.
- Report API untuk owner.
- User management.
- Audit log.
- Upload gambar menu.
- Backup dan restore database.
- Backup dan restore uploaded files.
- Docker production image.
- Production git hygiene dengan `.env`, backup, dan uploads tidak ikut commit.

---

## 2. Tech Stack

### Runtime & Framework

| Kebutuhan | Teknologi |
|---|---|
| Runtime | Node.js |
| Framework API | Express.js |
| Bahasa | JavaScript ES Module |
| Package Manager | npm |
| Process Development | nodemon |

### Database & ORM

| Kebutuhan | Teknologi |
|---|---|
| Database | PostgreSQL |
| ORM | Prisma |
| Database Adapter | `@prisma/adapter-pg` |
| Driver | `pg` |
| Migration | Prisma Migrate |
| Backup DB | `pg_dump` |
| Restore DB | `pg_restore` |

### Security & Validation

| Kebutuhan | Teknologi |
|---|---|
| Password Hashing | bcryptjs |
| Authentication | JWT |
| Authorization | RBAC |
| Request Validation | Zod |
| HTTP Security Headers | Helmet |
| CORS | cors |
| Token Hashing | crypto HMAC/SHA |

### Upload & File Handling

| Kebutuhan | Teknologi |
|---|---|
| Multipart upload | multer |
| Static file serving | Express static middleware |
| Upload directory | `public/uploads/menu-items` |
| Backup uploaded files | tar.gz archive |

### Deployment

| Kebutuhan | Teknologi |
|---|---|
| Containerization | Docker |
| Target DB | PostgreSQL/Railway PostgreSQL |
| Runtime env | Linux/container environment |
| Upload persistence | Docker volume atau persistent storage |

---

## 3. Core Features

### 3.1 Public Customer Self-Order

Fitur pelanggan tanpa login internal.

Alur utama:

1. Pelanggan scan QR meja.
2. Frontend mengirim QR token ke backend.
3. Backend validasi QR token.
4. Backend membuat order session.
5. Pelanggan mengambil daftar menu public.
6. Pelanggan submit order.
7. Order masuk ke sistem internal kasir.

Endpoint utama:

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/api/public/qr/validate` | Validasi QR token meja |
| GET | `/api/public/menu` | Ambil menu public berdasarkan session/token |
| POST | `/api/public/orders` | Submit pesanan pelanggan |

---

### 3.2 Authentication

Autentikasi internal untuk owner dan cashier.

Endpoint utama:

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/api/auth/login` | Login user internal |
| GET | `/api/auth/me` | Ambil profil user aktif |
| POST | `/api/auth/logout` | Logout dan revoke session |

Karakteristik keamanan:

- Password disimpan dalam bentuk hash.
- Access token menggunakan JWT.
- Session token disimpan dalam bentuk hash.
- Role user dibaca dari token dan database session.
- Logout melakukan revoke session.

---

### 3.3 Role-Based Access Control

Role yang digunakan:

| Role | Keterangan |
|---|---|
| OWNER | Akses penuh untuk manajemen sistem, laporan, user, QR, audit |
| CASHIER | Akses operasional kasir, order, payment, receipt, dan sebagian menu/table sesuai kebutuhan operasional |

Contoh pembatasan:

- `OWNER` dapat mengelola user.
- `OWNER` dapat melihat laporan dan audit log.
- `OWNER` dapat membuat, revoke, dan mengelola QR token.
- `CASHIER` dapat memproses order dan pembayaran.
- Akses tanpa token akan menghasilkan `401 Unauthorized`.
- Akses role yang tidak sesuai akan menghasilkan `403 Forbidden`.

---

### 3.4 Menu Management

Backend menyediakan manajemen kategori menu dan item menu.

Fitur:

- Create, read, update kategori menu.
- Create, read, update, soft delete item menu.
- Status ketersediaan menu.
- Display order.
- Harga menu.
- Deskripsi menu.
- Image URL menu.
- Filter/search menu internal.
- Public menu hanya menampilkan kategori dan item aktif.

Data utama:

- `menu_categories`
- `menu_items`

---

### 3.5 Upload Gambar Menu

Backend mendukung upload gambar untuk menu.

Fitur:

- Upload multipart field `image`.
- Folder upload: `public/uploads/menu-items`.
- Static URL: `/uploads/menu-items/<file>`.
- Validasi tipe file gambar.
- Limit ukuran upload.
- File upload tidak disimpan ke Git.
- File upload harus dipersist melalui volume/storage production.

Catatan:

Database hanya menyimpan `imageUrl`. File fisik tetap berada pada folder upload atau storage eksternal.

---

### 3.6 Dining Table & QR Token

Backend mendukung pengelolaan meja dan token QR.

Fitur meja:

- List meja.
- Detail meja.
- Create meja.
- Update meja.
- Activate/deactivate meja.

Fitur QR token:

- Generate QR token untuk meja.
- Revoke QR token.
- List token.
- Validasi token public.
- Raw token hanya diberikan saat generate.
- Database menyimpan token hash, bukan raw token.

Data utama:

- `dining_tables`
- `qr_tokens`

---

### 3.7 Internal Order Management

Backend menyediakan API internal untuk kasir mengelola pesanan.

Fitur:

- List order.
- Detail order.
- Accept order.
- Cancel order.
- Status order.
- Riwayat perubahan status.
- Snapshot item saat order dibuat.
- Total amount dihitung backend.

Data utama:

- `orders`
- `order_items`
- `order_status_histories`
- `order_sessions`

---

### 3.8 Payment & Receipt

Backend mendukung pembayaran tunai dan struk.

Fitur:

- Proses pembayaran order.
- Validasi order harus dalam state yang benar.
- Hitung kembalian.
- Generate nomor transaksi.
- Generate receipt.
- Print attempt tracking.
- Reprint/print status tracking.

Data utama:

- `transactions`
- `receipts`
- `receipt_print_attempts`

---

### 3.9 Reports

Backend menyediakan report untuk owner.

Fitur:

- Ringkasan penjualan.
- Report berdasarkan transaksi/order.
- Report item/menu.
- Data laporan bersumber dari transaksi permanen.
- Akses dibatasi untuk role `OWNER`.

---

### 3.10 User Management

Backend menyediakan manajemen akun internal.

Fitur:

- List user.
- Create user.
- Update user.
- Activate/deactivate user.
- Role `OWNER` dan `CASHIER`.
- Validasi username unik.
- Password hashing.

Data utama:

- `users`
- `user_sessions`

---

### 3.11 Audit Log

Backend mencatat aktivitas penting.

Contoh aktivitas:

- Login user.
- Create/update/delete resource penting.
- Generate/revoke QR token.
- Proses order/payment.
- Aktivitas sistem tertentu.

Data utama:

- `audit_logs`

Audit log berguna untuk pelacakan operasional dan validasi tindakan pengguna internal.

---

### 3.12 Backup & Restore

Backend menyediakan script backup dan restore untuk:

1. Database PostgreSQL.
2. Uploaded files di `public/uploads`.

Dokumentasi lengkap tersedia di:

`docs/BACKUP_RESTORE.md`

---

## 4. Project Structure

Struktur utama backend:

```txt
sos_backend/
├── Dockerfile
├── README.md
├── ROADMAP.md
├── docs/
│   └── BACKUP_RESTORE.md
├── package.json
├── package-lock.json
├── prisma.config.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
│   └── uploads/
│       ├── .gitkeep
│       └── menu-items/
│           └── .gitkeep
├── scripts/
│   ├── backup-all.sh
│   ├── backup-db.sh
│   ├── backup-uploads.sh
│   ├── restore-db.sh
│   └── restore-uploads.sh
└── src/
    ├── app.js
    ├── server.js
    ├── config/
    ├── common/
    └── modules/
```

---

## 5. Architecture

Backend memakai pola modular:

```txt
HTTP Request
    ↓
Route
    ↓
Controller
    ↓
Validation
    ↓
Service
    ↓
Repository
    ↓
Prisma ORM
    ↓
PostgreSQL
```

Penjelasan layer:

| Layer | Tanggung Jawab |
|---|---|
| Route | Mapping endpoint ke controller |
| Controller | Membaca request dan mengirim response |
| Validation | Validasi payload/query/params |
| Service | Business logic |
| Repository | Akses database |
| Prisma | ORM dan query builder |
| PostgreSQL | Penyimpanan data permanen |

---

## 6. Environment Variables

Buat file `.env` lokal berdasarkan `.env.example`.

Contoh variabel:

```env
NODE_ENV=development
PORT=5000

DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

JWT_SECRET="replace_with_minimum_32_characters_secret"
JWT_EXPIRES_IN="10m"

PASSWORD_SALT_ROUNDS=10
TOKEN_HASH_SECRET="replace_with_minimum_32_characters_token_hash_secret"

ORDER_SESSION_EXPIRES_MINUTES=30

CORS_ORIGIN="http://localhost:5173"
```

Catatan penting:

- Jangan commit `.env`.
- Gunakan secret panjang dan random untuk production.
- `DATABASE_URL` production sebaiknya disimpan di environment deployment platform.
- `CORS_ORIGIN` dapat berisi satu atau beberapa origin frontend.

---

## 7. Installation

Install dependency:

```bash
npm install
```

Generate Prisma Client:

```bash
npm run prisma:generate
```

Jalankan migration development:

```bash
npm run prisma:migrate
```

Jalankan server development:

```bash
npm run dev
```

Jalankan server production mode:

```bash
npm start
```

---

## 8. Package Scripts

Script yang tersedia:

| Command | Keterangan |
|---|---|
| `npm run dev` | Menjalankan server dengan nodemon |
| `npm start` | Menjalankan server production |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Migration untuk development |
| `npm run prisma:studio` | Membuka Prisma Studio |
| `npm run db:migrate:deploy` | Deploy migration ke production |
| `npm run db:backup` | Backup database |
| `npm run uploads:backup` | Backup uploaded files |
| `npm run backup:all` | Backup database dan uploads |
| `npm run db:restore` | Restore database dari dump |
| `npm run uploads:restore` | Restore uploaded files |

---

## 9. Database

Database menggunakan PostgreSQL dengan Prisma schema.

Tabel utama:

| Table | Fungsi |
|---|---|
| `users` | Akun internal owner/cashier |
| `user_sessions` | Session login internal |
| `dining_tables` | Data meja |
| `qr_tokens` | QR token per meja |
| `order_sessions` | Session order pelanggan |
| `menu_categories` | Kategori menu |
| `menu_items` | Item menu |
| `orders` | Pesanan |
| `order_items` | Detail item pesanan |
| `order_status_histories` | Riwayat status order |
| `transactions` | Transaksi pembayaran |
| `receipts` | Struk transaksi |
| `receipt_print_attempts` | Percobaan print struk |
| `idempotency_keys` | Pencegahan request ganda |
| `audit_logs` | Audit aktivitas |
| `backup_logs` | Log backup |

---

## 10. API Response Format

### Success Response

Format umum:

```json
{
  "success": true,
  "data": {},
  "message": "Request processed successfully"
}
```

### Error Response

Format umum:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "fields": {}
  },
  "timestamp": "2026-01-01T00:00:00.000Z",
  "path": "/api/example"
}
```

HTTP status yang umum digunakan:

| Status | Arti |
|---|---|
| 200 | Request sukses |
| 201 | Resource berhasil dibuat |
| 400 | Request tidak valid |
| 401 | Belum login/token invalid |
| 403 | Role tidak memiliki akses |
| 404 | Resource tidak ditemukan |
| 409 | Konflik data/state |
| 422 | Validasi bisnis gagal |
| 500 | Internal server error |

---

## 11. API Groups

### Root & Health

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/` | Root API info |
| GET | `/api/health` | Health check service dan database |

### Public Customer

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/api/public/qr/validate` | Validasi QR token |
| GET | `/api/public/menu` | Ambil menu public |
| POST | `/api/public/orders` | Submit order pelanggan |

### Auth

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/api/auth/login` | Login internal |
| GET | `/api/auth/me` | Profil user login |
| POST | `/api/auth/logout` | Logout |

### Internal

Internal API berada di prefix:

```txt
/api/internal
```

Module internal:

| Module | Keterangan |
|---|---|
| Menu | Kategori dan item menu |
| Table | Meja dan QR token |
| Order | Order kasir |
| Payment | Pembayaran dan transaksi |
| Report | Report owner |
| User | Manajemen akun |
| Audit Log | Riwayat aktivitas |
| Upload | Upload gambar menu |

---

## 12. Docker

Build image:

```bash
docker build --network=host -t sos-backend:prod .
```

Run container dengan host network:

```bash
docker run --rm \
  --name sos-backend \
  --network=host \
  --env-file .env \
  -e NODE_ENV=production \
  -v "$(pwd)/public/uploads:/app/public/uploads" \
  sos-backend:prod
```

Catatan upload:

```bash
-v "$(pwd)/public/uploads:/app/public/uploads"
```

Volume ini penting agar file upload tidak hilang saat container diganti.

---

## 13. Production Notes

Checklist production:

- Set `NODE_ENV=production`.
- Set `DATABASE_URL` production.
- Set `JWT_SECRET` random minimal 32 karakter.
- Set `TOKEN_HASH_SECRET` random minimal 32 karakter.
- Set `CORS_ORIGIN` sesuai URL frontend production.
- Jalankan migration production:

```bash
npm run db:migrate:deploy
```

- Pastikan upload directory persistent.
- Pastikan reverse proxy/hosting menggunakan HTTPS.
- Jangan commit `.env`.
- Jangan commit backup dump.
- Jangan commit file upload runtime.
- Jangan commit file report lokal.

---

## 14. Current Production Data Policy

Project ini disiapkan dengan kondisi data awal minimal:

- Data meja kosong.
- Data kategori menu kosong.
- Data item menu kosong.
- Data order kosong.
- Data transaksi kosong.
- Data receipt kosong.
- Data QR token kosong.
- Hanya tersedia bootstrap owner agar frontend bisa mulai input data awal.

Credential bootstrap owner tidak ditulis di repository.

---

## 15. Git Hygiene

File/folder yang tidak boleh masuk Git:

```txt
.env
node_modules/
backups/*
test-results/
public/uploads/*
```

File/folder yang boleh masuk Git:

```txt
.env.example
backups/.gitkeep
public/uploads/.gitkeep
public/uploads/menu-items/.gitkeep
```

---

## 16. Troubleshooting

### Prisma Client belum generate

```bash
npm run prisma:generate
```

### Database belum termigrasi

Development:

```bash
npm run prisma:migrate
```

Production:

```bash
npm run db:migrate:deploy
```

### Upload gambar tidak muncul

Cek:

1. Folder `public/uploads/menu-items` ada.
2. Container memakai volume upload.
3. URL memakai path `/uploads/menu-items/<filename>`.
4. File tidak terhapus saat deployment.

### Login gagal

Cek:

1. User aktif.
2. Password benar.
3. `JWT_SECRET` tersedia.
4. `TOKEN_HASH_SECRET` tersedia.
5. Database connection valid.

### CORS error

Cek isi:

```env
CORS_ORIGIN="http://localhost:5173"
```

Untuk production, ganti sesuai domain frontend.

---

## 17. Related Documentation

- `ROADMAP.md`
- `docs/BACKUP_RESTORE.md`

