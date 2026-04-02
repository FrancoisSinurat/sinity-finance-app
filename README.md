# Sinity Finance App

Frontend Next.js untuk Sinity Finance yang sekarang sudah disiapkan untuk:

- static export
- PWA installable
- wrapper mobile via Capacitor

## Jalankan Local

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Environment

Salin `.env.example` ke `.env`, lalu isi minimal:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8080
NEXT_PUBLIC_AUTH_API_BASE_URL=http://127.0.0.1:8080
```

Optional:

```env
NEXT_PUBLIC_CHAT_API_URL=https://your-backend.example.com/api/v1/chat
NEXT_PUBLIC_AUTH_MOCK_ON_BACKEND_ERROR=true
```

Catatan:

- frontend sekarang **langsung** memanggil backend publik, tidak lagi lewat Next API proxy
- AI Assistant butuh endpoint backend publik sendiri; kalau `NEXT_PUBLIC_CHAT_API_URL` kosong, UI assistant tetap muncul tapi mode kirim pesan dinonaktifkan

## Build Web / PWA

```bash
npm run build
```

Hasil static export ada di folder `out/`.

App sudah punya:

- `manifest.webmanifest`
- service worker `public/sw.js`
- offline fallback `public/offline.html`
- icon PWA dasar

## Capacitor

Config Capacitor ada di `capacitor.config.ts` dengan `webDir: "out"`.

Workflow dasar:

```bash
npm run build
npm run cap:add:android
npm run cap:sync
npm run cap:open:android
```

Untuk iOS:

```bash
npm run build
npm run cap:add:ios
npm run cap:sync
npm run cap:open:ios
```

Catatan:

- `npx cap add android` dan `npx cap add ios` butuh environment native masing-masing
- backend API harus bisa diakses device, jadi jangan pakai `localhost` saat testing di HP fisik

## Arsitektur Sekarang

- halaman Next di-export statis lewat `output: "export"`
- auth dan data utama call backend publik lewat `NEXT_PUBLIC_API_BASE_URL`
- auth endpoint bisa dipisah lewat `NEXT_PUBLIC_AUTH_API_BASE_URL`
- assistant call endpoint publik lewat `NEXT_PUBLIC_CHAT_API_URL`

## Rekomendasi Lanjut

- siapkan domain backend production dengan HTTPS
- tambahkan icon PNG khusus iOS/Android kalau mau hasil install lebih rapi
- tambahkan plugin Capacitor sesuai kebutuhan, misalnya splash screen, status bar, push notification, atau haptics
