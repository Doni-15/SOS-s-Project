# Roadmap Backend — Self-Order System Management

Roadmap ini mencatat pekerjaan backend yang sudah diselesaikan, status produksi, dan rencana lanjutan setelah backend di-push dan diintegrasikan dengan frontend.

Project: **Self-Order System Management Backend**  
Folder: `sos_backend`  
Status: **Production-ready backend untuk integrasi frontend**

---

## 1. Tujuan Backend

Backend ini dibangun untuk mendukung sistem pemesanan mandiri berbasis QR Code.

Tujuan utama:

1. Pelanggan dapat memesan menu dari perangkat pribadi melalui QR meja.
2. Kasir dapat menerima dan memproses pesanan.
3. Kasir dapat mencatat pembayaran dan menghasilkan struk.
4. Pemilik dapat mengelola menu, meja, QR, user, laporan, dan audit log.
5. Data transaksi tersimpan di PostgreSQL secara konsisten untuk laporan dan audit.
6. Backend siap dijalankan di environment production menggunakan Docker.

---

## 2. Prinsip Implementasi

Backend mengikuti prinsip berikut:

- REST API.
- Modular architecture.
- Controller-service-repository separation.
- Validasi request sebelum business logic.
- Database transaction untuk proses penting.
- RBAC untuk akses internal.
- Token tidak disimpan raw di database.
- Password disimpan dalam bentuk hash.
- Upload file dipisahkan dari data database.
- Backup database dan upload dikelola melalui script operasional.
- `.env`, backup, upload runtime, dan file lokal tidak masuk Git.

---

## 3. Roadmap Summary

| Fase | Area | Status |
|---|---|---|
| 0 | Requirement alignment | Done |
| 1 | Project setup | Done |
| 2 | Database schema & migration | Done |
| 3 | Auth & RBAC | Done |
| 4 | Menu management | Done |
| 5 | Table & QR management | Done |
| 6 | Public self-order | Done |
| 7 | Internal order management | Done |
| 8 | Payment & receipt | Done |
| 9 | Report & audit log | Done |
| 10 | Upload image | Done |
| 11 | Backup & restore | Done |
| 12 | Docker production readiness | Done |
| 13 | Production data cleanup | Done |
| 14 | Documentation cleanup | In progress |
| 15 | Frontend integration | Next |

---

## 4. Completed Work Detail

### 4.1 Requirement Alignment

Status: **Done**

Yang sudah dilakukan:

- Menyesuaikan backend dengan kebutuhan self-order berbasis QR.
- Menyesuaikan fitur internal untuk role owner dan cashier.
- Menyesuaikan database dengan kebutuhan transaksi, laporan, dan audit.
- Menyesuaikan struktur API dengan desain modular.
- Menentukan boundary sistem tanpa integrasi marketplace atau delivery platform eksternal.

Output:

- Backend scope jelas.
- Data model utama terdefinisi.
- API module terpisah berdasarkan domain fitur.

---

### 4.2 Project Setup

Status: **Done**

Yang sudah dilakukan:

- Setup Node.js project.
- Setup Express.js.
- Setup ES Module.
- Setup nodemon untuk development.
- Setup environment config.
- Setup CORS.
- Setup Helmet.
- Setup Morgan logging.
- Setup global error handler.
- Setup not found middleware.
- Setup request context middleware.
- Setup response wrapper.

Output utama:

```txt
src/app.js
src/server.js
src/config/env.js
src/common/
```

---

### 4.3 Database Schema & Migration

Status: **Done**

Yang sudah dilakukan:

- Setup PostgreSQL.
- Setup Prisma.
- Setup Prisma 7 adapter PostgreSQL.
- Setup migration awal.
- Membuat schema relasional lengkap.
- Membuat enum status.
- Membuat index untuk query penting.
- Membuat relation dan foreign key.

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

Output utama:

```txt
prisma/schema.prisma
prisma/migrations/
prisma.config.ts
src/config/prisma.js
```

---

### 4.4 Auth & RBAC

Status: **Done**

Yang sudah dilakukan:

- Login internal.
- Get current user.
- Logout.
- JWT access token.
- Session tracking.
- Token hashing.
- Password hashing.
- Middleware authentication.
- Middleware role authorization.
- RBAC untuk OWNER dan CASHIER.

Endpoint group:

```txt
/api/auth
```

Output utama:

```txt
src/modules/auth/
src/common/middlewares/auth.middleware.js
```

---

### 4.5 Menu Management

Status: **Done**

Yang sudah dilakukan:

- CRUD kategori menu.
- CRUD item menu.
- Soft delete item menu.
- Status availability menu.
- Search/filter menu internal.
- Public menu hanya menampilkan data aktif.
- Image URL pada menu item.

