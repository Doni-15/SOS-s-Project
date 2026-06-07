# Self-Order System Management

Self-Order System Management adalah aplikasi web untuk mendukung proses pemesanan mandiri berbasis QR Code dan manajemen transaksi kasir pada usaha kuliner skala kecil hingga menengah.

Repository ini menggunakan struktur **monorepo** yang memisahkan backend API dan frontend responsive web dalam satu root project.

```txt
SelfOrderSystemManagement_Project_v1.0/
├── README.md
├── sos_backend/
└── sos_frontend/
```

> Repository ini difokuskan untuk **source code production/deployment**. Dokumen akademik internal seperti requirement document, design document, laporan, dan dokumen private review tidak dipublikasikan di repository.

---

## 1. Project Overview

Sistem ini memungkinkan pelanggan melakukan pemesanan dari perangkat pribadi setelah memindai QR Code meja. Pesanan pelanggan masuk ke panel kasir, kemudian kasir dapat menerima pesanan, memproses pembayaran tunai, menampilkan receipt, dan mencetak struk melalui perangkat kasir. Pemilik dapat mengelola data master, akun pengguna, laporan penjualan, meja, QR token, dan audit log.

Cakupan utama sistem:

- Customer self-order berbasis QR Code.
- Public menu berdasarkan session QR yang valid.
- Internal cashier order management.
- Cash payment processing.
- Receipt payload generation.
- Client-side receipt printing flow.
- Menu dan category management.
- Dining table dan QR token management.
- Owner reports.
- User management dengan RBAC.
- Audit log.
- Upload gambar menu.
- Backup dan restore database/upload files.
- Docker-ready backend deployment.
- Responsive frontend untuk customer, cashier, dan owner.

---

## 2. Tech Stack

### 2.1 Backend

| Area | Technology |
|---|---|
| Runtime | Node.js 22 |
| Framework | Express.js |
| Language | JavaScript ES Module |
| Database | PostgreSQL |
| ORM | Prisma ORM |
| Database Driver | pg |
| Prisma Adapter | @prisma/adapter-pg |
| Authentication | JWT |
| Authorization | RBAC OWNER/CASHIER |
| Validation | Zod |
| Password Hashing | bcryptjs |
| Token Hashing | crypto HMAC/SHA |
| Upload | multer |
| Security Headers | helmet |
| CORS | cors |
| Logging | morgan |
| Development Runner | nodemon |
| Deployment | Docker |

### 2.2 Frontend

| Area | Technology |
|---|---|
| Framework | React |
| Build Tool | Vite |
| Language | JavaScript |
| Styling | Tailwind CSS |
| Routing | React Router |
| API Client | Axios / Fetch / TanStack Query |
| Target UI | Responsive web untuk customer, cashier, dan owner |

---

## 3. Architecture Overview

Backend menggunakan arsitektur modular berlapis.

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

Prinsip implementasi:

- Clean build.
- DRY principle.
- Tidak menggunakan dummy data pada production flow.
- Controller tidak mengakses database langsung.
- Service menjadi pusat business logic.
- Repository menjadi satu-satunya jalur akses database.
- Semua validasi request dilakukan sebelum business logic.
- Semua endpoint internal dilindungi authentication dan RBAC.
- Data transaksi dibuat immutable melalui snapshot order item.
- Upload file dipisahkan dari metadata database.
- Backup database dan upload dipisahkan dari source code.

---

## 4. Repository Structure

```txt
SelfOrderSystemManagement_Project_v1.0/
├── README.md
├── sos_backend/
│   ├── Dockerfile
│   ├── README.md
│   ├── ROADMAP.md
│   ├── docs/
│   │   └── BACKUP_RESTORE.md
│   ├── package.json
│   ├── package-lock.json
│   ├── prisma.config.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── public/
│   │   └── uploads/
│   │       └── menu-items/
│   ├── scripts/
│   │   ├── backup-all.sh
│   │   ├── backup-db.sh
│   │   ├── backup-uploads.sh
│   │   ├── restore-db.sh
│   │   ├── restore-uploads.sh
│   │   └── pre-push-review.sh
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/
│       ├── common/
│       └── modules/
└── sos_frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── public/
    └── src/
        ├── app/
        ├── routes/
        ├── shared/
        ├── features/
        └── main.jsx
```

