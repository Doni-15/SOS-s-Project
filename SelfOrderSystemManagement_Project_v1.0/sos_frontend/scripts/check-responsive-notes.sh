#!/usr/bin/env bash
set -Eeuo pipefail

cat <<'NOTES'
Responsive manual checklist:

1. Mobile small: 360 x 640
   - Login card tidak kepotong
   - Logo tidak terlalu besar
   - Form masih terlihat sebelum scroll panjang
   - Button login full width dan rapi

2. Mobile medium: 390 x 844
   - Security note tampil rapi
   - Tidak ada horizontal scroll

3. Tablet: 768 x 1024
   - Form center
   - Card tidak terlalu melebar
   - Tidak ada area kosong berlebihan

4. Desktop: 1366 x 768
   - Panel kiri tampil
   - Form kanan seimbang
   - Ilustrasi tidak menabrak text

5. Desktop large: 1920 x 1080
   - Layout tetap max-width, tidak melebar liar
NOTES