Endpoint group:

```txt
/api/internal
```

Output utama:

```txt
src/modules/menu/
```

---

### 4.6 Table & QR Management

Status: **Done**

Yang sudah dilakukan:

- List meja.
- Create meja.
- Update meja.
- Activate/deactivate meja.
- Generate QR token.
- Revoke QR token.
- List QR token.
- Public QR validation.
- Hash raw QR token sebelum disimpan.

Output utama:

```txt
src/modules/table/
src/modules/publicOrder/
```

---

### 4.7 Public Self-Order

Status: **Done**

Yang sudah dilakukan:

- Validasi QR token.
- Membuat order session.
- Mengambil public menu.
- Submit pesanan pelanggan.
- Validasi session aktif.
- Validasi item menu aktif dan tersedia.
- Snapshot nama item, kategori, dan harga saat order dibuat.
- Hitung subtotal dan total amount di backend.
- Generate order number.

Endpoint utama:

```txt
POST /api/public/qr/validate
GET  /api/public/menu
POST /api/public/orders
```

Output utama:

```txt
src/modules/publicOrder/
```

---

### 4.8 Internal Order Management

Status: **Done**

Yang sudah dilakukan:

- List order internal.
- Detail order.
- Accept order.
- Cancel order.
- Status order.
- Riwayat perubahan status.
- Versioning sederhana untuk order.
- Validasi state order.

Output utama:

```txt
src/modules/internalOrder/
```

---

### 4.9 Payment & Receipt

Status: **Done**

Yang sudah dilakukan:

- Proses pembayaran order.
- Validasi total pembayaran.
- Hitung kembalian.
- Generate transaction number.
- Generate receipt number.
- Simpan receipt payload.
- Track print attempt.
- Status print receipt.

Output utama:

```txt
src/modules/payment/
```

---

### 4.10 Report & Audit Log

Status: **Done**

Yang sudah dilakukan:

- Report untuk owner.
- Ringkasan transaksi.
- Data laporan dari transaksi tersimpan.
- Audit log aktivitas penting.
- Audit log hanya dapat diakses owner.
- RBAC cashier ditolak untuk audit log.

Output utama:

```txt
src/modules/report/
src/modules/auditLog/
```

---

### 4.11 User Management

Status: **Done**

Yang sudah dilakukan:

- List user.
- Create user.
- Update user.
- Activate/deactivate user.
- Role OWNER dan CASHIER.
- Validasi username unik.
- Password hashing.

Output utama:

```txt
src/modules/user/
```

---

### 4.12 Upload Image

Status: **Done**

Yang sudah dilakukan:

- Upload gambar menu dengan multipart.
- Simpan file ke `public/uploads/menu-items`.
- Serve file via `/uploads`.
- Validasi format file.
- Limit ukuran upload.
- Docker folder permission untuk upload.
- Runtime upload tidak masuk Git.

Output utama:

```txt
src/modules/upload/
public/uploads/.gitkeep
public/uploads/menu-items/.gitkeep
```

---

### 4.13 Backup & Restore

Status: **Done**

Yang sudah dilakukan:

- Backup database PostgreSQL.
- Backup uploaded files.
- Full backup database + uploads.
- Restore database.
- Restore uploaded files.
- Metadata backup.
- SHA256 checksum.
- Masking database URL pada output script.

Output utama:

```txt
scripts/backup-db.sh
scripts/backup-uploads.sh
scripts/backup-all.sh
scripts/restore-db.sh
scripts/restore-uploads.sh
docs/BACKUP_RESTORE.md
```

---

### 4.14 Docker Production Readiness

Status: **Done**

Yang sudah dilakukan:

- Multi-stage Dockerfile.
- Install dependency dengan `npm ci`.
- Prisma generate saat build.
- Prune dev dependency.
- Non-root user.
- Healthcheck endpoint.
- Upload directory dibuat di image.
- Support upload persistence dengan volume.

Output utama:

```txt
Dockerfile
.dockerignore
```

---

### 4.15 Production Data Cleanup

Status: **Done**

Yang sudah dilakukan:

- Membersihkan data master dan transaksi.
- Mengosongkan meja.
- Mengosongkan kategori menu.
- Mengosongkan item menu.
- Mengosongkan order.
- Mengosongkan transaksi.
- Mengosongkan receipt.
- Mengosongkan QR token.
- Menyisakan 1 bootstrap owner untuk input data dari frontend.
- Backup final setelah cleanup.
- Runtime backup dipindahkan keluar repo.

Kondisi data akhir:

