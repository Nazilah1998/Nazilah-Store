# Nazilah Store — Platform Top-Up Game Otomatis H2H

Platform web top-up voucher dan mata uang game otomatis berkinerja tinggi yang dibangun dengan arsitektur **Monorepo** modern:
- **Frontend:** Astro 5.x (Hybrid/Server Mode) + React 19 Islands + Tailwind CSS v4
- **Backend:** Rust (Edition 2021/2024) + Axum 0.8 + Tokio
- **Database:** SQLite (Embedded via Rust `rusqlite` bundled)
- **Desain UI/UX:** Direplikasi presisi dari Google Stitch MCP (*Tactical Dark Slate Storefront*)

---

## 📁 Struktur Monorepo

```text
Project-Website-Top-Up/
├── backend/                  # Layanan Backend Rust & SQLite
│   ├── Cargo.toml            # Dependensi Rust (Axum, Tokio, Rusqlite, Serde)
│   ├── nazilah_store.db      # Database SQLite (auto-seeded)
│   └── src/
│       ├── main.rs           # Server Axum & CORS setup
│       ├── db.rs             # Skema & Inisialisasi SQLite
│       ├── models.rs         # Model data domain & validasi DTO
│       └── handlers.rs       # Endpoint API (katalog, order, verifikasi akun, dsb)
│
├── frontend/                 # Aplikasi Frontend Astro & React
│   ├── package.json          # Dependensi Astro 5 + React 19 + Tailwind CSS
│   ├── astro.config.mjs      # Konfigurasi Astro + @astrojs/node + Tailwind
│   └── src/
│       ├── layouts/
│       │   └── Layout.astro  # Master layout & navbar taktis
│       ├── styles/
│       │   └── global.css    # Token warna Tactical Slate & JetBrains Mono
│       ├── components/react/
│       │   ├── FlashSaleSection.tsx   # Flash sale dengan countdown timer
│       │   ├── GameCatalog.tsx        # Katalog game dengan filter tab instan
│       │   ├── CheckoutFlow.tsx       # Single-Page Checkout (4 langkah)
│       │   ├── LiveInvoice.tsx        # Halaman invoice pembayaran QRIS / VA
│       │   ├── OrderTracker.tsx       # Pelacak status pesanan via Invoice/WA
│       │   └── MlbbCalculator.tsx     # Kalkulator Winrate & Magic Wheel MLBB
│       └── pages/
│           ├── index.astro            # Homepage katalog & promo
│           ├── order/[slug].astro     # Dynamic Single-Page Checkout
│           ├── invoice/[id].astro     # Dynamic Live Invoice status
│           ├── cek-transaksi.astro    # Halaman pelacak status
│           ├── daftar-harga.astro     # Daftar harga & status server H2H
│           └── kalkulator.astro       # Halaman kalkulator pintar
│
├── designs/                  # Referensi desain asli dari Google Stitch MCP
│   ├── html/                 # Seluruh file HTML layar hasil export Stitch
│   └── screens_index.json    # Metadata seluruh layar desain
│
├── docs/                     # Dokumentasi arsitektur & master prompt
│   ├── master_prompt_pembuatan_website_nazilah_store.md
│   └── system_architecture_database_ui_ux_design_nazilah_store.md
│
├── package.json              # Root npm workspace scripts
└── Cargo.toml                # Root cargo workspace
```

---

## 🚀 Cara Menjalankan Proyek

### 1. Menjalankan Backend (Rust + SQLite)
```bash
# Dari root atau folder backend:
npm run dev:backend
# Atau:
cd backend && cargo run
```
Server backend berjalan di `http://127.0.0.1:8080`.

### 2. Menjalankan Frontend (Astro + React)
```bash
# Dari root direktori:
npm run dev:frontend
```
Website dapat diakses di `http://localhost:4321`.

### 3. Build Production
```bash
npm run build
```
Menghasilkan binary Rust release di `target/release/nazilah-store-backend` dan server bundle Astro di `frontend/dist/`.

---

## ⚡ Fitur Utama yang Telah Selesai
1. **Single-Page Checkout (`/order/[slug]`):** Form dinamis 4 langkah, validasi ID game dengan auto-check nickname, pemilihan nominal berkategori, akordeon metode pembayaran dengan biaya admin real-time, dan sticky summary bar.
2. **Live Invoice & Simulasi Demo (`/invoice/[id]`):** Tampilan QRIS dinamis / Virtual Account, countdown timer 2 jam, dan tombol simulasi pembayaran otomatis yang mengubah status menjadi `SUCCESS` beserta nomor SN.
3. **Katalog Flash Sale:** Bar kuota tersisa dan hitung mundur waktu nyata.
4. **Kalkulator Winrate MLBB (`/kalkulator`):** Perhitungan jumlah win streak yang dibutuhkan untuk menaikkan winrate akun.
5. **Daftar Harga & Status Server (`/daftar-harga`):** Tabel harga publik dan harga member dengan indikator latensi jalur H2H.

