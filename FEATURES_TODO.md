# Sinity Finance — Daftar Fitur (Todo / Roadmap)

Dokumen ini berisi fitur yang **sudah ada** dan fitur **yang bisa ditambah** untuk app catatan keuangan pribadi. Kode yang sudah ada **tidak diubah**; checklist dipakai sebagai panduan pengembangan ke depan.

---

## Sudah ada (tidak diubah)

- [x] Login & Register
- [x] Dashboard dengan ringkasan (Pemasukan, Pengeluaran, Tabungan, Dana Darurat, Wishlist)
- [x] Chart ringkasan (Pie) di dashboard
- [x] Halaman Pemasukkan — list, filter, tambah, kategori
- [x] Halaman Pengeluaran — list, filter, tambah, kategori
- [x] AI Assistant (chat + floating assistant)
- [x] Profile (tampil & edit form)
- [x] Settings (tema gelap/terang, color theme, notifikasi, privasi)
- [x] Sidebar + layout responsif (mobile sheet)
- [x] Proteksi route (harus login)
- [x] Integrasi backend (proxy ke sinity-finance-backend)

---

## Transaksi & catatan

- [x] **Filter tanggal** — pilih range tanggal (dari–sampai) di list pemasukkan/pengeluaran
- [x] **Pencarian transaksi** — cari berdasarkan catatan (note) atau kategori
- [x] **Edit transaksi** — ubah nominal, tanggal, catatan, kategori (dari list/detail)
- [x] **Hapus transaksi** — konfirmasi lalu hapus dari list
- [x] **Tag/label** — tag tambahan per transaksi (mis. #urgent, #reimbursement); disimpan di field note
- [x] **Modal input transaksi modern** — modal tambah/edit pemasukkan & pengeluaran sudah responsif lintas device, lebih simple, dan mengikuti tema aktif
- [x] **Formatter nominal otomatis** — input amount otomatis format ribuan/jutaan/miliar saat diketik, plus label pembacaan nominal
- [x] **Format tanggal Asia/Jakarta** — default tanggal transaksi dan formatter utama sudah dikunci ke Asia/Jakarta
- [x] **Date picker custom modern** — pemilih tanggal sudah memakai modal kalender custom yang lebih usable, theme-aware, dan bisa pilih tahun
- [x] **Relasi pemasukkan ke target** — transaksi pemasukkan sekarang bisa opsional dikaitkan ke target tabungan, default `Tanpa target`
- [ ] **Lampiran** — upload foto bukti (struk, kwitansi) per transaksi
- [ ] **Transaksi berulang** — definisi transaksi rutin (bulanan/mingguan) agar bisa diingatkan atau auto-suggest

---

## Budget & anggaran

- [x] **Budget per kategori** — set batas anggaran per kategori per bulan
- [x] **Progress budget** — tampil di dashboard/sidebar (mis. “Makan 80% dari Rp 2jt”)
- [x] **Peringatan budget** — notifikasi saat kategori mendekati/melewati budget
- [x] **Halaman Budget** — satu halaman untuk atur & lihat semua budget
- [x] **Mode budget bulanan / mingguan** — switcher periode di halaman Budget sudah aktif dan menghitung spend sesuai konteks periode
- [x] **Integrasi backend budget per scope** — API budget sekarang mendukung `monthly` dan `weekly` dengan persistence terpisah per kategori

---

## Rekening & dompet

- [ ] **(On hold)** Multi rekening / dompet
- [ ] **(On hold)** Saldo per rekening
- [ ] **(On hold)** Transfer antar rekening
- [ ] **(On hold)** Pilih rekening saat input pemasukkan/pengeluaran
  - Catatan keputusan (Maret 2026): area ini tidak jadi prioritas aktif produk untuk sekarang.
  - Catatan keputusan (Maret 2026): implementasi MVP lokal di frontend dibiarkan sebagai eksperimen internal, tetapi tidak dilanjutkan ke backend / payment flow.

---

## Laporan & analitik

- [x] **Laporan per periode** — pilih bulan/tahun, tampil total pemasukkan vs pengeluaran
- [x] **Grafik tren** — line/bar chart pemasukkan & pengeluaran per bulan
- [x] **Laporan per kategori** — breakdown per kategori (pie/bar) untuk periode tertentu
- [x] **Export data** — export list transaksi ke CSV atau PDF
- [x] **Perbandingan bulan** — bandingkan bulan ini vs bulan lalu

---

## Tabungan & target

- [x] **Target tabungan** — set target (nama + nominal + deadline)
- [x] **Progress target** — tampil progress (mis. “Laptop 60%”)
- [ ] **Dana darurat** — hitung & tampil rekomendasi (mis. 6x pengeluaran bulanan)
- [x] **Wishlist** — dari mock ke data nyata: list barang/harga, progress saving
- [x] **Integrasi backend goals / wishlist** — target tabungan dan wishlist sudah tersimpan lewat API backend

---

## Hutang & piutang

- [ ] **Catatan hutang** — siapa, nominal, jatuh tempo, status (lunas/belum)
- [ ] **Catatan piutang** — siapa, nominal, jatuh tempo
- [ ] **Pengingat jatuh tempo** — notifikasi sebelum/saat jatuh tempo
- [ ] **Pencatatan pelunasan** — tandai lunas, kurangi saldo hutang/piutang

---

## Pengingat & notifikasi

- [ ] **Pengingat tagihan rutin** — notifikasi bayar listrik, internet, dll. (sesuai jadwal)
- [x] **Notifikasi budget** — saat kategori mendekati/melewati batas
- [ ] **Ringkasan mingguan/bulanan** — email atau in-app summary (opsional)
- [x] **Preferensi notifikasi** — atur di Settings (email/push/SMS) — UI sudah ada, tinggal integrasi

---

## Keamanan & data

- [x] **Auth ke backend** — login/register pakai API backend, simpan token dengan aman
- [x] **Sync data** — pastikan data tersimpan di backend (bukan hanya localStorage)
- [ ] **Backup/restore** — export backup data atau restore dari file (opsional)
- [ ] **PIN / biometric** — kunci app di perangkat (opsional)

---

## UX & tambahan

- [x] **Dashboard pakai data asli** — chart & angka dari API, bukan data mock
- [x] **Dashboard interaktif modern** — dashboard sudah dirombak jadi lebih simple, informatif, theme-aware, responsif, dan card utama bisa langsung navigasi ke halaman terkait
- [x] **Simpan profil ke backend** — form Profile tersimpan di server
- [x] **Simpan preferensi Settings ke backend** — tema, notifikasi, privasi persist
- [x] **Polish UX transaksi** — flow input transaksi dipangkas agar lebih ringan, rapi, dan nyaman dipakai di desktop/mobile
- [x] **Polish UI rekening** — header rekening disederhanakan, lebih relevan, dan lebih nyaman dibaca
- [ ] **Multi-mata uang** — pilih mata uang (IDR/USD) per rekening atau transaksi (opsional)
- [ ] **Split transaksi** — satu transaksi dibagi ke beberapa kategori (opsional)
- [ ] **Onboarding** — tour singkat untuk pengguna baru (opsional)
- [ ] **PWA** — install sebagai app di HP (opsional)

---

## Cara pakai

- Centang `[ ]` → `[x]` saat fitur sudah selesai.
- Bisa menambah item baru di bawah tiap section.
- Prioritas bisa ditandai dengan label, mis. `[ ] **(P0)** Filter tanggal`.

---

*Terakhir diperbarui: 23 Maret 2026*

---

## Status sekarang

- Fokus aktif produk saat ini paling matang ada di `transaksi + budget + reports + goals + profile/settings backend sync`.
- Area `budget` sekarang sudah masuk fase lebih matang: UI lebih simple, support switcher `bulanan / mingguan`, dan kontrak backend untuk dua scope sudah siap.
- Area `rekening / transfer` tetap ada di UI, tapi masih `on hold` untuk pengembangan lanjut.
- Area `target tabungan / wishlist` sekarang sudah punya halaman khusus, integrasi backend, ringkasan dashboard, dan bisa menerima alokasi dari pemasukkan.
- Area `dashboard` sekarang sudah masuk fase polish UX: lebih interaktif, navigable, dan visualnya lebih konsisten lintas device.
- Next yang paling masuk akal setelah ini adalah `hutang & piutang`, lalu `lampiran` atau `transaksi berulang`.

---

## Prioritas rekomendasi (langsung eksekusi)

### P0 - Fondasi wajib (Sprint 1)

- [x] **(P0) Auth ke backend** - login/register pakai API backend, simpan token dengan aman
- [x] **(P0) Sync data** - pastikan data tersimpan di backend (bukan hanya localStorage)
- [x] **(P0) Dashboard pakai data asli** - chart & angka dari API, bukan data mock
- [x] **(P0) Dashboard interaktif modern** - dashboard lebih simple, responsif, dan menjadi shortcut ke halaman penting
- [x] **(P0) Budget per kategori** - set batas anggaran per kategori per bulan
- [x] **(P0) Progress budget** - tampil di dashboard/sidebar (mis. "Makan 80% dari Rp 2jt")
- [x] **(P0) Peringatan budget** - notifikasi saat kategori mendekati/melewati budget
- [x] **(P0) Halaman Budget** - satu halaman untuk atur & lihat semua budget
- [x] **(P0) Mode budget bulanan / mingguan** - switcher periode sudah aktif di UI dan persistence budget dipisah per scope
- [x] **(P0) Integrasi backend budget per scope** - API budget mendukung `monthly` dan `weekly`
- [x] **(P0) Laporan per periode** - pilih bulan/tahun, tampil total pemasukkan vs pengeluaran
- [x] **(P0) Grafik tren** - line/bar chart pemasukkan & pengeluaran per bulan
- [x] **(P0) Laporan per kategori** - breakdown per kategori (pie/bar) untuk periode tertentu
- [x] **(P0) Export data** - export list transaksi ke CSV atau PDF

### P1 - Nilai tinggi setelah fondasi (Sprint 2)

- [x] **(P1) Target tabungan** - set target (nama + nominal + deadline)
- [x] **(P1) Progress target** - tampil progress (mis. "Laptop 60%")
- [ ] **(P1) Dana darurat** - hitung & tampil rekomendasi (mis. 6x pengeluaran bulanan)
- [x] **(P1) Wishlist** - dari mock ke data nyata: list barang/harga, progress saving
- [x] **(P1) Integrasi backend goals / wishlist** - target tabungan dan wishlist sudah persist ke backend
- [x] **(P1) Relasi pemasukkan ke target** - pemasukkan bisa opsional dialokasikan ke target tabungan
- [ ] **(P1) Catatan hutang** - siapa, nominal, jatuh tempo, status (lunas/belum)
- [ ] **(P1) Catatan piutang** - siapa, nominal, jatuh tempo
- [ ] **(P1) Pencatatan pelunasan** - tandai lunas, kurangi saldo hutang/piutang
- [ ] **(P1) Pengingat jatuh tempo** - notifikasi sebelum/saat jatuh tempo
- [ ] **(P1) Pengingat tagihan rutin** - notifikasi bayar listrik, internet, dll. (sesuai jadwal)
- [ ] **(P1) Ringkasan mingguan/bulanan** - email atau in-app summary (opsional)
- [x] **(P1) Simpan profil ke backend** - form Profile tersimpan di server
- [x] **(P1) Simpan preferensi Settings ke backend** - tema, notifikasi, privasi persist

### Backlog ditunda

- [ ] **(Hold) Multi rekening** - cash, bank A, e-wallet, dll.
- [ ] **(Hold) Saldo per rekening** - tampil di dashboard atau sidebar
- [ ] **(Hold) Transfer antar rekening** - tidak dilanjutkan ke payment flow untuk saat ini
- [ ] **(Hold) Pilih rekening** saat input pemasukkan/pengeluaran

### P2 - Nice-to-have / opsional (Sprint 3+)

- [ ] **(P2) Lampiran** - upload foto bukti (struk, kwitansi) per transaksi
- [ ] **(P2) Transaksi berulang** - definisi transaksi rutin (bulanan/mingguan) agar bisa diingatkan atau auto-suggest
- [x] **(P2) Perbandingan bulan** - bandingkan bulan ini vs bulan lalu
- [x] **(P2) Notifikasi budget** - saat kategori mendekati/melewati batas
- [x] **(P2) Preferensi notifikasi** - atur di Settings (email/push/SMS) - UI sudah ada, tinggal integrasi
- [ ] **(P2) Backup/restore** - export backup data atau restore dari file (opsional)
- [ ] **(P2) PIN / biometric** - kunci app di perangkat (opsional)
- [ ] **(P2) Multi-mata uang** - pilih mata uang (IDR/USD) per rekening atau transaksi (opsional)
- [ ] **(P2) Split transaksi** - satu transaksi dibagi ke beberapa kategori (opsional)
- [ ] **(P2) Onboarding** - tour singkat untuk pengguna baru (opsional)
- [ ] **(P2) PWA** - install sebagai app di HP (opsional)



