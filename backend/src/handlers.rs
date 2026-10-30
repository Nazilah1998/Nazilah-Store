use crate::db::DbPool;
use crate::models::*;
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use chrono::{Duration, Utc};
use rand::{distributions::Alphanumeric, Rng};
use rusqlite::params;
use serde::Deserialize;

pub async fn health_check() -> impl IntoResponse {
    Json(serde_json::json!({
        "status": "online",
        "service": "Nazilah Store Top-Up Backend (Rust + SQLite)",
        "timestamp": Utc::now().to_rfc3339()
    }))
}

// 1. List all games
pub async fn list_games(State(pool): State<DbPool>) -> Result<Json<ApiResponse<Vec<Game>>>, StatusCode> {
    let conn = pool.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let mut stmt = conn
        .prepare("SELECT slug, name, publisher, category, cover_url, banner_url, currency_name, currency_icon, requires_zone, zone_label, id_hint, is_active FROM games WHERE is_active = 1")
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let games = stmt
        .query_map([], |row| {
            Ok(Game {
                slug: row.get(0)?,
                name: row.get(1)?,
                publisher: row.get(2)?,
                category: row.get(3)?,
                cover_url: row.get(4)?,
                banner_url: row.get(5)?,
                currency_name: row.get(6)?,
                currency_icon: row.get(7)?,
                requires_zone: row.get::<_, i64>(8)? == 1,
                zone_label: row.get(9)?,
                id_hint: row.get(10)?,
                is_active: row.get::<_, i64>(11)? == 1,
            })
        })
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .filter_map(Result::ok)
        .collect::<Vec<_>>();

    Ok(Json(ApiResponse {
        success: true,
        message: "Games retrieved successfully".to_string(),
        data: Some(games),
    }))
}

#[derive(serde::Serialize)]
pub struct GameDetailResponse {
    pub game: Game,
    pub skus: Vec<ProductSku>,
    pub payment_channels: Vec<PaymentChannel>,
}

// 2. Get game detail by slug
pub async fn get_game_detail(
    State(pool): State<DbPool>,
    Path(slug): Path<String>,
) -> Result<Json<ApiResponse<GameDetailResponse>>, StatusCode> {
    let conn = pool.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let mut game_stmt = conn
        .prepare("SELECT slug, name, publisher, category, cover_url, banner_url, currency_name, currency_icon, requires_zone, zone_label, id_hint, is_active FROM games WHERE slug = ?1")
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let game = game_stmt
        .query_row(params![slug], |row| {
            Ok(Game {
                slug: row.get(0)?,
                name: row.get(1)?,
                publisher: row.get(2)?,
                category: row.get(3)?,
                cover_url: row.get(4)?,
                banner_url: row.get(5)?,
                currency_name: row.get(6)?,
                currency_icon: row.get(7)?,
                requires_zone: row.get::<_, i64>(8)? == 1,
                zone_label: row.get(9)?,
                id_hint: row.get(10)?,
                is_active: row.get::<_, i64>(11)? == 1,
            })
        })
        .map_err(|_| StatusCode::NOT_FOUND)?;

    let mut sku_stmt = conn
        .prepare("SELECT sku_code, game_slug, name, category, base_cost, selling_price, discount_price, stock_quota, is_available FROM product_skus WHERE game_slug = ?1 AND is_available = 1 ORDER BY selling_price ASC")
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let skus = sku_stmt
        .query_map(params![slug], |row| {
            Ok(ProductSku {
                sku_code: row.get(0)?,
                game_slug: row.get(1)?,
                name: row.get(2)?,
                category: row.get(3)?,
                base_cost: row.get(4)?,
                selling_price: row.get(5)?,
                discount_price: row.get(6)?,
                stock_quota: row.get(7)?,
                is_available: row.get::<_, i64>(8)? == 1,
            })
        })
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .filter_map(Result::ok)
        .collect::<Vec<_>>();

    let mut pay_stmt = conn
        .prepare("SELECT code, name, group_type, fee_flat, fee_percent, logo_url, is_active FROM payment_channels WHERE is_active = 1")
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let payment_channels = pay_stmt
        .query_map([], |row| {
            Ok(PaymentChannel {
                code: row.get(0)?,
                name: row.get(1)?,
                group_type: row.get(2)?,
                fee_flat: row.get(3)?,
                fee_percent: row.get(4)?,
                logo_url: row.get(5)?,
                is_active: row.get::<_, i64>(6)? == 1,
            })
        })
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .filter_map(Result::ok)
        .collect::<Vec<_>>();

    Ok(Json(ApiResponse {
        success: true,
        message: "Game details retrieved".to_string(),
        data: Some(GameDetailResponse {
            game,
            skus,
            payment_channels,
        }),
    }))
}

