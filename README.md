This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Changing the Port

By default, Next.js runs on port **3000** (industry standard). To use a different port:

**Option 1: Using .env file (recommended)**
1. Edit file `.env` di root project
2. Ubah nilai `PORT=3000` menjadi port yang diinginkan, contoh:
   ```env
   PORT=3001
   ```
3. Restart development server dengan `npm run dev`

**Option 2: Using command line flag**
```bash
npm run dev -- -p 3001
# or
next dev --turbopack -p 3001
```

**Option 3: Using environment variable (temporary)**
```bash
# Windows (PowerShell)
$env:PORT=3001; npm run dev

# Windows (CMD)
set PORT=3001 && npm run dev

# Linux/Mac
PORT=3001 npm run dev
```

**Common Port Standards:**
- **3000** - Next.js default (recommended)
- **3001** - Alternative development port
- **8080** - Common web server port
- **5173** - Vite default (if migrating from Vite)

**Note:** File `.env` sudah di-ignore oleh git untuk keamanan. Gunakan `.env.example` sebagai template.

### Backend (Sinity Finance API)

Halaman Pemasukkan/Pengeluaran memanggil **sinity-finance-backend** lewat proxy (same-origin). Agar data bisa dimuat:

1. **Jalankan backend** dari folder `sinity-finance-backend` (port **8080**):
   ```bash
   cd path/ke/sinity-finance-backend
   go run .
   # atau: make run
   ```
2. Di **sinity-finance-app** pastikan `.env` berisi:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8080
   ```
   (atau `http://localhost:8080`). Restart `npm run dev` setelah mengubah `.env`.
3. Jika muncul "Backend tidak merespons...", cek: backend sudah jalan di 8080 dan database (PostgreSQL) sudah siap.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