---

## 5. Backend Modules

Backend dipisahkan berdasarkan domain fitur.

| Module | Responsibility |
|---|---|
| auth | Login, logout, current user, JWT session, token hash |
| publicOrder | QR validation, public menu, customer order submission |
| internalOrder | Internal order list, detail, accept, cancel, status history |
| menu | Menu category, menu item, availability status, search/filter |
| payment | Cash payment, transaction, receipt, print attempt tracking |
| report | Owner sales report, daily sales, top menu item |
| table | Dining table management dan QR token management |
| upload | Menu image upload dan file validation |
| user | Internal user management |
| auditLog | Activity tracking dan audit log access |

---

## 6. Core Features

### 6.1 Customer Self-Order

Alur pelanggan:

1. Pelanggan memindai QR Code pada meja.
2. Frontend mengirim QR token ke backend.
3. Backend memvalidasi QR token.
4. Backend membuat order session.
5. Pelanggan melihat public menu.
6. Pelanggan menambahkan item ke cart.
7. Pelanggan mengirim pesanan.
8. Backend menghitung ulang harga dan availability dari database.
9. Order masuk ke panel kasir.

Endpoint utama:

```txt
POST /api/public/qr/validate
GET  /api/public/menu
POST /api/public/orders
```

### 6.2 Cashier Order Management

Fitur kasir:

- Melihat daftar order masuk.
- Melihat detail order.
- Menerima order.
- Membatalkan order yang belum dibayar.
- Memproses pembayaran tunai.
- Melihat receipt.
- Melakukan print/reprint dari client kasir.
- Melaporkan hasil print success/failed ke backend.

Endpoint utama:

```txt
GET   /api/internal/orders
GET   /api/internal/orders/:id
PATCH /api/internal/orders/:id/accept
PATCH /api/internal/orders/:id/cancel
POST  /api/internal/orders/:id/payments
```

### 6.3 Payment and Receipt

Backend bertanggung jawab untuk:

- Memvalidasi state order.
- Memproses pembayaran tunai.
- Menghitung kembalian.
- Membuat transaction number.
- Membuat receipt number.
- Menyimpan receipt payload.
- Mencatat print attempt.

Endpoint utama:

```txt
GET   /api/internal/transactions
GET   /api/internal/transactions/:id
GET   /api/internal/receipts/:id
PATCH /api/internal/receipts/:id/print-success
PATCH /api/internal/receipts/:id/print-failed
```

### 6.4 Receipt Printing Flow

Backend **tidak berkomunikasi langsung** dengan printer thermal.

Backend bertanggung jawab untuk:

- Memproses payment.
- Membuat transaction.
- Membuat receipt payload.
- Menyediakan detail receipt.
- Mencatat print success.
- Mencatat print failed.

Frontend kasir bertanggung jawab untuk:

- Menampilkan preview receipt.
- Menjalankan print melalui browser print dialog, OS printer driver, atau local print bridge.
- Melaporkan hasil print ke backend.

Alur ringkas:

```txt
Cashier UI
  → POST /api/internal/orders/:id/payments
  → GET /api/internal/receipts/:id
  → Browser/OS/Local Print Bridge prints receipt
  → PATCH /api/internal/receipts/:id/print-success
    or
  → PATCH /api/internal/receipts/:id/print-failed
```

Print failure tidak membatalkan transaksi. Kasir dapat melakukan reprint menggunakan receipt yang sama.

### 6.5 Menu Management

Fitur:

- Create category.
- Update category.
- List categories.
- Create menu item.
- Update menu item.
- Soft delete menu item.
- Set item availability.
- Search/filter menu.
- Upload image menu.

### 6.6 Dining Table and QR Token

Fitur:

- Create dining table.
- Update dining table.
- Activate/deactivate table.
- Generate QR token.
- Revoke QR token.
- Validate QR token.
- Raw QR token hanya ditampilkan saat generate.
- Database menyimpan token hash, bukan raw token.

### 6.7 Owner Reports

Fitur owner:

- Sales summary.
- Daily sales.
- Top menu items.
- Transaction report.
- Audit log access.
- User management.

