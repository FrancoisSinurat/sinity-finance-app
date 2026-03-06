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
- [ ] **Lampiran** — upload foto bukti (struk, kwitansi) per transaksi
- [ ] **Transaksi berulang** — definisi transaksi rutin (bulanan/mingguan) agar bisa diingatkan atau auto-suggest

---

## Budget & anggaran

- [ ] **Budget per kategori** — set batas anggaran per kategori per bulan
- [ ] **Progress budget** — tampil di dashboard/sidebar (mis. “Makan 80% dari Rp 2jt”)
- [ ] **Peringatan budget** — notifikasi saat kategori mendekati/melewati budget
- [ ] **Halaman Budget** — satu halaman untuk atur & lihat semua budget

---

## Rekening & dompet

- [ ] **Multi rekening** — cash, bank A, e-wallet, dll.
- [ ] **Saldo per rekening** — tampil di dashboard atau sidebar
- [ ] **Transfer antar rekening** — catatan transfer (keluar dari A, masuk ke B) tanpa mengubah total kekayaan
- [ ] **Pilih rekening** saat input pemasukkan/pengeluaran

---

## Laporan & analitik

- [ ] **Laporan per periode** — pilih bulan/tahun, tampil total pemasukkan vs pengeluaran
- [ ] **Grafik tren** — line/bar chart pemasukkan & pengeluaran per bulan
- [ ] **Laporan per kategori** — breakdown per kategori (pie/bar) untuk periode tertentu
- [ ] **Export data** — export list transaksi ke CSV atau PDF
- [ ] **Perbandingan bulan** — bandingkan bulan ini vs bulan lalu

---

## Tabungan & target

- [ ] **Target tabungan** — set target (nama + nominal + deadline)
- [ ] **Progress target** — tampil progress (mis. “Laptop 60%”)
- [ ] **Dana darurat** — hitung & tampil rekomendasi (mis. 6x pengeluaran bulanan)
- [ ] **Wishlist** — dari mock ke data nyata: list barang/harga, progress saving

---

## Hutang & piutang

- [ ] **Catatan hutang** — siapa, nominal, jatuh tempo, status (lunas/belum)
- [ ] **Catatan piutang** — siapa, nominal, jatuh tempo
- [ ] **Pengingat jatuh tempo** — notifikasi sebelum/saat jatuh tempo
- [ ] **Pencatatan pelunasan** — tandai lunas, kurangi saldo hutang/piutang

---

## Pengingat & notifikasi

- [ ] **Pengingat tagihan rutin** — notifikasi bayar listrik, internet, dll. (sesuai jadwal)
- [ ] **Notifikasi budget** — saat kategori mendekati/melewati batas
- [ ] **Ringkasan mingguan/bulanan** — email atau in-app summary (opsional)
- [ ] **Preferensi notifikasi** — atur di Settings (email/push/SMS) — UI sudah ada, tinggal integrasi

---

## Keamanan & data

- [ ] **Auth ke backend** — login/register pakai API backend, simpan token dengan aman
- [ ] **Sync data** — pastikan data tersimpan di backend (bukan hanya localStorage)
- [ ] **Backup/restore** — export backup data atau restore dari file (opsional)
- [ ] **PIN / biometric** — kunci app di perangkat (opsional)

---

## UX & tambahan

- [ ] **Dashboard pakai data asli** — chart & angka dari API, bukan data mock
- [ ] **Simpan profil ke backend** — form Profile tersimpan di server
- [ ] **Simpan preferensi Settings ke backend** — tema, notifikasi, privasi persist
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

*Terakhir diperbarui: Maret 2025*
