# 🏥 Klinik App

**Invoice & Kwitansi Generator untuk Dokter Praktek Mandiri**

Sub-project #2 di monorepo SAINS. Pakai backend API SAINS yang sama (auth, Midtrans, plans).

---

## Quick Start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
```

> Pakai akun admin SAINS untuk bypass subscription saat dev.

## Dokumentasi

| Dokumen | Path | Isi |
|---|---|---|
| **Architecture** | `docs/ARCHITECTURE.md` | Rationale, design decisions, data flow, file structure |
| **Market Research** | `.agent/outputs/research/high-income-google-product.md` | Kenapa produk ini, siapa targetnya |
| **Klinik Research** | `.agent/outputs/research/klinik-app.md` | Context engineering output untuk klinik |
| **Deployment** | `../DEPLOYMENT.md` | VPS info, SSH, deploy commands |

## Structure

```
src/
├── main.ts          ← Boot: auth → access-check → dashboard
├── core/
│   ├── auth.ts      ← Login/register/logout/checkAccess (SAINS API)
│   ├── config.ts    ← product:'klinik', apiBase
│   ├── router.ts    ← Hash-based SPA router
│   └── storage.ts   ← Invoice CRUD (localStorage)
└── components/
    ├── AuthGate.ts     ← Login + Register
    ├── PricingPage.ts  ← Plans + Midtrans checkout
    ├── Dashboard.ts    ← Stats + invoice table
    ├── InvoiceForm.ts  ← Buat/edit invoice
    ├── InvoicePreview.ts ← Print-ready preview
    └── Nav.ts          ← Navigation bar
```

## API Integration

Pakai SAINS API di `https://sains-atomic.web.id`. Zero backend changes.
Endpoint utama: `/api/auth/*`, `/api/plans?product=klinik`, `/api/checkout`, `/api/access-check?product=klinik`.

> ⚠️ **Sebelum launch:** Tambah product `klinik` + plan di `/admin/products` dan `/admin/pricing`.