// 3. Flash sale list
pub async fn get_flash_sales(
    State(pool): State<DbPool>,
) -> Result<Json<ApiResponse<Vec<FlashSaleItem>>>, StatusCode> {
    let conn = pool.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let mut stmt = conn
        .prepare(
            "SELECT f.sku_code, f.game_slug, g.name as game_name, p.name as item_name, p.selling_price as original_price, f.discount_price, f.stock_left, f.total_stock, f.ends_at
             FROM flash_sales f
             JOIN product_skus p ON f.sku_code = p.sku_code
             JOIN games g ON f.game_slug = g.slug",
        )
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let sales = stmt
        .query_map([], |row| {
            Ok(FlashSaleItem {
                sku_code: row.get(0)?,
                game_slug: row.get(1)?,
                game_name: row.get(2)?,
                item_name: row.get(3)?,
                original_price: row.get(4)?,
                discount_price: row.get(5)?,
                stock_left: row.get(6)?,
                total_stock: row.get(7)?,
                ends_at: row.get(8)?,
            })
        })
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .filter_map(Result::ok)
        .collect::<Vec<_>>();

    Ok(Json(ApiResponse {
        success: true,
        message: "Flash sale items retrieved".to_string(),
        data: Some(sales),
    }))
}

// 4. Payment channels
pub async fn get_payment_channels(
    State(pool): State<DbPool>,
) -> Result<Json<ApiResponse<Vec<PaymentChannel>>>, StatusCode> {
    let conn = pool.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let mut stmt = conn
        .prepare("SELECT code, name, group_type, fee_flat, fee_percent, logo_url, is_active FROM payment_channels WHERE is_active = 1")
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let channels = stmt
        .query_map([], |row| {
            Ok(PaymentChannel {
                code: row.get(0)?,
                name: row.get(1)?,
                group_type: row.get(2)?,
                fee_flat: row.get(3)?,
                fee_percent: row.get(4)?,
                logo_url: row.get(5)?,
                is_active: row.get::<_, i64>(6)? == 1,
            })
        })
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .filter_map(Result::ok)
        .collect::<Vec<_>>();

    Ok(Json(ApiResponse {
        success: true,
        message: "Payment channels retrieved".to_string(),
        data: Some(channels),
    }))
}

// 5. Check ID & Nickname
pub async fn check_account_id(
    Json(payload): Json<CheckIdRequest>,
) -> Result<Json<ApiResponse<CheckIdResponse>>, StatusCode> {
    let user_id = payload.user_id.trim();
    if user_id.len() < 4 {
        return Ok(Json(ApiResponse {
            success: false,
            message: "User ID terlalu pendek".to_string(),
            data: Some(CheckIdResponse {
                is_valid: false,
                nickname: None,
                message: "User ID minimal 4 karakter".to_string(),
            }),
        }));
    }

    // Deterministic mock gamer tag generation based on ID digits
    let seed_num: usize = user_id.chars().filter_map(|c| c.to_digit(10)).sum::<u32>() as usize;
    let prefixes = ["NazilahPro", "ShadowHunter", "ApexStriker", "MythicGlory", "StarLord", "Valkyrie", "ZeroCold", "Phoenix"];
    let prefix = prefixes[seed_num % prefixes.len()];
    let suffix = (seed_num * 17) % 999;
    let mock_nickname = format!("{}_{}", prefix, suffix);

    Ok(Json(ApiResponse {
        success: true,
        message: "Akun game terverifikasi".to_string(),
        data: Some(CheckIdResponse {
            is_valid: true,
            nickname: Some(mock_nickname),
            message: "Nickname berhasil diverifikasi otomatis".to_string(),
        }),
    }))
}

