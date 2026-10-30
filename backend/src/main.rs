mod db;
mod digiflazz;
mod handlers;
mod models;

use axum::{
    routing::{get, post},
    Router,
};
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "nazilah_store_backend=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // 1. Initialize SQLite Database
    let db_path = std::env::var("DATABASE_URL").unwrap_or_else(|_| "nazilah_store.db".to_string());
    println!("Connecting to SQLite database at: {}", db_path);
    let pool = db::init_db(&db_path)?;

    // 2. Configure CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // 3. Build API Router
    let app = Router::new()
        // Health
        .route("/api/v1/health", get(handlers::health_check))
        // Catalog & Flash Sale
        .route("/api/v1/games", get(handlers::list_games))
        .route("/api/v1/games/{slug}", get(handlers::get_game_detail))
        .route("/api/v1/flash-sale", get(handlers::get_flash_sales))
        .route("/api/v1/payment-channels", get(handlers::get_payment_channels))
        // Account Verification
        .route("/api/v1/game/check-id", post(handlers::check_account_id))
        // Orders & Invoices
        .route("/api/v1/orders", post(handlers::create_order))
        .route("/api/v1/orders/{invoice_id}", get(handlers::get_order))
        .route("/api/v1/orders/{invoice_id}/pay", post(handlers::pay_order))
        .route("/api/v1/orders/search", get(handlers::search_orders))
        // Gaming Calculators
        .route("/api/v1/calculator/winrate", get(handlers::calc_winrate))
        // Authentication & Member System
        .route("/api/v1/auth/send-otp", post(handlers::send_otp))
        .route("/api/v1/auth/register", post(handlers::register_user))
        .route("/api/v1/auth/login", post(handlers::login_user))
        .route("/api/v1/auth/reset-password", post(handlers::reset_password))
        .layer(cors)
        .with_state(pool);

    let port: u16 = std::env::var("PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse()
        .unwrap_or(8080);

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    println!("🚀 Nazilah Store Backend (Rust + SQLite) listening on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