### 6.8 User Management and RBAC

Role internal:

| Role | Access |
|---|---|
| OWNER | Akses penuh ke owner report, user management, audit log, table/QR admin, menu, order, payment |
| CASHIER | Akses operasional kasir: order, payment, receipt, menu/table sesuai kebutuhan operasional |

---

## 7. Prerequisites

Pastikan sudah tersedia:

- Node.js 22 atau versi kompatibel.
- npm.
- PostgreSQL 14+.
- Git.
- Docker, opsional untuk production/container testing.

Cek versi:

```bash
node -v
npm -v
psql --version
```

---

## 8. Environment Variables

Backend menggunakan file environment di:

```txt
sos_backend/.env
```

Buat file `.env` dari contoh:

```bash
cd sos_backend
cp .env.example .env
```

Contoh konfigurasi:

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

Catatan:

- Jangan commit `.env`.
- Gunakan secret panjang dan random untuk production.
- Gunakan database credential dari environment deployment untuk production.
- Sesuaikan `CORS_ORIGIN` dengan URL frontend.

---

## 9. Local Development

### 9.1 Backend Setup

```bash
cd sos_backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Backend berjalan pada:

```txt
http://localhost:5000
```

Health check:

```txt
GET http://localhost:5000/api/health
```

### 9.2 Frontend Setup

```bash
cd sos_frontend
npm install
npm run dev
```

Frontend berjalan pada:

```txt
http://localhost:5173
```

Pastikan `sos_backend/.env` memiliki:

```env
CORS_ORIGIN="http://localhost:5173"
```

---

## 10. Database and Prisma

Generate Prisma client:

```bash
cd sos_backend
npm run prisma:generate
```

Jalankan migration development:

```bash
npm run prisma:migrate
```

Deploy migration untuk production:

```bash
npm run db:migrate:deploy
```

Buka Prisma Studio:

```bash
npm run prisma:studio
```

Model utama database:

- User
- UserSession
- DiningTable
- QrToken
- OrderSession
- MenuCategory
- MenuItem
- Order
- OrderItem
- OrderStatusHistory
- Transaction
- Receipt
- ReceiptPrintAttempt
- IdempotencyKey
- AuditLog
- BackupLog

---

## 11. Backend Package Scripts

Jalankan dari folder `sos_backend`.

| Command | Description |
|---|---|
| `npm run dev` | Run backend development server with nodemon |
| `npm start` | Run backend production server |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Run development migration |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run db:migrate:deploy` | Deploy migrations for production |
| `npm run db:backup` | Backup PostgreSQL database |
| `npm run uploads:backup` | Backup uploaded files |
| `npm run backup:all` | Backup database and uploaded files |
| `npm run db:restore -- <file.dump>` | Restore database backup |
| `npm run uploads:restore -- <file.tar.gz>` | Restore uploaded files backup |

---

## 12. Production Build and Deployment

### 12.1 Backend Production Run

```bash
cd sos_backend
npm install
npm run prisma:generate
npm run db:migrate:deploy
npm start
```

### 12.2 Frontend Production Build

```bash
cd sos_frontend
npm install
npm run build
```

Build output:

```txt
sos_frontend/dist
```

Deploy folder `dist` ke static hosting seperti Nginx, Apache, Netlify, Vercel, atau static server lain.

### 12.3 Backend Docker Build

```bash
cd sos_backend
docker build -t sos-backend:prod .
```

Run container:

```bash
docker run --rm \
  --name sos-backend \
  --env-file .env \
  -p 5000:5000 \
  -v "$(pwd)/public/uploads:/app/public/uploads" \
  sos-backend:prod
```

Health check:

```txt
http://localhost:5000/api/health
```

---

## 13. Upload Persistence

Uploaded menu images disimpan pada:

```txt
sos_backend/public/uploads/menu-items
```

Untuk production, folder upload harus menggunakan persistent storage atau mounted volume.

Contoh Docker volume:

```bash
-v "$(pwd)/public/uploads:/app/public/uploads"
```

Tanpa persistent storage, file upload dapat hilang saat container diganti atau redeploy.

---

## 14. Backup and Restore

