#![allow(dead_code)]

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone)]
pub struct DigiflazzClient {
    pub username: String,
    pub api_key: String,
    pub is_testing: bool,
    client: reqwest::Client,
}

#[derive(Debug, Serialize)]
struct CekSaldoRequest {
    cmd: String,
    username: String,
    sign: String,
}

#[derive(Debug, Deserialize)]
pub struct DigiflazzResponse<T> {
    pub data: T,
}

#[derive(Debug, Deserialize)]
pub struct SaldoData {
    pub deposit: i64,
}

#[derive(Debug, Serialize)]
pub struct TopUpRequest {
    pub username: String,
    pub buyer_sku_code: String,
    pub customer_no: String,
    pub ref_id: String,
    pub sign: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub testing: Option<bool>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct TopUpResponseData {
    pub ref_id: String,
    pub customer_no: String,
    pub buyer_sku_code: String,
    pub message: String,
    pub status: String, // 'Sukses', 'Gagal', 'Pending'
    pub rc: String,
    pub sn: Option<String>,
    pub buyer_last_saldo: Option<i64>,
    pub price: Option<i64>,
}

impl DigiflazzClient {
    pub fn new() -> Self {
        let username = std::env::var("DIGIFLAZZ_USERNAME").unwrap_or_default();
        let api_key = std::env::var("DIGIFLAZZ_API_KEY").unwrap_or_default();
        let is_testing = std::env::var("DIGIFLAZZ_TESTING")
            .map(|v| v.to_lowercase() == "true")
            .unwrap_or(true);

        Self {
            username,
            api_key,
            is_testing,
            client: reqwest::Client::new(),
        }
    }

    /// Rumus sign cek saldo: md5(username + key + "depo")
    pub async fn check_balance(&self) -> Result<i64, String> {
        if self.username.is_empty() || self.api_key.is_empty() {
            return Err("Kredensial Digiflazz (DIGIFLAZZ_USERNAME / DIGIFLAZZ_API_KEY) belum diisi di .env".to_string());
        }

        let raw_sign = format!("{}{}depo", self.username, self.api_key);
        let sign = format!("{:x}", md5::compute(raw_sign.as_bytes()));

        let payload = CekSaldoRequest {
            cmd: "deposit".to_string(),
            username: self.username.clone(),
            sign,
        };

        let res = self
            .client
            .post("https://api.digiflazz.com/v1/cek-saldo")
            .json(&payload)
            .send()
            .await
            .map_err(|e| e.to_string())?;

        let body: DigiflazzResponse<SaldoData> = res.json().await.map_err(|e| e.to_string())?;
        Ok(body.data.deposit)
    }

    /// Rumus sign transaksi: md5(username + key + ref_id)
    pub async fn order_topup(
        &self,
        buyer_sku_code: &str,
        customer_no: &str,
        ref_id: &str,
    ) -> Result<TopUpResponseData, String> {
        if self.username.is_empty() || self.api_key.is_empty() {
            // Simulated response if credentials not set yet
            return Ok(TopUpResponseData {
                ref_id: ref_id.to_string(),
                customer_no: customer_no.to_string(),
                buyer_sku_code: buyer_sku_code.to_string(),
                message: "Transaksi simulasi berhasil (Mode Demo H2H)".to_string(),
                status: "Sukses".to_string(),
                rc: "00".to_string(),
                sn: Some(format!("SN-DFZ-{}", rand::random::<u32>())),
                buyer_last_saldo: Some(950000),
                price: Some(24500),
            });
        }

        let raw_sign = format!("{}{}{}", self.username, self.api_key, ref_id);
        let sign = format!("{:x}", md5::compute(raw_sign.as_bytes()));

        let payload = TopUpRequest {
            username: self.username.clone(),
            buyer_sku_code: buyer_sku_code.to_string(),
            customer_no: customer_no.to_string(),
            ref_id: ref_id.to_string(),
            sign,
            testing: if self.is_testing { Some(true) } else { None },
        };

        let res = self
            .client
            .post("https://api.digiflazz.com/v1/transaction")
            .json(&payload)
            .send()
            .await
            .map_err(|e| e.to_string())?;

        let body: DigiflazzResponse<TopUpResponseData> = res.json().await.map_err(|e| e.to_string())?;
        Ok(body.data)
    }
}
