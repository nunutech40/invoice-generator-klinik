# 🏥 Klinik App — Architecture & Design Documentation

> **Last updated:** 2026-03-09
> **Status:** MVP Live (local dev)
> **Product:** Invoice & Kwitansi Generator untuk Dokter Praktek Mandiri

---

## 1. Kenapa Produk Ini Ada

### Market Research Summary

Dari riset yang dilakukan (lihat `.agent/outputs/research/high-income-google-product.md`), segmen yang paling viable untuk produk SEO-only landing page adalah:

- **Profil:** Dokter praktek mandiri, 35–54 tahun, income tinggi
- **Behavior:** Google-first searcher, tidak aktif di TikTok untuk keputusan bisnis
- **Pain points utama:**
  - Kwitansi manual tidak rapi, mudah hilang
  - Excel terlalu kompleks dan inconsistent tiap invoice
  - Tidak ada rekap pendapatan otomatis
  - Profil klinik harus diisi ulang tiap buat kwitansi baru
- **Willingness to pay:** Tinggi — dokter tidak sensitif harga untuk solusi yang terbukti hemat waktu
- **SEO keyword target:** `"invoice klinik dokter"`, `"kwitansi pasien dokter"`, `"billing dokter praktek mandiri"` — kompetisi hampir nol

### Alasan Pilih Invoice Generator (bukan kalkulator fee, dll)

| Kriteria | Invoice Generator | Kalkulator Fee | Ebook/Template |
|---|---|---|---|
| Recurring need | ✅ Tiap hari ada pasien | ❌ Pakai sekali | ❌ Pakai sekali |
| Subscription logic | ✅ Masuk akal | ❌ Gak worth | ❌ One-time buy |
| Build complexity | ✅ Sedang | ✅ Mudah | ✅ Mudah |
| Revenue potential | ✅ Tinggi | ❌ Rendah | ❌ Rendah |

---

## 2. Posisi di Monorepo SAINS

```
SAINS/
├── api/          ← Go backend — SHARED (tidak dimodifikasi untuk klinik)
├── atomic/       ← 3D Periodic Table App
├── klinik/       ← ⭐ Invoice Generator for Dokter (ini)
├── landing/
│   ├── student-kimia-v1/   ← Atomic landing page
│   └── klinik-v1/          ← Klinik landing page (SEO)
└── ...
```

Klinik adalah **product kedua** di platform SAINS, setara dengan atomic. Menggunakan seluruh infrastruktur backend yang sama tanpa modifikasi apapun di API.

---

## 3. Architecture Overview

### Tech Stack