Backend menyediakan script backup untuk:

1. Database PostgreSQL.
2. Uploaded files.

### 14.1 Backup Database

```bash
cd sos_backend
npm run db:backup
```

Output:

```txt
backups/sos-db-YYYYMMDD-HHMMSS.dump
backups/sos-db-YYYYMMDD-HHMMSS.dump.json
```

### 14.2 Backup Uploaded Files

```bash
npm run uploads:backup
```

Output:

```txt
backups/sos-uploads-YYYYMMDD-HHMMSS.tar.gz
backups/sos-uploads-YYYYMMDD-HHMMSS.tar.gz.json
```

### 14.3 Full Backup

```bash
npm run backup:all
```

### 14.4 Restore Database

```bash
npm run db:restore -- backups/<backup-file>.dump
```

### 14.5 Restore Uploaded Files

```bash
npm run uploads:restore -- backups/<uploads-file>.tar.gz
```

Backup dan restore detail tersedia di:

```txt
sos_backend/docs/BACKUP_RESTORE.md
```

---

## 15. Runtime Files Policy

File/folder berikut tidak boleh masuk Git:

```txt
.env
.env.*
node_modules/
test-results/
backups/
public/uploads/*
sos_backend/public/uploads/menu-items/*
sos_frontend/dist/
```

File yang boleh disimpan untuk menjaga struktur folder:

```txt
sos_backend/public/uploads/.gitkeep
sos_backend/public/uploads/menu-items/.gitkeep
sos_backend/backups/.gitkeep
```

Dokumen akademik/private seperti `.docx`, `.pdf`, laporan internal, dan review private tidak dipublikasikan di repository production.

---

## 16. Recommended Root .gitignore

Gunakan `.gitignore` root untuk menjaga monorepo tetap bersih.

```gitignore
# OS / Editor
.DS_Store
Thumbs.db
.vscode/
.idea/

# Environment
.env
.env.*
!.env.example

# Dependencies
node_modules/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
coverage/
generated/
.generated/

# Runtime data
test-results/
backups/
public/uploads/
sos_backend/test-results/
sos_backend/backups/*
!sos_backend/backups/.gitkeep
sos_backend/public/uploads/*
!sos_backend/public/uploads/.gitkeep
!sos_backend/public/uploads/menu-items/
sos_backend/public/uploads/menu-items/*
!sos_backend/public/uploads/menu-items/.gitkeep

# Private academic/internal documents
docs/
*.docx
*.pdf
*.pptx
```

---

## 17. API Testing Checklist

Sebelum frontend dianggap terintegrasi, jalankan test alur berikut menggunakan curl, Postman, Insomnia, atau Thunder Client.

```txt
1. Health check backend
2. Login OWNER
3. Get current user profile
4. Create CASHIER user
5. Create dining table
6. Generate QR token
7. Validate QR token from public endpoint
8. Create menu category
9. Create menu item
10. Upload menu image
11. Get public menu
12. Submit customer order
13. Cashier lists incoming order
14. Cashier accepts order
15. Cashier processes payment
16. Get receipt detail
17. Record print success
18. Record print failed
19. Owner checks sales summary
20. Owner checks daily sales
21. Owner checks top menu items
22. Owner checks audit log
23. Logout
```

Critical validation rules:

- Order total must be calculated by backend.
- Out-of-stock menu must not be orderable.
- Payment lower than total must be rejected.
- Double payment must be rejected.
- Receipt must remain available even if print fails.
- Print failure must not cancel transaction.
- CASHIER must not access owner-only endpoints.
- Reports must use stored transactions, not temporary cart data.

---

## 18. Frontend Integration Rules

Frontend wajib mengikuti aturan berikut:

- Tidak menggunakan dummy data untuk production flow.
- Semua data berasal dari backend API.
- Gunakan centralized API client.
- Gunakan reusable components untuk menjaga DRY.
- Pisahkan fitur customer, cashier, dan owner.
- Buat UI responsive untuk smartphone, tablet, laptop, dan desktop.
- Tampilkan empty state jika backend belum memiliki data.
- Jangan hardcode menu, order, user, atau laporan.
- Token/session handling dilakukan melalui shared auth layer.
- Error response backend ditampilkan secara jelas kepada user.

