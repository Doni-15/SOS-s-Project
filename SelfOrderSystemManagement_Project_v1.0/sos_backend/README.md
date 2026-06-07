# Self Order System Management - Backend

Backend untuk aplikasi Self Order System Management berbasis Node.js, Express, Prisma, dan PostgreSQL.

Backend ini menyediakan REST API untuk:

1. Owner
2. Cashier / Kasir
3. Public customer order melalui QR meja

---

## Tech Stack

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JSON Web Token
- Zod validation
- Multer upload
- Helmet
- CORS
- Morgan logger

---

## Fitur Utama

### Authentication

- Login internal.
- Endpoint profil user aktif.
- Logout.
- JWT authentication.
- Session token disimpan dalam bentuk hash di database.

### Role Based Access Control

Role internal:

- OWNER
- CASHIER

Owner memiliki akses penuh ke fitur manajemen.

Cashier memiliki akses operasional seperti pesanan, pembayaran, transaksi, dan menu operasional.

### Owner

Owner dapat mengakses:

- Manajemen menu.
- Manajemen kategori menu.
- Manajemen user.
- Laporan penjualan.
- Analitik.
- Audit log.
- Manajemen meja.
- Generate QR meja.
- Revoke QR token.
- Backup dan restore melalui script lokal.

### Cashier / Kasir

Kasir dapat mengakses:

- Daftar pesanan.
- Detail pesanan.
- Accept pesanan.
- Cancel pesanan.
- Pembayaran cash.
- Riwayat transaksi.
- Receipt / struk.
- Upload gambar menu jika endpoint diaktifkan untuk kasir.
- Melihat data meja sesuai rule backend.

### Public Customer Order

Backend menyediakan endpoint public untuk:

- Validasi QR token.
- Mengambil menu public.
- Membuat order dari customer.

QR token menggunakan raw token di sisi client, sedangkan backend menyimpan hash token di database.

---

## Struktur Folder Penting

    src/
    ├── app.js
    ├── server.js
    ├── common/
    │   ├── errors/
    │   ├── middlewares/
    │   ├── responses/
    │   └── utils/
    ├── config/
    └── modules/
        ├── auditLog/
        ├── auth/
        ├── internalOrder/
        ├── menu/
        ├── payment/
        ├── publicOrder/
        ├── report/
        ├── table/
        ├── upload/
        └── user/

    prisma/
    ├── schema.prisma
    └── migrations/

    scripts/
    ├── backup-all.sh
    ├── backup-db.sh
    ├── backup-uploads.sh
    ├── pre-push-review.sh
    ├── restore-db.sh
    └── restore-uploads.sh

    docs/
    └── BACKUP_RESTORE.md

---

## Environment Variables

Buat file .env dari template:

    cp .env.example .env

Contoh konfigurasi local development:

    NODE_ENV=development
    PORT=5000
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
    JWT_SECRET="replace_with_minimum_32_characters_secret"
    JWT_EXPIRES_IN="10m"
    PASSWORD_SALT_ROUNDS=10
    TOKEN_HASH_SECRET="replace_with_minimum_32_characters_token_hash_secret"
    ORDER_SESSION_EXPIRES_MINUTES=30
    CORS_ORIGIN="http://localhost:5173"

Catatan:

- Jangan commit file .env.
- JWT_SECRET minimal 32 karakter.
- TOKEN_HASH_SECRET minimal 32 karakter.
- CORS_ORIGIN sesuaikan dengan domain frontend.
- DATABASE_URL harus mengarah ke database PostgreSQL yang benar.

---

## Persiapan Development

Masuk ke folder backend:

    cd sos_backend

Install dependency:

    npm install

Generate Prisma Client:

    npm run prisma:generate

Jalankan migration development:

    npm run prisma:migrate

Jalankan backend development:

    npm run dev

Default backend berjalan di:

    http://localhost:5000

Health check:

    http://localhost:5000/api/health

---

## Menjalankan Production

Install dependency:

    npm install

Generate Prisma Client:

    npm run prisma:generate

Deploy migration production:

    npm run db:migrate:deploy

Start server:

    npm start

---

## NPM Scripts

    npm run dev

Menjalankan backend dengan nodemon.

    npm start

Menjalankan backend menggunakan node src/server.js.

    npm run prisma:generate

Generate Prisma Client.

    npm run prisma:migrate

Menjalankan Prisma migrate dev untuk development.

    npm run prisma:studio

Membuka Prisma Studio.

    npm run db:migrate:deploy

Deploy migration untuk production.

    npm run db:backup

Backup database PostgreSQL.

    npm run uploads:backup

Backup folder upload.

    npm run backup:all

Backup database dan upload sekaligus.

    npm run db:restore -- <file.dump>

Restore database dari file dump.

    npm run uploads:restore -- <file.tar.gz>

Restore upload dari archive.

---

## API Base URL

Base path backend:

    /api

Contoh local:

    http://localhost:5000/api

Contoh production:

    https://domain-backend-kalian.com/api

---

## Ringkasan Endpoint

### Health

    GET /api/health

### Auth

    POST /api/auth/login
    GET /api/auth/me
    POST /api/auth/logout

### Public Order

    POST /api/public/qr/validate
    GET /api/public/menu
    POST /api/public/orders

