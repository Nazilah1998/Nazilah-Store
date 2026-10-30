# Dokumen Desain Sistem, UI/UX & Aset: Nazilah Store

## 1. Sistem Desain UI/UX (Anti-Slop Tactical Dark Theme)
Desain visual **Nazilah Store** menghindari estetika template AI generik. Antarmuka menggunakan pendekatan **Tactical Dark Slate** yang terinspirasi dari antarmuka klien game modern (seperti Steam Deck OS dan Riot Client): kontras tinggi, garis batas (*border*) tajam 1px, fokus pada keterbacaan harga, dan gambar karakter game yang menonjol.

### 1.1. Palet Warna (CSS Variables / Tailwind v4 Tokens)
| Token | Hex Code | Penggunaan |
| :--- | :--- | :--- |
| `--bg-canvas` | `#090D16` | Latar belakang utama halaman (Deep Obsidian Slate) |
| `--bg-surface` | `#111827` | Latar belakang kartu game, langkah checkout, dan kontainer |
| `--bg-elevated` | `#1E293B` | Kartu nominal SKU saat di-hover atau input field aktif |
| `--border-subtle` | `#1F2937` | Garis tepi kartu standar (`1px solid`) |
| `--border-active` | `#F59E0B` | Garis tepi kartu SKU atau metode pembayaran yang sedang dipilih (`2px solid`) |
| `--accent-primary` | `#F59E0B` | Warna aksi utama (Amber Gold — melambangkan mata uang premium/top-up) |
| `--accent-hover` | `#D97706` | Warna tombol utama saat di-hover |
| `--text-primary` | `#F8FAFC` | Teks judul, nama game, dan nominal item |
| `--text-secondary`| `#94A3B8` | Teks deskripsi, petunjuk pengisian ID, dan label sekunder |
| `--status-success`| `#10B981` | Badge ID Valid, status transaksi berhasil |
| `--status-warning`| `#F59E0B` | Status menunggu pembayaran / sedang diproses |
| `--status-danger` | `#EF4444` | Peringatan ID tidak ditemukan, transaksi gagal, badge diskon Flash Sale |

### 1.2. Tipografi
- **Heading & Brand:** `Outfit` atau `Plus Jakarta Sans` (Bold/ExtraBold, tracking `-0.02em`).
- **Body & UI Controls:** `Plus Jakarta Sans` (Regular/Medium/SemiBold).
- **Harga, Invoice, & ID Pemain:** `JetBrains Mono` (Medium/Bold dengan `font-variant-numeric: tabular-nums` agar semua digit harga sejajar vertikal).

---

## 2. Daftar Aset Gambar & Ikon Game (Siap Pakai)
Berikut adalah struktur aset gambar resmi dan ilustrasi beresolusi tinggi yang harus dikonfigurasi dalam database awal (`seed.surql`) untuk **Nazilah Store**:

### 2.1. Aset Cover & Banner Game
| Game | Kategori | URL Thumbnail / Cover Art (CDN Resmi / High-Res) | Ikon Mata Uang |
| :--- | :--- | :--- | :--- |
| **Mobile Legends** | MOBA Mobile | `https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80` *(Gunakan fallback lokal: `/assets/games/mlbb-cover.webp`)* | `/assets/icons/diamond-mlbb.svg` (Biru Kristal) |
| **Free Fire** | Battle Royale | `https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80` *(Fallback lokal: `/assets/games/ff-cover.webp`)* | `/assets/icons/diamond-ff.svg` (Kuning/Biru Berlian) |
| **PUBG Mobile** | Battle Royale | `https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80` *(Fallback lokal: `/assets/games/pubgm-cover.webp`)* | `/assets/icons/uc-pubg.svg` (Koin & Uang Emas UC) |
| **Valorant** | Tactical FPS | `https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=600&q=80` *(Fallback lokal: `/assets/games/valorant-cover.webp`)* | `/assets/icons/vp-valorant.svg` (Logo V Merah/Putih) |
| **Genshin Impact** | Open World RPG| `https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80` *(Fallback lokal: `/assets/games/genshin-cover.webp`)* | `/assets/icons/genesis-crystal.svg` (Kristal Bintang) |
| **Honor of Kings** | MOBA Mobile | `https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80` *(Fallback lokal: `/assets/games/hok-cover.webp`)* | `/assets/icons/token-hok.svg` (Token Emas) |

