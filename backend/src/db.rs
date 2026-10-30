use rusqlite::{Connection, Result};
use std::sync::{Arc, Mutex};

pub type DbPool = Arc<Mutex<Connection>>;

pub fn init_db(db_path: &str) -> Result<DbPool> {
    let conn = Connection::open(db_path)?;

    // Enable WAL mode & foreign keys for high performance
    conn.execute_batch(
        "PRAGMA journal_mode = WAL;
         PRAGMA synchronous = NORMAL;
         PRAGMA foreign_keys = ON;",
    )?;

    // 1. Games Table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS games (
            slug TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            publisher TEXT NOT NULL,
            category TEXT NOT NULL,
            cover_url TEXT NOT NULL,
            banner_url TEXT NOT NULL,
            currency_name TEXT NOT NULL,
            currency_icon TEXT NOT NULL,
            requires_zone INTEGER NOT NULL DEFAULT 0,
            zone_label TEXT,
            id_hint TEXT NOT NULL,
            is_active INTEGER NOT NULL DEFAULT 1
        );",
        [],
    )?;

    // 2. Product SKUs Table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS product_skus (
            sku_code TEXT PRIMARY KEY,
            game_slug TEXT NOT NULL,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            base_cost INTEGER NOT NULL,
            selling_price INTEGER NOT NULL,
            discount_price INTEGER,
            stock_quota INTEGER,
            is_available INTEGER NOT NULL DEFAULT 1,
            FOREIGN KEY(game_slug) REFERENCES games(slug)
        );",
        [],
    )?;

    // 3. Payment Channels Table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS payment_channels (
            code TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            group_type TEXT NOT NULL,
            fee_flat INTEGER NOT NULL DEFAULT 0,
            fee_percent REAL NOT NULL DEFAULT 0.0,
            logo_url TEXT NOT NULL,
            is_active INTEGER NOT NULL DEFAULT 1
        );",
        [],
    )?;

    // 4. Transactions Table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS transactions (
            invoice_id TEXT PRIMARY KEY,
            game_slug TEXT NOT NULL,
            sku_code TEXT NOT NULL,
            sku_name TEXT NOT NULL,
            target_user_id TEXT NOT NULL,
            target_zone_id TEXT,
            target_nickname TEXT NOT NULL,
            whatsapp_number TEXT NOT NULL,
            payment_code TEXT NOT NULL,
            payment_reference TEXT,
            qr_string TEXT,
            amount_item INTEGER NOT NULL,
            amount_discount INTEGER NOT NULL DEFAULT 0,
            amount_fee INTEGER NOT NULL,
            amount_total INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'PENDING',
            sn_number TEXT,
            created_at TEXT NOT NULL,
            expires_at TEXT NOT NULL
        );",
        [],
    )?;

    // 5. Flash Sales Table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS flash_sales (
            sku_code TEXT PRIMARY KEY,
            game_slug TEXT NOT NULL,
            discount_price INTEGER NOT NULL,
            stock_left INTEGER NOT NULL,
            total_stock INTEGER NOT NULL,
            ends_at TEXT NOT NULL,
            FOREIGN KEY(sku_code) REFERENCES product_skus(sku_code)
        );",
        [],
    )?;

    // 6. Users Table (Member & Reseller)
    conn.execute(
        "CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            username TEXT NOT NULL UNIQUE,
            whatsapp TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'member',
            balance INTEGER NOT NULL DEFAULT 0,
            referral_code TEXT,
            created_at TEXT NOT NULL
        );",
        [],
    )?;

    // 7. OTP Verifications Table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS otps (
            phone_or_email TEXT PRIMARY KEY,
            otp_code TEXT NOT NULL,
            expires_at TEXT NOT NULL
        );",
        [],
    )?;

    seed_initial_data(&conn)?;

    Ok(Arc::new(Mutex::new(conn)))
}

