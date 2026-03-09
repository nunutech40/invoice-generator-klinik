---
topic: Klinik App — Context & Architecture
date: 2026-03-09
version: 1
status: completed
related_files:
  - klinik/src/main.ts
  - klinik/src/core/auth.ts
  - klinik/src/core/storage.ts
  - klinik/src/core/config.ts
  - klinik/src/core/router.ts
  - klinik/src/components/AuthGate.ts
  - klinik/src/components/PricingPage.ts
  - klinik/src/components/InvoiceForm.ts
  - klinik/src/components/InvoicePreview.ts
  - klinik/src/components/Dashboard.ts
  - klinik/src/components/Nav.ts
  - klinik/src/styles/global.css
  - klinik/docs/ARCHITECTURE.md
  - klinik/README.md
  - landing/klinik-v1/index.html
---

# Research: Klinik App

## Summary

Klinik App adalah sub-project #2 di monorepo SAINS — invoice & kwitansi generator untuk dokter praktek mandiri. Dibangun dengan TypeScript + Vite (pola identik dengan atomic/), menggunakan SAINS API yang sama tanpa perubahan backend apapun. MVP menyimpan invoice di localStorage untuk validasi demand sebelum investasi backend.

## File yang Relevan

### Core Modules (jangan edit sembarangan)
- `klinik/src/core/auth.ts` — Auth service. localStorage keys: `klinik_access_token`, `klinik_user`. Tidak ada guest mode.
- `klinik/src/core/config.ts` — `product: 'klinik'`, `apiBase`. Hardcode ke prod saat ini.
- `klinik/src/core/router.ts` — Hash-based SPA router. Pola identik dengan atomic.
- `klinik/src/core/storage.ts` — Invoice types + localStorage CRUD. Keys: `klinik_invoices`, `klinik_doctor_profile`.

### Components (tambah fitur di sini)
- `klinik/src/components/InvoiceForm.ts` — Core feature. Form input pasien + layanan multi-row. Auto-save doctor profile.
- `klinik/src/components/InvoicePreview.ts` — Print-ready invoice modal. Pakai `window.print()`.
- `klinik/src/components/Dashboard.ts` — Stats cards + tabel riwayat invoice.
- `klinik/src/components/AuthGate.ts` — Login (tab Masuk) + Register (tab Daftar).
- `klinik/src/components/PricingPage.ts` — Fetch plans + Midtrans checkout.

### Styles
- `klinik/src/styles/global.css` — Semua design tokens + component styles. Dark theme.

### Entry + Config
- `klinik/src/main.ts` — Boot flow: `initAuth → checkAccess → bootApp/PricingPage/AuthGate`
- `klinik/index.html` — SEO meta, JSON-LD, fonts
- `klinik/package.json` — Vite, TypeScript, jsPDF

### Landing Page
- `landing/klinik-v1/index.html` — Static HTML SEO-ready (tidak pakai Vite)

### Documentation
- `klinik/docs/ARCHITECTURE.md` — **BACA INI DULU** sebelum edit apapun di klinik/

## Architecture / Data Flow

```
initAuth() [main.ts]
    │
    ├── Belum login → AuthGate → POST /api/auth/login atau /register
    │
    └── Sudah login → checkAccess() → GET /api/access-check?product=klinik
            │
            ├── No access → PricingPage → GET /api/plans?product=klinik
            │                   └── Checkout → POST /api/checkout → Midtrans
            │
            └── Has access (atau admin) → Dashboard
                    ├── getAllInvoices() ← localStorage
                    ├── InvoiceForm → saveInvoice() → localStorage
                    └── InvoicePreview → window.print()
```

## Existing Patterns

1. **Auth pattern:** Identik 100% dengan atomic. Token di localStorage. `checkAccess()` pakai `product` dari `config.ts`.
2. **Component pattern:** Function yang menerima `container: HTMLElement`. Render innerHTML string + wire events.
3. **Storage pattern:** Key prefix `klinik_` untuk semua localStorage keys (menghindari clash dengan atomic).
4. **No global state:** State lokal per component. Tidak ada state manager.

## Keputusan & Alasan

- **localStorage untuk invoice (bukan DB):** Validasi demand dulu. Backend invoice storage bisa ditambah nanti jika ada paying users.
- **Tidak ada guest mode:** Target market (dokter) butuh akun permanen. Guest mode tidak sesuai.
- **Dokter dulu, expand kemudian:** Niche spesifik = SEO keyword lebih spesifik = konversi lebih tinggi.
- **Zero backend changes:** API SAINS sudah multi-product by design. Cukup tambah product + plan via admin panel.
- **Dark theme:** Profesional, beda dari kompetitor free yang pakai white/generic.

## Risks & Edge Cases

- Invoice hilang jika user clear localStorage atau ganti device (by design, MVP limitation)
- Product 'klinik' belum ada di DB — harus tambah via admin panel sebelum subscribe bisa jalan
- `config.ts` saat ini hardcode ke prod URL — ubah ke `localhost:8080` untuk dev dengan local API, jangan commit
- CORS: `localhost:5173` sudah di-whitelist di prod `.env`

## Notes

- Run: `cd klinik && npm run dev` → http://localhost:5173
- Login dengan akun admin SAINS untuk bypass subscription check saat testing
- **ARCHITECTURE.md lebih detail** → baca itu untuk context lebih dalam

---

## 📋 Changelog
| Versi | Tanggal    | Perubahan |
|-------|------------|-----------|
| v1    | 2026-03-09 | Initial — MVP dibangun dan ditest lokal |