> **Catatan Implementasi Gambar di Astro:** Gunakan komponen `<Picture />` dari `astro:assets` dengan format output `avif` dan `webp` serta rasio aspek kartu `3:4` (`aspect-[3/4]`) agar tidak terjadi *Cumulative Layout Shift* (CLS).

---

## 3. Wireframe & Tata Letak Antarmuka

### 3.1. Halaman Utama (`/`)
```text
+-----------------------------------------------------------------------------------+
| [Logo: NAZILAH STORE]   [🔍 Cari game atau voucher... (Cmd+K)]   [Cek Transaksi]  |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | BANNER PROMO UTAMA (Rasio 21:9 Desktop / 16:9 Mobile)                       |  |
|  | "FLASH SALE AWAL BULAN: Weekly Diamond Pass MLBB Mulai Rp24.500!"           |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  ⚡ FLASH SALE HARI INI  [Berakhir dalam: 02 : 14 : 55]                           |
|  +-----------------------+ +-----------------------+ +-----------------------+    |
|  | 💎 86 Diamonds MLBB   | | 🔥 Membership Mingguan| | 💵 60 UC PUBG Mobile  |    |
|  | Rp19.500 (̶R̶p̶2̶3̶.̶0̶0̶0̶)   | | Rp26.000 (̶R̶p̶3̶0̶.̶0̶0̶0̶)   | | Rp13.200 (̶R̶p̶1̶5̶.̶0̶0̶0̶)   |    |
|  | [Sisa Stok: 12/50]    | | [Sisa Stok: 4/30]     | | [Sisa Stok: 29/100]   |    |
|  +-----------------------+ +-----------------------+ +-----------------------+    |
|                                                                                   |
|  [🔥 Populer]  [📱 Mobile Games]  [💻 PC Games]  [🎟️ Kode Voucher]                |
|  +---------------+ +---------------+ +---------------+ +---------------+          |
|  |               | |               | |               | |               |          |
|  |   [GAMBAR]    | |   [GAMBAR]    | |   [GAMBAR]    | |   [GAMBAR]    |          |
|  | Mobile Legends| |   Free Fire   | |  PUBG Mobile  | |   Valorant    |          |
|  |   Moonton     | |    Garena     | |  Tencent Games| |  Riot Games   |          |
|  +---------------+ +---------------+ +---------------+ +---------------+          |
+-----------------------------------------------------------------------------------+
```

### 3.2. Halaman Single-Page Checkout (`/order/[slug]`)
```text
+-----------------------------------------------------------------------------------+
| < Kembali ke Katalog                                              NAZILAH STORE   |
+-----------------------------------------------------------------------------------+
| +-------------------------+  +--------------------------------------------------+ |
| | KOLOM KIRI (Sticky)     |  | KOLOM KANAN (Interaktif - React Islands)         | |
| |                         |  |                                                  | |
| | [Banner & Ikon Game]    |  | [1] MASUKKAN DATA AKUN                           | |
| | MOBILE LEGENDS          |  | +----------------------+ +---------------------+ | |
| | Proses Otomatis 1-3 Dtk |  | | User ID: 12345678    | | Zone ID: 1234       | | |
| |                         |  | +----------------------+ +---------------------+ | |
| | Cara Top Up:            |  | [✓ Nickname Terverifikasi: NazilahProPlayer]     | |
| | 1. Masukkan ID & Zone   |  |                                                  | |
| | 2. Pilih Nominal        |  | [2] PILIH NOMINAL TOP UP                         | |
| | 3. Pilih Pembayaran     |  | -- Spesial Pass --                               | |
| | 4. Masukkan No. WA      |  | +----------------------+ +---------------------+ | |
| |                         |  | | 🎫 Weekly Diamond    | | 🎫 Twilight Pass    | | |
| | +---------------------+ |  | | Rp26.500          💎 | | Rp145.000        💎 | | |
| | | RINGKASAN PESANAN   | |  | +----------------------+ +---------------------+ | |
| | | Akun: NazilahPro    | |  | -- Top Up Instan --                              | |
| | | Item: 257 Diamonds  | |  | +--------------+ +--------------+ +------------+ | |
| | | Metode: QRIS        | |  | | 86 Diamonds  | | 172 Diamonds | | 257 Dm [✓] | | |
| | | Harga: Rp65.000     | |  | | Rp21.500     | | Rp43.000     | | Rp65.000   | | |
| | | Biaya: Rp455        | |  | +--------------+ +--------------+ +------------+ | |
| | | ------------------- | |  |                                                  | |
| | | TOTAL: Rp65.455     | |  | [3] PILIH METODE PEMBAYARAN                      | |
| | | [ BELI SEKARANG -> ]| |  | +----------------------------------------------+ | |
| | +---------------------+ |  | | [✓] QRIS (Semua E-Wallet & Mobile Banking)   | | |
| +-------------------------+  | |     Total: Rp65.455 (Dicek Otomatis)         | | |
|                              | +----------------------------------------------+ | |
|                              |                                                  | |
|                              | [4] DETAIL KONTAK & KODE PROMO                   | |
|                              | [Nomor WhatsApp: 0812xxxxxxxx]  [Kode Voucher]   | |
|                              +--------------------------------------------------+ |
+-----------------------------------------------------------------------------------+
```