// 6. Create Order
pub async fn create_order(
    State(pool): State<DbPool>,
    Json(payload): Json<CreateOrderRequest>,
) -> Result<Json<ApiResponse<Transaction>>, StatusCode> {
    let conn = pool.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Fetch SKU price
    let mut sku_stmt = conn
        .prepare("SELECT name, selling_price, discount_price FROM product_skus WHERE sku_code = ?1")
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let (sku_name, selling_price, discount_price): (String, i64, Option<i64>) = sku_stmt
        .query_row(params![payload.sku_code], |row| {
            Ok((row.get(0)?, row.get(1)?, row.get(2)?))
        })
        .map_err(|_| StatusCode::BAD_REQUEST)?;

    // Fetch payment channel fee
    let mut pay_stmt = conn
        .prepare("SELECT name, fee_flat, fee_percent FROM payment_channels WHERE code = ?1")
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let (_pay_name, fee_flat, fee_percent): (String, i64, f64) = pay_stmt
        .query_row(params![payload.payment_code], |row| {
            Ok((row.get(0)?, row.get(1)?, row.get(2)?))
        })
        .map_err(|_| StatusCode::BAD_REQUEST)?;

    let base_price = discount_price.unwrap_or(selling_price);
    let mut promo_discount = 0;
    if let Some(code) = &payload.promo_code {
        if code.to_uppercase() == "NAZILAHPRO" || code.to_uppercase() == "FLASH2026" {
            promo_discount = (base_price as f64 * 0.05) as i64; // 5% discount
        }
    }

    let calculated_fee = fee_flat + ((base_price as f64) * fee_percent) as i64;
    let total_amount = base_price - promo_discount + calculated_fee;

    // Generate Invoice ID: NZL-YYYYMMDD-XXXX
    let today = Utc::now().format("%Y%m%d").to_string();
    let rand_code: String = rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(4)
        .map(char::from)
        .collect::<String>()
        .to_uppercase();
    let invoice_id = format!("NZL-{}-{}", today, rand_code);

    let nickname = payload.target_nickname.unwrap_or_else(|| "GamerPlayer".to_string());
    let now = Utc::now();
    let expires = now + Duration::hours(2);

    let payment_reference = match payload.payment_code.as_str() {
        "BCA_VA" => Some(format!("880812{}", payload.whatsapp_number.chars().take(8).collect::<String>())),
        "BRI_VA" => Some(format!("129088{}", payload.whatsapp_number.chars().take(8).collect::<String>())),
        "MANDIRI_VA" => Some(format!("893201{}", payload.whatsapp_number.chars().take(8).collect::<String>())),
        "ALFAMART" | "INDOMARET" => Some(format!("NZL{}", rand::thread_rng().gen_range(1000000..9999999))),
        _ => None,
    };

    let qr_string = if payload.payment_code == "QRIS" {
        Some(format!("00020101021226590014ID.LINKAJA.WWW011893600911002{}0215ID10200215882153033605802ID5913NAZILAH STORE6007JAKARTA61051011062070703A01630488F2", invoice_id))
    } else {
        None
    };

    conn.execute(
        "INSERT INTO transactions (invoice_id, game_slug, sku_code, sku_name, target_user_id, target_zone_id, target_nickname, whatsapp_number, payment_code, payment_reference, qr_string, amount_item, amount_discount, amount_fee, amount_total, status, sn_number, created_at, expires_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, 'PENDING', NULL, ?16, ?17)",
        params![
            invoice_id,
            payload.game_slug,
            payload.sku_code,
            sku_name,
            payload.target_user_id,
            payload.target_zone_id,
            nickname,
            payload.whatsapp_number,
            payload.payment_code,
            payment_reference,
            qr_string,
            base_price,
            promo_discount,
            calculated_fee,
            total_amount,
            now.to_rfc3339(),
            expires.to_rfc3339()
        ],
    )
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let transaction = Transaction {
        invoice_id,
        game_slug: payload.game_slug,
        sku_code: payload.sku_code,
        sku_name,
        target_user_id: payload.target_user_id,
        target_zone_id: payload.target_zone_id,
        target_nickname: nickname,
        whatsapp_number: payload.whatsapp_number,
        payment_code: payload.payment_code,
        payment_reference,
        qr_string,
        amount_item: base_price,
        amount_discount: promo_discount,
        amount_fee: calculated_fee,
        amount_total: total_amount,
        status: "PENDING".to_string(),
        sn_number: None,
        created_at: now,
        expires_at: expires,
    };

    Ok(Json(ApiResponse {
        success: true,
        message: "Invoice berhasil dibuat".to_string(),
        data: Some(transaction),
    }))
}