```txt
menu_categories : 0
menu_items      : 0
dining_tables   : 0
qr_tokens       : 0
orders          : 0
transactions    : 0
receipts        : 0
users           : 1
```

---

## 5. Current Repository State

Repo production hanya menyimpan:

```txt
.dockerignore
.env.example
.gitignore
Dockerfile
README.md
ROADMAP.md
docs/BACKUP_RESTORE.md
nodemon.json
package.json
package-lock.json
prisma.config.ts
prisma/
public/uploads/.gitkeep
public/uploads/menu-items/.gitkeep
scripts/backup-all.sh
scripts/backup-db.sh
scripts/backup-uploads.sh
scripts/restore-db.sh
scripts/restore-uploads.sh
src/
```

Repo production tidak menyimpan:

```txt
.env
node_modules/
backups/*.dump
backups/*.json
backups/*.tar.gz
public/uploads/menu-items/*.png
public/uploads/menu-items/*.jpg
public/uploads/menu-items/*.jpeg
public/uploads/menu-items/*.webp
test-results/
local review reports
development-only scripts
```

---

## 6. Next Roadmap

### 6.1 Before Push

Status: **In Progress**

Checklist:

- [x] Clean `.gitignore`.
- [x] Clean `.dockerignore`.
- [x] Remove local-only scripts from repo.
- [x] Remove runtime files from repo.
- [x] Validate Prisma schema.
- [x] Validate shell scripts.
- [x] Create README.md.
- [x] Create ROADMAP.md.
- [x] Update backup/restore documentation.
- [ ] Stage production files.
- [ ] Build Docker image.
- [ ] Commit.
- [ ] Push.

---

### 6.2 After Push

Status: **Next**

Checklist:

- [ ] Rotate database password.
- [ ] Rotate `JWT_SECRET`.
- [ ] Rotate `TOKEN_HASH_SECRET`.
- [ ] Update production environment variables.
- [ ] Run production migration with `npm run db:migrate:deploy`.
- [ ] Deploy backend.
- [ ] Verify `/api/health`.
- [ ] Verify login bootstrap owner.
- [ ] Generate initial dining tables from frontend.
- [ ] Generate QR tokens from frontend.
- [ ] Add categories and menu items from frontend.
- [ ] Create cashier account from frontend.
- [ ] Run end-to-end flow from QR scan to payment.

---

### 6.3 Frontend Integration Roadmap

Status: **Next**

Frontend perlu menyesuaikan contract API backend.

Prioritas integrasi:

1. Login owner/cashier.
2. Owner dashboard shell.
3. User management.
4. Table management.
5. QR token management.
6. Menu category management.
7. Menu item management.
8. Upload menu image.
9. Public QR validation page.
10. Public menu page.
11. Public cart/order submit.
12. Cashier order list.
13. Cashier order detail.
14. Accept/cancel order.
15. Payment form.
16. Receipt view/print.
17. Report page.
18. Audit log page.

---

### 6.4 Production Improvement Roadmap

Status: **Future**

Improvement yang dapat dilakukan setelah MVP stabil:

- Add API documentation with OpenAPI.
- Add automated integration test suite.
- Add rate limiting for auth and public endpoints.
- Add refresh token rotation.
- Add image storage integration with external object storage.
- Add structured logging.
- Add monitoring and alerting.
- Add scheduled backup automation.
- Add pagination standardization across all list endpoints.
- Add SSE or polling optimization for cashier order list.
- Add printer adapter integration for thermal printer.
- Add HTTPS reverse proxy deployment guide.
- Add admin bootstrap command that is safe for production.
- Add CI pipeline for syntax check, Prisma validate, and Docker build.

---

## 7. Definition of Done

Backend dianggap selesai untuk tahap ini jika:

- Source code backend modular dan readable.
- Database schema valid.
- Migration tersedia.
- API utama berjalan.
- Auth dan RBAC berjalan.
- Public self-order berjalan.
- Internal cashier flow berjalan.
- Owner management/report flow tersedia.
- Upload gambar menu tersedia.
- Backup/restore tersedia.
- Docker image berhasil build.
- `.env` dan runtime files tidak ikut Git.
- README dan roadmap tersedia.
- Backend siap menerima integrasi frontend.

---

## 8. Final Notes

Backend ini sudah disiapkan agar frontend dapat mulai dari kondisi data kosong.

Urutan input awal dari frontend:

1. Login sebagai owner.
2. Buat akun cashier.
3. Buat dining tables.
4. Generate QR token untuk meja.
5. Buat kategori menu.
6. Buat item menu.
7. Upload gambar menu jika diperlukan.
8. Jalankan flow public order.
9. Proses order di cashier.
10. Selesaikan payment dan receipt.