---

## 4. Arsitektur Sistem (Astro + React + Rust + SurrealDB/Redb)

```text
+-------------------------------------------------------------------------+
|                        PENGGUNA (Browser Mobile/PC)                     |
+------------------------------------+------------------------------------+
                                     |
                   +-----------------+-----------------+
                   |                                   |
                   v (Halaman Katalog/Order)           v (API JSON & SSE Stream)
+------------------------------------+  +---------------------------------+
|   FRONTEND: Astro 5 + React 19     |  |      BACKEND: Rust (Axum)       |
| - Static SSG untuk Katalog Game    |  | - REST API (/api/v1/*)          |
| - React Islands untuk Form Order   |  | - SSE (/api/v1/invoice/stream)  |
| - Nanostores untuk State Sinkron   |  | - HMAC Webhook Verifier         |
+------------------------------------+  +-------+-----------------+-------+
                                                |                 |
                              +-----------------+                 +----------------+
                              | (Cache Nickname & Rate Limit)                      | (Data Transaksional & Katalog)
                              v                                                    v
               +------------------------------+                     +------------------------------+
               |     REDB (Embedded Rust)     |                     |   SURREALDB (Native Rust)    |
               | - KV Store murni di Rust     |                     | - Mode Embedded (SurrealKV)  |
               | - Sub-millisecond Lookup     |                     | - ACID Transactions          |
               | - Menyimpan Cache ID Game    |                     | - Relasi Game -> SKU -> Order|
               +------------------------------+                     +--------------+---------------+
                                                                                   |
                                                       +---------------------------+---------------------------+
                                                       |                                                       |
                                                       v (Fulfillment H2H)                                     v (Tagihan Pembayaran)
                                        +------------------------------+                        +------------------------------+
                                        |   PROVIDER H2H GAME          |                        |       PAYMENT GATEWAY        |
                                        | (Digiflazz / VIP Reseller)   |                        | (Midtrans / Duitku / Tripay) |
                                        +------------------------------+                        +------------------------------+
```

### Mengapa Kombinasi Database Rust Ini?
1. **SurrealDB (`surrealdb` crate):** Database multi-model modern yang ditulis 100% menggunakan bahasa **Rust**. Dapat dijalankan langsung di dalam binary aplikasi Rust menggunakan engine penyimpanan `surrealkv://` (tanpa perlu menginstal server database terpisah) ataupun sebagai cluster terdistribusi. Mendukung query relasional, dokumen JSON, dan *live queries* (real-time).
2. **Redb (`redb` crate):** Database Key-Value embedded yang ditulis murni dalam bahasa **Rust** (pengganti modern untuk LMDB/RocksDB yang bebas dari dependensi C/C++). Sangat cepat dan aman terhadap *memory corruption*, ideal untuk menyimpan cache pengecekan nickname game dan counter rate-limiting IP.

---

## 5. Skema Database (SurrealQL & Rust Structs)