| Layer | Tech | Alasan |
|---|---|---|
| Frontend | TypeScript + Vite | Sama dengan atomic — zero learning curve |
| Styling | Vanilla CSS | Kontrol penuh, dark theme profesional |
| Router | Hash-based SPA | Copy dari atomic — simple, no dep |
| Auth | SAINS API (/api/auth/*) | Shared backend, zero cost |
| Payment | Midtrans via SAINS API (/api/checkout) | Sudah ada dan berjalan |
| Storage (invoice) | localStorage | MVP — lihat MVP Decisions di bawah |
| Build | Vite | Fast build, TypeScript kompiler |

### Data Flow

```
User buka /klinik/ (localhost:5173 atau subdomain)
        │
        ▼
main.ts → initAuth()
        │
        ├── Token tidak ada / expired → AuthGate (Login/Register)
        │       └── POST /api/auth/login atau /api/auth/register
        │               └── Success → bootApp()
        │
        └── Token valid → bootApp()
                │
                ▼
        checkAccess() → GET /api/access-check?product=klinik
                │
                ├── Granted = false → PricingPage
                │       └── Fetch GET /api/plans?product=klinik
                │               └── Select plan → POST /api/checkout → Midtrans redirect
                │                       └── Webhook /api/midtrans/webhook → activate subscription
                │
                └── Granted = true (atau role=admin) → Dashboard
                        ├── getAllInvoices() ← localStorage
                        ├── Buat Invoice → InvoiceForm.ts
                        │       └── saveInvoice() → localStorage
                        │               └── renderInvoicePreview() → window.print()
                        └── CRUD invoice (preview, edit, delete)
```

---

## 4. File Structure

```
klinik/
├── index.html              ← Entry HTML + SEO meta + JSON-LD
├── package.json            ← Vite + TypeScript + jsPDF
├── tsconfig.json           ← TypeScript config (strict mode)
│
├── src/
│   ├── main.ts             ← Boot flow (auth → access → dashboard)
│   │
│   ├── core/
│   │   ├── auth.ts         ← Auth service (login, register, logout, checkAccess)
│   │   │                     Token storage: 'klinik_access_token' di localStorage
│   │   │                     User storage: 'klinik_user' di localStorage
│   │   ├── config.ts       ← API base URL + product name ('klinik')
│   │   ├── router.ts       ← Hash-based SPA router (#/route)
│   │   └── storage.ts      ← Invoice types + localStorage CRUD
│   │                         Doctor profile: 'klinik_doctor_profile'
│   │                         Invoices: 'klinik_invoices'
│   │
│   ├── components/
│   │   ├── AuthGate.ts     ← Login + Register (subscriber only, no guest)
│   │   ├── PricingPage.ts  ← Fetch /api/plans, select plan, checkout
│   │   ├── Dashboard.ts    ← Stats cards + invoice table CRUD
│   │   ├── InvoiceForm.ts  ← Form input pasien + layanan multi-row
│   │   ├── InvoicePreview.ts ← Modal preview print-ready, window.print()
│   │   └── Nav.ts          ← Sticky nav + user badge + logout
│   │
│   └── styles/
│       └── global.css      ← Design tokens + semua styles
│
└── docs/
    └── ARCHITECTURE.md     ← File ini
```

---

## 5. Core Modules

### `core/auth.ts`

Diadaptasi dari `atomic/src/core/auth.ts`. Perbedaan utama:
- **Storage keys berbeda:** `klinik_access_token` (bukan `atomic_access_token`) — penting agar session tidak konflik antar app
- **Tidak ada guest mode** — klinik hanya untuk subscriber berbayar
- `checkAccess()` memanggil `GET /api/access-check?product=klinik`

### `core/storage.ts`

Semua data invoice disimpan di `localStorage` dengan keys:
- `klinik_invoices` — array of Invoice objects
- `klinik_doctor_profile` — DoctorProfile object (auto-fill form)

**Kenapa localStorage?** → Lihat MVP Decisions di bawah.

### `core/config.ts`

```typescript
export const config = {
  product: 'klinik',        // dipakai untuk /api/plans?product=klinik dan /api/access-check?product=klinik
  apiBase: 'https://sains-atomic.web.id',  // prod; ganti ke localhost:8080 untuk dev dengan local API
} as const;
```

---

## 6. Integrasi API SAINS

**Zero backend changes diperlukan.** API SAINS sudah support multi-product by design.

| Endpoint | Usage di Klinik |
|---|---|
| `POST /api/auth/register` | Register dokter baru |
| `POST /api/auth/login` | Login dokter |
| `GET /api/auth/me` | Validate token + get user |
| `POST /api/auth/logout` | Logout |
| `GET /api/plans?product=klinik` | Fetch pricing plans untuk klinik |
| `POST /api/checkout` | Buat transaksi Midtrans |
| `GET /api/access-check?product=klinik` | Cek apakah user punya subscription aktif |
| `POST /api/midtrans/webhook` | Aktivasi subscription setelah bayar (sudah ada) |

### Setup Product di Admin Panel (one-time)

1. Buka `/admin/products` → Tambah: Name=`Klinik`, Slug=`klinik`
2. Buka `/admin/pricing` → Tambah plan:
   - Product: `klinik`
   - Segment: `global`
   - Duration: `monthly` / `yearly`
   - Price: `99000` / `699000`

---

## 7. MVP Decisions

### Keputusan 1: Invoice disimpan di localStorage (bukan database)

**Keputusan:** Invoice data disimpan di `localStorage` browser, bukan di server per-user.

**Alasan:**
- Validasi demand dulu sebelum invest di backend
- Membangun backend invoice storage butuh: migration DB, endpoint baru, security audit
- Kalau tidak ada paying user → wasted effort
- localStorage cukup untuk validasi UX dan market fit

**Konsekuensi yang harus dipahami:**
- ❌ Invoice hilang kalau clear browser storage
- ❌ Invoice tidak sync lintas device atau browser
- ✅ Auth dan subscription tetap real dan per-user

**Next step jika ada demand:** Buat tabel `invoices` di DB, endpoint `POST/GET /api/invoices`, sync dari localStorage ke server.

### Keputusan 2: Tidak ada guest mode

**Keputusan:** Tidak implement guest login (kode OTP) seperti di atomic.

**Alasan:**
- Target market adalah profesional dewasa yang butuh akun permanen
- Invoice data harus persistent — guest mode tidak cocok
- Simplifies flow

### Keputusan 3: Satu produk dulu (dokter), expand kemudian

**Keputusan:** Target hanya dokter praktek mandiri untuk MVP.

**Alasan:**
- Validasi satu niche dulu sebelum expand
- Copy dan keyword SEO bisa sangat spesifik = konversi lebih tinggi
- Expand ke bidan, fisioterapis, dll setelah demand terbukti

---

## 8. Development Guide

### Jalankan Lokal

```bash
# App klinik (pakai prod API langsung)
cd klinik
npm install
npm run dev
# → http://localhost:5173

# Build untuk production
npm run build
# → dist/ siap untuk di-upload ke VPS
```

### Environment

Saat ini `config.ts` hardcode ke prod API (`https://sains-atomic.web.id`). Untuk local dev dengan API lokal:

```typescript
// Ubah config.ts sementara:
apiBase: 'http://localhost:8080'
// Ingat untuk revert sebelum commit
```

### CORS Dev Note

Production API hanya allow origin tertentu. Untuk dev dari localhost, `localhost:5173` sudah ditambahkan ke `CORS_ORIGINS` di `.env` VPS. Tidak perlu lakukan apa-apa lagi.

---

## 9. Deployment (Next Step)

Belum di-deploy. Ikut pola atomic:

```bash
# 1. Build
cd klinik && npm run build

# 2. Upload ke VPS (folder baru)
scp -r dist/* nunuadmin@103.181.143.73:/home/nunuadmin/sains-klinik-app/

# 3. Tambah Nginx config untuk subdomain klinik.sains-atomic.web.id
# 4. Tambah DNS record di Cloudflare (A record: klinik → 103.181.143.73)
```

---

## 10. Risks & Edge Cases

| Risk | Status | Mitigation |
|---|---|---|
| Invoice hilang (localStorage) | Known, by design | User perlu tahu saat onboarding |
| CORS issue saat dev | Fixed | localhost:5173 sudah di-whitelist di VPS |
| Scroll/clear browser = data hilang | Known, MVP limitation | Dokumentasikan untuk user |
| Product 'klinik' belum ada di DB | ❌ Belum setup | Harus tambah via admin panel sebelum launch |
| config.ts hardcode ke prod | Dev only | Jangan commit ke prod tanpa revert |

---

## 📋 Changelog

| Versi | Tanggal | Perubahan |
|---|---|---|
| v1 | 2026-03-09 | Initial MVP — auth, invoice CRUD, print, landing page |
