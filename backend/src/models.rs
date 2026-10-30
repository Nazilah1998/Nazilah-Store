use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Game {
    pub slug: String,
    pub name: String,
    pub publisher: String,
    pub category: String, // 'populer', 'mobile', 'pc', 'voucher'
    pub cover_url: String,
    pub banner_url: String,
    pub currency_name: String,
    pub currency_icon: String,
    pub requires_zone: bool,
    pub zone_label: Option<String>,
    pub id_hint: String,
    pub is_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductSku {
    pub sku_code: String,
    pub game_slug: String,
    pub name: String,
    pub category: String, // 'pass', 'instant', 'special'
    pub base_cost: i64,
    pub selling_price: i64,
    pub discount_price: Option<i64>,
    pub stock_quota: Option<i64>,
    pub is_available: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaymentChannel {
    pub code: String,
    pub name: String,
    pub group_type: String, // 'qris', 'va', 'ewallet', 'retail'
    pub fee_flat: i64,
    pub fee_percent: f64,
    pub logo_url: String,
    pub is_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FlashSaleItem {
    pub sku_code: String,
    pub game_slug: String,
    pub game_name: String,
    pub item_name: String,
    pub original_price: i64,
    pub discount_price: i64,
    pub stock_left: i64,
    pub total_stock: i64,
    pub ends_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    pub invoice_id: String,
    pub game_slug: String,
    pub sku_code: String,
    pub sku_name: String,
    pub target_user_id: String,
    pub target_zone_id: Option<String>,
    pub target_nickname: String,
    pub whatsapp_number: String,
    pub payment_code: String,
    pub payment_reference: Option<String>,
    pub qr_string: Option<String>,
    pub amount_item: i64,
    pub amount_discount: i64,
    pub amount_fee: i64,
    pub amount_total: i64,
    pub status: String, // 'PENDING', 'PAID', 'PROCESSING', 'SUCCESS', 'FAILED', 'EXPIRED'
    pub sn_number: Option<String>,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
pub struct CheckIdRequest {
    pub game_slug: String,
    pub user_id: String,
    pub zone_id: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct CheckIdResponse {
    pub is_valid: bool,
    pub nickname: Option<String>,
    pub message: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateOrderRequest {
    pub game_slug: String,
    pub sku_code: String,
    pub target_user_id: String,
    pub target_zone_id: Option<String>,
    pub target_nickname: Option<String>,
    pub whatsapp_number: String,
    pub payment_code: String,
    pub promo_code: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub message: String,
    pub data: Option<T>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub name: String,
    pub username: String,
    pub whatsapp: String,
    pub email: String,
    pub role: String,
    pub balance: i64,
    pub referral_code: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub name: String,
    pub username: String,
    pub whatsapp: String,
    pub email: String,
    pub password: String,
    pub role: Option<String>,
    pub otp_code: String,
    pub referral_code: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub auth_id: String,
    pub password: Option<String>,
    pub otp_code: Option<String>,
    pub login_type: String,
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
pub struct SendOtpRequest {
    pub target: String,
    pub action: String,
}

#[derive(Debug, Deserialize)]
pub struct ResetPasswordRequest {
    pub target: String,
    pub otp_code: String,
    pub new_password: String,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub token: String,
    pub user: User,
}