fn seed_initial_data(conn: &Connection) -> Result<()> {
    let mut check_stmt = conn.prepare("SELECT count(*) FROM games")?;
    let count: i64 = check_stmt.query_row([], |row| row.get(0))?;
    if count > 0 {
        return Ok(());
    }

    println!("Seeding initial catalog data into SQLite database...");

    // Games Seed
    conn.execute(
        "INSERT INTO games (slug, name, publisher, category, cover_url, banner_url, currency_name, currency_icon, requires_zone, zone_label, id_hint, is_active)
         VALUES
         ('mobile-legends', 'Mobile Legends: Bang Bang', 'Moonton', 'populer', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1400&q=80', 'Diamonds', '💎', 1, 'Zone ID (4 Digit)', 'Contoh: User ID 12345678, Zone ID (2024)', 1),
         ('free-fire', 'Free Fire Max', 'Garena', 'populer', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1400&q=80', 'Diamonds', '🔥', 0, NULL, 'Contoh: Player ID 9876543210', 1),
         ('pubg-mobile', 'PUBG Mobile', 'Tencent Games', 'populer', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1400&q=80', 'Unknown Cash', '🪙', 0, NULL, 'Contoh: Character ID 5123456789', 1),
         ('valorant', 'Valorant', 'Riot Games', 'pc', 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=1400&q=80', 'Points', '⚡', 0, NULL, 'Contoh: Riot ID (Nazilah#IND)', 1),
         ('genshin-impact', 'Genshin Impact', 'HoYoverse', 'mobile', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=80', 'Genesis Crystal', '✨', 1, 'Server Region', 'Contoh: UID 800123456, Server Asia', 1),
         ('honor-of-kings', 'Honor of Kings', 'Level Infinite', 'mobile', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1400&q=80', 'Tokens', '🏆', 0, NULL, 'Contoh: UID Player 1029384756', 1);",
        [],
    )?;

    // SKUs for Mobile Legends
    conn.execute(
        "INSERT INTO product_skus (sku_code, game_slug, name, category, base_cost, selling_price, discount_price, stock_quota, is_available)
         VALUES
         ('ML-PASS-WEEKLY', 'mobile-legends', 'Weekly Diamond Pass', 'pass', 24000, 26500, 24500, 50, 1),
         ('ML-PASS-TWILIGHT', 'mobile-legends', 'Twilight Pass', 'pass', 135000, 145000, NULL, NULL, 1),
         ('ML-DM-86', 'mobile-legends', '86 Diamonds (78 + 8 Bonus)', 'instant', 18500, 21500, 19500, 100, 1),
         ('ML-DM-172', 'mobile-legends', '172 Diamonds (156 + 16 Bonus)', 'instant', 37000, 43000, NULL, NULL, 1),
         ('ML-DM-257', 'mobile-legends', '257 Diamonds (234 + 23 Bonus)', 'instant', 55500, 65000, NULL, NULL, 1),
         ('ML-DM-344', 'mobile-legends', '344 Diamonds (312 + 32 Bonus)', 'instant', 74000, 86000, NULL, NULL, 1),
         ('ML-DM-429', 'mobile-legends', '429 Diamonds (390 + 39 Bonus)', 'instant', 92500, 107500, NULL, NULL, 1),
         ('ML-DM-514', 'mobile-legends', '514 Diamonds (468 + 46 Bonus)', 'instant', 111000, 129000, NULL, NULL, 1),
         ('ML-DM-706', 'mobile-legends', '706 Diamonds (625 + 81 Bonus)', 'instant', 152000, 175000, NULL, NULL, 1),
         ('ML-DM-2195', 'mobile-legends', '2195 Diamonds (1860 + 335 Bonus)', 'special', 465000, 530000, NULL, NULL, 1),
         ('ML-DM-5532', 'mobile-legends', '5532 Diamonds (4680 + 852 Bonus)', 'special', 1150000, 1315000, NULL, NULL, 1);",
        [],
    )?;

    // SKUs for Free Fire
    conn.execute(
        "INSERT INTO product_skus (sku_code, game_slug, name, category, base_cost, selling_price, discount_price, stock_quota, is_available)
         VALUES
         ('FF-PASS-WEEKLY', 'free-fire', 'Membership Mingguan', 'pass', 25000, 28000, 26000, 30, 1),
         ('FF-PASS-MONTHLY', 'free-fire', 'Membership Bulanan', 'pass', 115000, 125000, NULL, NULL, 1),
         ('FF-DM-100', 'free-fire', '100 Diamonds', 'instant', 12500, 14500, NULL, NULL, 1),
         ('FF-DM-140', 'free-fire', '140 Diamonds', 'instant', 17000, 20000, NULL, NULL, 1),
         ('FF-DM-355', 'free-fire', '355 Diamonds', 'instant', 44000, 50000, NULL, NULL, 1),
         ('FF-DM-720', 'free-fire', '720 Diamonds', 'instant', 88000, 99000, NULL, NULL, 1);",
        [],
    )?;

    // SKUs for PUBG Mobile
    conn.execute(
        "INSERT INTO product_skus (sku_code, game_slug, name, category, base_cost, selling_price, discount_price, stock_quota, is_available)
         VALUES
         ('PUBG-UC-60', 'pubg-mobile', '60 Unknown Cash (UC)', 'instant', 12000, 14500, 13200, 100, 1),
         ('PUBG-UC-325', 'pubg-mobile', '300 + 25 UC (325 UC)', 'instant', 62000, 72000, NULL, NULL, 1),
         ('PUBG-UC-660', 'pubg-mobile', '600 + 60 UC (Royale Pass)', 'instant', 124000, 142000, NULL, NULL, 1);",
        [],
    )?;

    // SKUs for Valorant
    conn.execute(
        "INSERT INTO product_skus (sku_code, game_slug, name, category, base_cost, selling_price, discount_price, stock_quota, is_available)
         VALUES
         ('VAL-VP-475', 'valorant', '475 Valorant Points', 'instant', 45000, 52000, NULL, NULL, 1),
         ('VAL-VP-1000', 'valorant', '1000 Valorant Points', 'instant', 95000, 108000, NULL, NULL, 1),
         ('VAL-VP-2050', 'valorant', '2050 Valorant Points', 'instant', 190000, 215000, NULL, NULL, 1);",
        [],
    )?;

    // Payment Channels Seed
    conn.execute(
        "INSERT INTO payment_channels (code, name, group_type, fee_flat, fee_percent, logo_url, is_active)
         VALUES
         ('QRIS', 'QRIS (BCA, Mandiri, GoPay, OVO, ShopeePay)', 'qris', 0, 0.007, '/assets/icons/qris.svg', 1),
         ('BCA_VA', 'BCA Virtual Account', 'va', 2500, 0.0, '/assets/icons/bca.svg', 1),
         ('BRI_VA', 'BRI Virtual Account', 'va', 2000, 0.0, '/assets/icons/bri.svg', 1),
         ('MANDIRI_VA', 'Mandiri Virtual Account', 'va', 2500, 0.0, '/assets/icons/mandiri.svg', 1),
         ('DANA', 'DANA Dompet Digital', 'ewallet', 1000, 0.015, '/assets/icons/dana.svg', 1),
         ('GOPAY', 'GoPay Instant', 'ewallet', 1000, 0.015, '/assets/icons/gopay.svg', 1),
         ('SHOPEEPAY', 'ShopeePay App', 'ewallet', 1000, 0.015, '/assets/icons/shopeepay.svg', 1),
         ('ALFAMART', 'Alfamart / Alfamidi Retail', 'retail', 3500, 0.0, '/assets/icons/alfamart.svg', 1),
         ('INDOMARET', 'Indomaret / Ceriamart Retail', 'retail', 3500, 0.0, '/assets/icons/indomaret.svg', 1);",
        [],
    )?;

    // Flash Sales Seed
    conn.execute(
        "INSERT INTO flash_sales (sku_code, game_slug, discount_price, stock_left, total_stock, ends_at)
         VALUES
         ('ML-PASS-WEEKLY', 'mobile-legends', 24500, 12, 50, datetime('now', '+12 hours')),
         ('ML-DM-86', 'mobile-legends', 19500, 28, 100, datetime('now', '+12 hours')),
         ('FF-PASS-WEEKLY', 'free-fire', 26000, 4, 30, datetime('now', '+12 hours')),
         ('PUBG-UC-60', 'pubg-mobile', 13200, 29, 100, datetime('now', '+12 hours'));",
        [],
    )?;

    // Demo Users Seed
    conn.execute(
        "INSERT OR IGNORE INTO users (id, name, username, whatsapp, email, password_hash, role, balance, referral_code, created_at)
         VALUES
         ('USR-DEMO-01', 'Muhammad Nazilah', 'nazilah_pro', '081234567890', 'demo@nazilahstore.com', 'Password123!', 'reseller', 2500000, 'VIP-PARTNER', datetime('now'));",
        [],
    )?;

    println!("Seeding completed successfully.");
    Ok(())
}