### 5.1. Skema Tabel SurrealDB (`schema.surql`)
```sql
-- 1. Tabel Game
DEFINE TABLE game SCHEMAFULL;
DEFINE FIELD slug ON TABLE game TYPE string ASSERT $value != NONE;
DEFINE FIELD name ON TABLE game TYPE string;
DEFINE FIELD publisher ON TABLE game TYPE string;
DEFINE FIELD category ON TABLE game TYPE string; -- 'mobile', 'pc', 'voucher'
DEFINE FIELD cover_url ON TABLE game TYPE string;
DEFINE FIELD banner_url ON TABLE game TYPE string;
DEFINE FIELD currency_name ON TABLE game TYPE string;
DEFINE FIELD currency_icon ON TABLE game TYPE string;
DEFINE FIELD requires_zone ON TABLE game TYPE bool DEFAULT false;
DEFINE FIELD zone_label ON TABLE game TYPE option<string>;
DEFINE FIELD is_active ON TABLE game TYPE bool DEFAULT true;
DEFINE INDEX idx_game_slug ON TABLE game COLUMNS slug UNIQUE;

-- 2. Tabel Produk / Nominal SKU
DEFINE TABLE product_sku SCHEMAFULL;
DEFINE FIELD sku_code ON TABLE product_sku TYPE string; -- Kode H2H (misal: 'ML86')
DEFINE FIELD game ON TABLE product_sku TYPE record<game>;
DEFINE FIELD name ON TABLE product_sku TYPE string; -- '86 Diamonds (78 + 8 Bonus)'
DEFINE FIELD category ON TABLE product_sku TYPE string; -- 'pass', 'instant', 'special'
DEFINE FIELD base_cost ON TABLE product_sku TYPE int; -- Harga modal H2H (Rupiah)
DEFINE FIELD selling_price ON TABLE product_sku TYPE int; -- Harga jual normal (Rupiah)
DEFINE FIELD discount_price ON TABLE product_sku TYPE option<int>; -- Harga coret/Flash Sale
DEFINE FIELD stock_quota ON TABLE product_sku TYPE option<int>; -- Kuota Flash Sale
DEFINE FIELD is_available ON TABLE product_sku TYPE bool DEFAULT true;
DEFINE INDEX idx_sku_code ON TABLE product_sku COLUMNS sku_code UNIQUE;

-- 3. Tabel Metode Pembayaran
DEFINE TABLE payment_channel SCHEMAFULL;
DEFINE FIELD code ON TABLE payment_channel TYPE string; -- 'QRIS', 'BRIVA', 'DANA'
DEFINE FIELD name ON TABLE payment_channel TYPE string;
DEFINE FIELD group ON TABLE payment_channel TYPE string; -- 'qris', 'va', 'ewallet', 'retail'
DEFINE FIELD fee_flat ON TABLE payment_channel TYPE int DEFAULT 0;
DEFINE FIELD fee_percent ON TABLE payment_channel TYPE float DEFAULT 0.0;
DEFINE FIELD logo_url ON TABLE payment_channel TYPE string;
DEFINE FIELD is_active ON TABLE payment_channel TYPE bool DEFAULT true;

-- 4. Tabel Transaksi / Invoice
DEFINE TABLE transaction SCHEMAFULL;
DEFINE FIELD invoice_id ON TABLE transaction TYPE string; -- 'NZL-20261030-XXXX'
DEFINE FIELD game_slug ON TABLE transaction TYPE string;
DEFINE FIELD sku_code ON TABLE transaction TYPE string;
DEFINE FIELD sku_name ON TABLE transaction TYPE string;
DEFINE FIELD target_user_id ON TABLE transaction TYPE string;
DEFINE FIELD target_zone_id ON TABLE transaction TYPE option<string>;
DEFINE FIELD target_nickname ON TABLE transaction TYPE string;
DEFINE FIELD whatsapp_number ON TABLE transaction TYPE string;
DEFINE FIELD payment_code ON TABLE transaction TYPE string;
DEFINE FIELD payment_reference ON TABLE transaction TYPE option<string>; -- QR String / VA Number
DEFINE FIELD amount_item ON TABLE transaction TYPE int;
DEFINE FIELD amount_discount ON TABLE transaction TYPE int DEFAULT 0;
DEFINE FIELD amount_fee ON TABLE transaction TYPE int;
DEFINE FIELD amount_total ON TABLE transaction TYPE int;
DEFINE FIELD status ON TABLE transaction TYPE string DEFAULT 'PENDING'; 
-- Nilai status: 'PENDING', 'PAID', 'PROCESSING', 'SUCCESS', 'FAILED', 'EXPIRED'
DEFINE FIELD sn_number ON TABLE transaction TYPE option<string>; -- Serial Number bukti top up
DEFINE FIELD created_at ON TABLE transaction TYPE datetime DEFAULT time::now();
DEFINE FIELD expires_at ON TABLE transaction TYPE datetime;
DEFINE INDEX idx_invoice_id ON TABLE transaction COLUMNS invoice_id UNIQUE;
DEFINE INDEX idx_whatsapp ON TABLE transaction COLUMNS whatsapp_number;
```