// 7. Get Order by Invoice ID
pub async fn get_order(
    State(pool): State<DbPool>,
    Path(invoice_id): Path<String>,
) -> Result<Json<ApiResponse<Transaction>>, StatusCode> {
    let conn = pool.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let mut stmt = conn
        .prepare("SELECT invoice_id, game_slug, sku_code, sku_name, target_user_id, target_zone_id, target_nickname, whatsapp_number, payment_code, payment_reference, qr_string, amount_item, amount_discount, amount_fee, amount_total, status, sn_number, created_at, expires_at FROM transactions WHERE invoice_id = ?1")
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let tx = stmt
        .query_row(params![invoice_id], |row| {
            let created_str: String = row.get(17)?;
            let expires_str: String = row.get(18)?;
            Ok(Transaction {
                invoice_id: row.get(0)?,
                game_slug: row.get(1)?,
                sku_code: row.get(2)?,
                sku_name: row.get(3)?,
                target_user_id: row.get(4)?,
                target_zone_id: row.get(5)?,
                target_nickname: row.get(6)?,
                whatsapp_number: row.get(7)?,
                payment_code: row.get(8)?,
                payment_reference: row.get(9)?,
                qr_string: row.get(10)?,
                amount_item: row.get(11)?,
                amount_discount: row.get(12)?,
                amount_fee: row.get(13)?,
                amount_total: row.get(14)?,
                status: row.get(15)?,
                sn_number: row.get(16)?,
                created_at: chrono::DateTime::parse_from_rfc3339(&created_str)
                    .unwrap_or_default()
                    .with_timezone(&Utc),
                expires_at: chrono::DateTime::parse_from_rfc3339(&expires_str)
                    .unwrap_or_default()
                    .with_timezone(&Utc),
            })
        })
        .map_err(|_| StatusCode::NOT_FOUND)?;

    Ok(Json(ApiResponse {
        success: true,
        message: "Invoice ditemukan".to_string(),
        data: Some(tx),
    }))
}

#[derive(Deserialize)]
pub struct SearchQuery {
    pub q: String,
}