Recommended frontend structure:

```txt
sos_frontend/src/
├── app/
│   ├── App.jsx
│   └── providers.jsx
├── routes/
│   └── AppRoutes.jsx
├── shared/
│   ├── api/
│   ├── components/
│   ├── hooks/
│   ├── layouts/
│   └── utils/
├── features/
│   ├── auth/
│   ├── public-order/
│   ├── cashier/
│   ├── owner/
│   ├── menu/
│   ├── table/
│   ├── upload/
│   └── receipt/
└── main.jsx
```

---

## 19. Security Notes

Security policy:

- Jangan commit `.env`.
- Jangan commit backup database.
- Jangan commit uploaded runtime files.
- Jangan commit file hasil testing lokal.
- Gunakan JWT secret dan token hash secret yang panjang dan random.
- Gunakan HTTPS pada production.
- Batasi CORS hanya ke frontend origin yang valid.
- Password disimpan dalam bentuk hash.
- Raw token tidak disimpan di database.
- Endpoint internal wajib authentication.
- Owner-only endpoint wajib RBAC OWNER.
- Upload file harus divalidasi MIME type dan ukuran file.

---

## 20. Troubleshooting

### Backend gagal connect database

Periksa:

```txt
DATABASE_URL
PostgreSQL server status
Prisma migration status
Network/firewall database
```

Jalankan:

```bash
cd sos_backend
npm run prisma:generate
npm run db:migrate:deploy
```

### Frontend terkena CORS error

Periksa `sos_backend/.env`:

```env
CORS_ORIGIN="http://localhost:5173"
```

Pastikan backend restart setelah `.env` diubah.

### Upload berhasil tetapi gambar hilang setelah redeploy

Pastikan folder upload menggunakan persistent storage atau Docker volume.

```bash
-v "$(pwd)/public/uploads:/app/public/uploads"
```

### Payment berhasil tetapi printer gagal

Ini bukan error transaksi. Alur yang benar:

1. Transaction tetap tersimpan.
2. Receipt tetap tersedia.
3. Frontend mencatat print failed ke backend.
4. Kasir dapat melakukan reprint.

### Prisma Client error setelah install ulang

Jalankan:

```bash
cd sos_backend
npm run prisma:generate
```

---

## 21. Development Workflow

Recommended workflow:

```txt
1. Pull latest code.
2. Install dependencies.
3. Configure environment variables.
4. Run database migration.
5. Start backend.
6. Start frontend.
7. Test API flow.
8. Implement frontend integration.
9. Run pre-push review.
10. Commit clean source only.
```

Before push:

```bash
cd sos_backend
bash scripts/pre-push-review.sh
```

Pastikan tidak ada file runtime/private yang ikut commit.

---

## 22. Deployment Checklist

Sebelum deploy production:

```txt
[ ] Environment variables sudah benar.
[ ] DATABASE_URL production sudah valid.
[ ] JWT_SECRET production sudah random dan panjang.
[ ] TOKEN_HASH_SECRET production sudah random dan panjang.
[ ] CORS_ORIGIN mengarah ke frontend production.
[ ] Prisma migration sudah deploy.
[ ] Backend health check berhasil.
[ ] Upload folder memakai persistent storage.
[ ] Backup database sudah diuji.
[ ] Restore database sudah dipahami.
[ ] Frontend production build berhasil.
[ ] Owner account tersedia.
[ ] Public QR flow sudah diuji.
[ ] Cashier order-payment-receipt flow sudah diuji.
[ ] Owner report flow sudah diuji.
```

---

## 23. Repository Policy

Repository ini hanya berisi source code dan dokumentasi teknis production yang diperlukan untuk menjalankan, membangun, dan mendeploy sistem.

Tidak dipublikasikan:

- Dokumen requirement akademik internal.
- Dokumen design akademik internal.
- Laporan review private.
- File `.env`.
- Backup database.
- Runtime uploaded files.
- Test result lokal.

---

## 24. License and Usage

Project ini dibuat untuk kebutuhan pengembangan sistem Self-Order System Management. Penggunaan, distribusi, dan deployment mengikuti kebijakan tim/project owner.