### 5.2. Representasi Model di Backend Rust (`src/models.rs`)
```rust
use serde::{Deserialize, Serialize};
use validator::Validate;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Game {
    pub slug: String,
    pub name: String,
    pub publisher: String,
    pub category: String,
    pub cover_url: String,
    pub banner_url: String,
    pub currency_name: String,
    pub currency_icon: String,
    pub requires_zone: bool,
    pub zone_label: Option<String>,
    pub is_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductSku {
    pub sku_code: String,
    pub name: String,
    pub category: String,
    pub base_cost: i64,
    pub selling_price: i64,
    pub discount_price: Option<i64>,
    pub stock_quota: Option<i64>,
    pub is_available: bool,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateOrderRequest {
    #[validate(length(min = 2, max = 50))]
    pub game_slug: String,
    #[validate(length(min = 2, max = 30))]
    pub sku_code: String,
    #[validate(length(min = 4, max = 32))]
    pub target_user_id: String,
    pub target_zone_id: Option<String>,
    #[validate(length(min = 9, max = 16))]
    pub whatsapp_number: String,
    pub payment_code: String,
    pub promo_code: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum OrderStatus {
    Pending,
    Paid,
    Processing,
    Success,
    Failed,
    Expired,
}
```

---

## 6. Struktur Direktori Proyek (Monorepo)

```text
nazilah-store/
├── backend/                        # Workspace Rust (Axum + SurrealDB + Redb)
│   ├── Cargo.toml
│   ├── schema.surql                # Skema inisialisasi & data awal SurrealDB
│   └── src/
│       ├── main.rs                 # Entrypoint server Axum & inisialisasi DB
│       ├── config.rs               # Konfigurasi Env (API Keys H2H & Payment)
│       ├── db/
│       │   ├── mod.rs
│       │   ├── surreal.rs          # Koneksi SurrealKV embedded
│       │   └── redb_cache.rs       # Penyimpanan cache Nickname ID Game
│       ├── models/                 # Struct domain & DTO validasi
│       ├── handlers/
│       │   ├── catalog.rs          # GET /api/v1/games & /api/v1/games/:slug
│       │   ├── inquiry.rs          # POST /api/v1/game/check-id
│       │   ├── checkout.rs         # POST /api/v1/orders
│       │   ├── invoice_sse.rs      # GET /api/v1/invoice/:id/stream
│       │   └── webhook.rs          # POST /api/v1/webhooks/payment & /h2h
│       └── services/
│           ├── pricing.rs          # Kalkulasi harga, diskon, & biaya gateway
│           ├── h2h_provider.rs     # Klien HTTP Reqwest ke Digiflazz/VIP
│           └── payment_gateway.rs  # Pembuatan QRIS/VA ke Duitku/Tripay
│
└── frontend/                       # Workspace Astro 5 + React 19 + Tailwind v4
    ├── package.json
    ├── astro.config.mjs
    ├── public/
    │   └── assets/
    │       ├── games/              # Poster game format .webp/.avif
    │       └── icons/              # SVG ikon Diamond, UC, VP, Genesis Crystal
    └── src/
        ├── layouts/
        │   └── MainLayout.astro    # Shell HTML, Navbar, & Command Palette
        ├── pages/
        │   ├── index.astro         # Katalog Game, Banner, & Flash Sale
        │   ├── order/
        │   │   └── [slug].astro    # Halaman Single-Page Checkout
        │   ├── invoice/
        │   │   └── [id].astro      # Halaman Pembayaran QRIS/VA Live
        │   └── cek-transaksi.astro # Pencarian Pesanan via Invoice/WA
        ├── stores/
        │   └── checkoutStore.ts    # Nanostores untuk state order lintas-island
        └── components/
            ├── astro/              # Komponen statis cepat (Zero JS)
            │   ├── GameGrid.astro
            │   └── Footer.astro
            └── react/              # Komponen interaktif (React Islands)
                ├── FlashSaleCarousel.tsx
                ├── AccountIdVerifier.tsx
                ├── SkuSelectorGrid.tsx
                ├── PaymentAccordion.tsx
                ├── StickyOrderSummary.tsx
                └── LiveInvoiceStatus.tsx
```