// 8. Search Orders by Invoice or WhatsApp
pub async fn search_orders(
    State(pool): State<DbPool>,
    Query(query): Query<SearchQuery>,
) -> Result<Json<ApiResponse<Vec<Transaction>>>, StatusCode> {
    let conn = pool.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let q = query.q.trim();
    let mut stmt = conn
        .prepare(
            "SELECT invoice_id, game_slug, sku_code, sku_name, target_user_id, target_zone_id, target_nickname, whatsapp_number, payment_code, payment_reference, qr_string, amount_item, amount_discount, amount_fee, amount_total, status, sn_number, created_at, expires_at
             FROM transactions
             WHERE invoice_id LIKE ?1 OR whatsapp_number LIKE ?1
             ORDER BY created_at DESC LIMIT 10",
        )
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let search_pattern = format!("%{}%", q);
    let txs = stmt
        .query_map(params![search_pattern], |row| {
            let created_str: String = row.get(17)?;
            let expires_str: String = row.get(18)?;
            Ok(Transaction {
                invoice_id: row.get(0)?,
                game_slug: row.get(1)?,
                sku_code: row.get(2)?,
                sku_name: row.get(3)?,
                target_user_id: row.get(4)?,
                target_zone_id: row.get(5)?,
                target_nickname: row.get(6)?,
                whatsapp_number: row.get(7)?,
                payment_code: row.get(8)?,
                payment_reference: row.get(9)?,
                qr_string: row.get(10)?,
                amount_item: row.get(11)?,
                amount_discount: row.get(12)?,
                amount_fee: row.get(13)?,
                amount_total: row.get(14)?,
                status: row.get(15)?,
                sn_number: row.get(16)?,
                created_at: chrono::DateTime::parse_from_rfc3339(&created_str)
                    .unwrap_or_default()
                    .with_timezone(&Utc),
                expires_at: chrono::DateTime::parse_from_rfc3339(&expires_str)
                    .unwrap_or_default()
                    .with_timezone(&Utc),
            })
        })
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .filter_map(Result::ok)
        .collect::<Vec<_>>();

    Ok(Json(ApiResponse {
        success: true,
        message: format!("Ditemukan {} pesanan", txs.len()),
        data: Some(txs),
    }))
}

// 9. Simulate payment completion (Interactive demo action)
pub async fn pay_order(
    State(pool): State<DbPool>,
    Path(invoice_id): Path<String>,
) -> Result<Json<ApiResponse<Transaction>>, StatusCode> {
    let sn = format!("SN-H2H-{}", rand::thread_rng().gen_range(100000000..999999999));

    {
        let conn = pool.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        conn.execute(
            "UPDATE transactions SET status = 'SUCCESS', sn_number = ?1 WHERE invoice_id = ?2",
            params![sn, invoice_id],
        )
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    }

    get_order(State(pool.clone()), Path(invoice_id)).await
}

#[derive(Deserialize)]
pub struct WinrateQuery {
    pub total_matches: i64,
    pub current_wr: f64,
    pub target_wr: f64,
}

// 10. MLBB Winrate Calculator
pub async fn calc_winrate(Query(q): Query<WinrateQuery>) -> Json<serde_json::Value> {
    let total = q.total_matches as f64;
    let curr_wr = q.current_wr;
    let target_wr = q.target_wr;

    if target_wr <= curr_wr || target_wr >= 100.0 {
        return Json(serde_json::json!({
            "success": false,
            "message": "Target winrate harus lebih tinggi dari winrate saat ini dan kurang dari 100%"
        }));
    }

    let current_wins = total * (curr_wr / 100.0);
    // (current_wins + x) / (total + x) = target_wr / 100
    // current_wins + x = (target_wr / 100) * total + (target_wr / 100) * x
    // x * (1 - target_wr / 100) = (target_wr / 100) * total - current_wins
    let wins_needed = ((target_wr / 100.0) * total - current_wins) / (1.0 - target_wr / 100.0);
    let wins_needed_rounded = wins_needed.ceil() as i64;

    Json(serde_json::json!({
        "success": true,
        "total_matches": q.total_matches,
        "current_wr": curr_wr,
        "target_wr": target_wr,
        "wins_needed": wins_needed_rounded,
        "message": format!("Anda memerlukan {} kemenangan beruntun tanpa kalah untuk mencapai winrate {}%", wins_needed_rounded, target_wr)
    }))
}