### Internal Menu

    GET /api/internal/menu-categories
    POST /api/internal/menu-categories
    PATCH /api/internal/menu-categories/:id
    GET /api/internal/menu-items
    POST /api/internal/menu-items
    GET /api/internal/menu-items/:id
    PATCH /api/internal/menu-items/:id
    DELETE /api/internal/menu-items/:id

### Internal Orders

    GET /api/internal/orders
    GET /api/internal/orders/:id
    PATCH /api/internal/orders/:id/accept
    PATCH /api/internal/orders/:id/cancel

### Payments

    POST /api/internal/orders/:id/payments
    GET /api/internal/transactions
    GET /api/internal/transactions/:id
    GET /api/internal/receipts/:id

### Reports

    GET /api/internal/reports/sales-summary
    GET /api/internal/reports/daily-sales
    GET /api/internal/reports/top-menu-items

### Users

    GET /api/internal/users
    POST /api/internal/users
    GET /api/internal/users/:id
    PATCH /api/internal/users/:id
    PATCH /api/internal/users/:id/password

### Tables & QR

    GET /api/internal/tables
    GET /api/internal/tables/:id
    POST /api/internal/tables
    PATCH /api/internal/tables/:id
    PATCH /api/internal/tables/:id/activate
    PATCH /api/internal/tables/:id/deactivate
    GET /api/internal/tables/:id/qr-tokens
    POST /api/internal/tables/:id/qr-tokens
    PATCH /api/internal/qr-tokens/:id/revoke

### Upload

    POST /api/internal/uploads/menu-image

### Audit Log

    GET /api/internal/audit-logs

---

## Database

Database menggunakan PostgreSQL dan Prisma ORM.

File schema utama:

    prisma/schema.prisma

Migration berada di:

    prisma/migrations/

Model utama:

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

Enum utama:

- UserRole
- AvailabilityStatus
- OrderStatus
- PaymentMethod
- PrintStatus
- PrintAttemptStatus
- BackupType
- BackupStatus

---

## Upload File

Upload menu image disimpan di folder:

    public/uploads/menu-items/

Folder upload adalah runtime storage, jadi file gambar hasil upload tidak perlu dicommit ke GitHub.

Yang dicommit cukup:

    public/uploads/.gitkeep
    public/uploads/menu-items/.gitkeep

---

## Backup & Restore

Dokumentasi lengkap tersedia di:

    docs/BACKUP_RESTORE.md

Backup database:

    npm run db:backup

Backup upload:

    npm run uploads:backup

Backup semua:

    npm run backup:all

Restore database:

    npm run db:restore -- backups/sos-db-YYYYMMDD-HHMMSS.dump

Restore uploads:

    npm run uploads:restore -- backups/sos-uploads-YYYYMMDD-HHMMSS.tar.gz

Catatan:

- Backup bersifat lokal.
- File backup tidak boleh dicommit.
- Untuk production, simpan backup di storage terpisah.

---

## Pre-Push Review

Jalankan sebelum push:

    bash scripts/pre-push-review.sh

Script ini akan mengecek:

- git status,
- file kandidat backend,
- package scripts,
- config penting,
- syntax shell scripts,
- syntax JavaScript files,
- Prisma validate,
- risk scan mock/debug/secret,
- runtime file check,
- full text content review.

---

## File yang Masuk GitHub

File/folder yang perlu dicommit:

- package.json
- package-lock.json
- .env.example
- .gitignore
- .dockerignore
- Dockerfile
- nodemon.json
- prisma.config.ts
- prisma/
- src/
- scripts/
- docs/
- README.md
- backups/.gitkeep
- public/uploads/.gitkeep
- public/uploads/menu-items/.gitkeep

---

## File yang Tidak Boleh Masuk GitHub

File/folder berikut tidak boleh dicommit:

- .env
- .env.local
- .env.development
- .env.production
- node_modules/
- test-results/
- backups/*.dump
- backups/*.json
- backups/*.tar.gz
- public/uploads/menu-items/*.png
- public/uploads/menu-items/*.jpg
- public/uploads/menu-items/*.jpeg
- public/uploads/menu-items/*.webp
- *.log

Alasannya:

- .env berisi secret lokal.
- node_modules bisa dibuat ulang dengan npm install.
- test-results hanya laporan lokal.
- backups berisi data sensitif.
- public/uploads berisi file runtime dari user.

---

## Docker

Build image:

    docker build -t sos-backend:prod .

Run container:

    docker run --rm \
      --name sos-backend \
      --env-file .env \
      -p 5000:5000 \
      sos-backend:prod

Untuk production yang memakai upload file, gunakan persistent volume:

    docker run --rm \
      --name sos-backend \
      --env-file .env \
      -p 5000:5000 \
      -v "$(pwd)/public/uploads:/app/public/uploads" \
      sos-backend:prod

---

## Catatan Keamanan

- Jangan commit .env.
- Jangan commit backup database.
- Jangan commit file upload runtime.
- Jangan commit test-results.
- Jangan menaruh secret di README.
- Rotate secret jika pernah tercetak di laporan lokal.
- Gunakan JWT_SECRET dan TOKEN_HASH_SECRET yang kuat.
- Batasi CORS_ORIGIN ke domain frontend yang dipercaya.
- Gunakan database production yang berbeda dari database development.

---

## Status Saat Ini

Backend sudah mendukung flow internal:

- OWNER
- CASHIER

Backend juga sudah menyiapkan public order API untuk QR customer.

Frontend internal owner dan cashier dapat memakai backend ini melalui:

    VITE_API_BASE_URL=http://localhost:5000/api

