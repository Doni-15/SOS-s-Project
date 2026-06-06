# Backup & Restore

Dokumentasi ini menjelaskan cara melakukan backup dan restore untuk backend **Self-Order System Management**.

Backup dibagi menjadi dua bagian:

1. Database PostgreSQL.
2. Uploaded files di `public/uploads`.

Database hanya menyimpan metadata dan `imageUrl`. File gambar fisik tetap harus dibackup dari folder upload.

---

## 1. File dan Script Terkait

Script yang tersedia:

| Script | Fungsi |
|---|---|
| `scripts/backup-db.sh` | Backup database PostgreSQL |
| `scripts/backup-uploads.sh` | Backup folder upload |
| `scripts/backup-all.sh` | Backup database dan upload sekaligus |
| `scripts/restore-db.sh` | Restore database dari dump |
| `scripts/restore-uploads.sh` | Restore uploaded files dari arsip |

NPM command:

| Command | Fungsi |
|---|---|
| `npm run db:backup` | Backup database |
| `npm run uploads:backup` | Backup uploaded files |
| `npm run backup:all` | Backup database dan uploaded files |
| `npm run db:restore -- <file.dump>` | Restore database |
| `npm run uploads:restore -- <file.tar.gz>` | Restore uploaded files |

---

## 2. Backup Database

Jalankan:

```bash
npm run db:backup
```

Output:

```txt
backups/sos-db-YYYYMMDD-HHMMSS.dump
backups/sos-db-YYYYMMDD-HHMMSS.dump.json
```

File `.dump` adalah backup database format custom dari `pg_dump`.

File `.json` adalah metadata backup yang berisi informasi seperti ukuran file dan checksum.

---

## 3. Backup Uploaded Files

Jalankan:

```bash
npm run uploads:backup
```

Output:

```txt
backups/sos-uploads-YYYYMMDD-HHMMSS.tar.gz
backups/sos-uploads-YYYYMMDD-HHMMSS.tar.gz.json
```

File `.tar.gz` berisi arsip folder upload.

File `.json` adalah metadata backup.

---

## 4. Full Backup

Jalankan:

```bash
npm run backup:all
```

Command ini menjalankan:

1. Backup database.
2. Backup uploaded files.

Output sukses yang diharapkan:

```txt
Database backup completed
Uploads backup completed
Full backup completed
```

---

## 5. Restore Database

PERINGATAN:

Restore database bersifat destructive. Data lama pada target database dapat tertimpa.

Sebelum restore:

1. Pastikan file dump benar.
2. Pastikan target database benar.
3. Pastikan sudah ada backup terbaru.
4. Jangan restore ke production tanpa konfirmasi tim.

Command:

```bash
npm run db:restore -- backups/sos-db-YYYYMMDD-HHMMSS.dump
```

Script akan meminta konfirmasi:

```txt
RESTORE
```

Ketik tepat:

```txt
RESTORE
```

untuk melanjutkan.

---

## 6. Restore Uploaded Files

PERINGATAN:

Restore upload dapat menimpa isi folder upload target.

Command:

```bash
npm run uploads:restore -- backups/sos-uploads-YYYYMMDD-HHMMSS.tar.gz
```

Script akan meminta konfirmasi:

```txt
RESTORE_UPLOADS
```

Ketik tepat:

```txt
RESTORE_UPLOADS
```

untuk melanjutkan.

---

## 7. Docker Upload Volume

Saat menjalankan backend dengan Docker, gunakan volume agar uploaded files tidak hilang ketika container diganti.

Contoh:

```bash
docker run --rm \
  --name sos-backend \
  --network=host \
  --env-file .env \
  -e NODE_ENV=production \
  -v "$(pwd)/public/uploads:/app/public/uploads" \
  sos-backend:prod
```

Bagian penting:

```bash
-v "$(pwd)/public/uploads:/app/public/uploads"
```

Tanpa volume atau persistent storage, file upload dapat hilang saat container dibuat ulang.

---

## 8. Git Ignore Policy

File backup tidak boleh masuk Git.

Rules penting:

```gitignore
backups/*
!backups/.gitkeep

public/uploads/*
!public/uploads/.gitkeep
!public/uploads/menu-items/
public/uploads/menu-items/*
!public/uploads/menu-items/.gitkeep
```

Yang boleh masuk Git:

```txt
backups/.gitkeep
public/uploads/.gitkeep
public/uploads/menu-items/.gitkeep
```

Yang tidak boleh masuk Git:

```txt
backups/*.dump
backups/*.json
backups/*.tar.gz
public/uploads/menu-items/*.png
public/uploads/menu-items/*.jpg
public/uploads/menu-items/*.jpeg
public/uploads/menu-items/*.webp
```

---

## 9. Backup Storage Recommendation

Untuk production, backup sebaiknya tidak hanya disimpan di folder project.

Rekomendasi:

1. Simpan backup di storage terpisah.
2. Gunakan nama file dengan timestamp.
3. Simpan metadata checksum.
4. Batasi akses ke file backup.
5. Jangan upload backup ke repository publik.
6. Lakukan restore verification secara berkala di environment terpisah.

---

## 10. Production Backup Checklist

Sebelum deploy besar:

- [ ] Jalankan `npm run backup:all`.
- [ ] Pastikan file dump database terbentuk.
- [ ] Pastikan file upload archive terbentuk.
- [ ] Pastikan metadata JSON terbentuk.
- [ ] Pastikan backup dipindah ke lokasi aman.
- [ ] Pastikan backup tidak masuk Git.
- [ ] Pastikan `.env` tidak masuk Git.

---

## 11. Restore Checklist

Sebelum restore:

- [ ] Pastikan target database benar.
- [ ] Pastikan file backup benar.
- [ ] Pastikan backup terbaru tersedia.
- [ ] Pastikan user/operator memahami restore bersifat destructive.
- [ ] Pastikan aplikasi boleh mengalami downtime jika restore dilakukan di production.

Setelah restore:

- [ ] Cek aplikasi dapat start.
- [ ] Cek `/api/health`.
- [ ] Cek login internal.
- [ ] Cek data utama.
- [ ] Cek file upload dapat diakses.
- [ ] Cek log error backend.