// 11. Send OTP (WhatsApp or Email)
pub async fn send_otp(
    State(pool): State<DbPool>,
    Json(payload): Json<SendOtpRequest>,
) -> Result<Json<ApiResponse<String>>, StatusCode> {
    let conn = pool.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let target = payload.target.trim().to_string();

    if target.is_empty() {
        return Ok(Json(ApiResponse {
            success: false,
            message: "Target nomor WhatsApp atau email wajib diisi".to_string(),
            data: None,
        }));
    }

    // Generate 6-digit OTP code (e.g. 842910)
    let otp_code = format!("{:06}", rand::thread_rng().gen_range(100000..999999));
    let expires = (Utc::now() + Duration::minutes(5)).to_rfc3339();

    conn.execute(
        "INSERT OR REPLACE INTO otps (phone_or_email, otp_code, expires_at) VALUES (?1, ?2, ?3)",
        params![target, otp_code, expires],
    )
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    println!("📱 [SIMULASI GATEWAY WHATSAPP] Kode OTP untuk {} adalah: {}", target, otp_code);

    Ok(Json(ApiResponse {
        success: true,
        message: format!("Kode OTP 6-digit berhasil dikirimkan via WhatsApp ke {}", target),
        data: Some(otp_code), // returned for easy testing & demo!
    }))
}

// 12. Register User (Member & Reseller)
pub async fn register_user(
    State(pool): State<DbPool>,
    Json(payload): Json<RegisterRequest>,
) -> Result<Json<ApiResponse<AuthResponse>>, StatusCode> {
    let conn = pool.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let target = payload.whatsapp.trim().to_string();
    let otp_input = payload.otp_code.trim();

    // Verify OTP (accept 842910 as master demo OTP or exact match)
    if otp_input != "842910" {
        let mut otp_stmt = conn
            .prepare("SELECT otp_code, expires_at FROM otps WHERE phone_or_email = ?1")
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

        let (stored_otp, expires_str): (String, String) = otp_stmt
            .query_row(params![target], |row| Ok((row.get(0)?, row.get(1)?)))
            .map_err(|_| StatusCode::BAD_REQUEST)?;

        if stored_otp != otp_input {
            return Ok(Json(ApiResponse {
                success: false,
                message: "Kode OTP verifikasi tidak sesuai".to_string(),
                data: None,
            }));
        }

        if let Ok(exp) = chrono::DateTime::parse_from_rfc3339(&expires_str) {
            if exp.with_timezone(&Utc) < Utc::now() {
                return Ok(Json(ApiResponse {
                    success: false,
                    message: "Kode OTP telah kadaluarsa. Silakan kirim ulang".to_string(),
                    data: None,
                }));
            }
        }
    }

    let user_id = format!("USR-{}", rand::thread_rng().gen_range(100000..999999));
    let role = payload.role.unwrap_or_else(|| "member".to_string());
    let now = Utc::now().to_rfc3339();

    let res = conn.execute(
        "INSERT INTO users (id, name, username, whatsapp, email, password_hash, role, balance, referral_code, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 0, ?8, ?9)",
        params![
            user_id,
            payload.name.trim(),
            payload.username.trim().to_lowercase(),
            payload.whatsapp.trim(),
            payload.email.trim().to_lowercase(),
            payload.password,
            role,
            payload.referral_code,
            now
        ],
    );

    if res.is_err() {
        return Ok(Json(ApiResponse {
            success: false,
            message: "Username, WhatsApp, atau Email sudah terdaftar".to_string(),
            data: None,
        }));
    }

    let user = User {
        id: user_id,
        name: payload.name,
        username: payload.username,
        whatsapp: payload.whatsapp,
        email: payload.email,
        role,
        balance: 0,
        referral_code: payload.referral_code,
        created_at: now,
    };

    Ok(Json(ApiResponse {
        success: true,
        message: "Akun Nazilah Store berhasil didaftarkan".to_string(),
        data: Some(AuthResponse {
            token: format!("nzl_jwt_{}", rand::thread_rng().gen_range(10000000..99999999)),
            user,
        }),
    }))
}

// 13. Login User (Password or WhatsApp OTP)
pub async fn login_user(
    State(pool): State<DbPool>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<ApiResponse<AuthResponse>>, StatusCode> {
    let conn = pool.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let auth_id = payload.auth_id.trim();

    let mut stmt = conn
        .prepare("SELECT id, name, username, whatsapp, email, password_hash, role, balance, referral_code, created_at FROM users WHERE whatsapp = ?1 OR email = ?1 OR username = ?1")
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let user_row = stmt.query_row(params![auth_id], |row| {
        Ok((
            User {
                id: row.get(0)?,
                name: row.get(1)?,
                username: row.get(2)?,
                whatsapp: row.get(3)?,
                email: row.get(4)?,
                role: row.get(6)?,
                balance: row.get(7)?,
                referral_code: row.get(8)?,
                created_at: row.get(9)?,
            },
            row.get::<_, String>(5)?,
        ))
    });

    let (user, password_hash) = match user_row {
        Ok(data) => data,
        Err(_) => {
            return Ok(Json(ApiResponse {
                success: false,
                message: "Akun dengan WhatsApp / Email tersebut tidak ditemukan".to_string(),
                data: None,
            }));
        }
    };

    if payload.login_type == "otp" {
        let otp_input = payload.otp_code.as_deref().unwrap_or("").trim();
        if otp_input != "842910" {
            let mut otp_stmt = conn
                .prepare("SELECT otp_code, expires_at FROM otps WHERE phone_or_email = ?1 OR phone_or_email = ?2")
                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

            let (stored_otp, _): (String, String) = otp_stmt
                .query_row(params![user.whatsapp, user.email], |row| Ok((row.get(0)?, row.get(1)?)))
                .map_err(|_| StatusCode::BAD_REQUEST)?;

            if stored_otp != otp_input {
                return Ok(Json(ApiResponse {
                    success: false,
                    message: "Kode OTP verifikasi tidak cocok".to_string(),
                    data: None,
                }));
            }
        }
    } else {
        // Password check
        let password_input = payload.password.as_deref().unwrap_or("");
        if password_input != password_hash {
            return Ok(Json(ApiResponse {
                success: false,
                message: "Kata sandi yang Anda masukkan salah".to_string(),
                data: None,
            }));
        }
    }

    Ok(Json(ApiResponse {
        success: true,
        message: "Berhasil masuk ke akun Nazilah Store".to_string(),
        data: Some(AuthResponse {
            token: format!("nzl_jwt_{}", rand::thread_rng().gen_range(10000000..99999999)),
            user,
        }),
    }))
}

// 14. Reset Password
pub async fn reset_password(
    State(pool): State<DbPool>,
    Json(payload): Json<ResetPasswordRequest>,
) -> Result<Json<ApiResponse<String>>, StatusCode> {
    let conn = pool.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let target = payload.target.trim();
    let otp_input = payload.otp_code.trim();

    if otp_input != "842910" {
        let mut otp_stmt = conn
            .prepare("SELECT otp_code FROM otps WHERE phone_or_email = ?1")
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

        let stored_otp: String = otp_stmt
            .query_row(params![target], |row| row.get(0))
            .map_err(|_| StatusCode::BAD_REQUEST)?;

        if stored_otp != otp_input {
            return Ok(Json(ApiResponse {
                success: false,
                message: "Kode OTP verifikasi tidak valid".to_string(),
                data: None,
            }));
        }
    }

    let updated = conn.execute(
        "UPDATE users SET password_hash = ?1 WHERE whatsapp = ?2 OR email = ?2",
        params![payload.new_password, target],
    )
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if updated == 0 {
        return Ok(Json(ApiResponse {
            success: false,
            message: "Akun target tidak ditemukan".to_string(),
            data: None,
        }));
    }

    Ok(Json(ApiResponse {
        success: true,
        message: "Kata sandi baru berhasil diperbarui. Silakan login kembali.".to_string(),
        data: Some("PASSWORD_UPDATED".to_string()),
    }))
}
