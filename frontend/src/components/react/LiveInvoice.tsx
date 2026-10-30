import { useState, useEffect } from 'react';

export interface Transaction {
  invoice_id: string;
  game_slug: string;
  sku_code: string;
  sku_name: string;
  target_user_id: string;
  target_zone_id?: string;
  target_nickname: string;
  whatsapp_number: string;
  payment_code: string;
  payment_reference?: string;
  qr_string?: string;
  amount_item: number;
  amount_discount: number;
  amount_fee: number;
  amount_total: number;
  status: string;
  sn_number?: string;
  created_at: string;
  expires_at: string;
}

export default function LiveInvoice({ initialOrder }: { initialOrder: Transaction }) {
  const [order, setOrder] = useState<Transaction>(initialOrder);
  const [isSimulating, setIsSimulating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState('01:59:45');

  // Decrement countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        const parts = prev.split(':').map(Number);
        let [h, m, s] = parts;
        if (s > 0) s--;
        else if (m > 0) { m--; s = 59; }
        else if (h > 0) { h--; m = 59; s = 59; }
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll status every 5 seconds if pending
  useEffect(() => {
    if (order.status === 'SUCCESS') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/orders/${order.invoice_id}`);
        const json = await res.json();
        if (json.success && json.data) {
          setOrder(json.data);
        }
      } catch (err) {
        // quiet ignore
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [order.invoice_id, order.status]);

  // Demo payment simulation
  const handleSimulatePayment = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch(`/api/v1/orders/${order.invoice_id}/pay`, {
        method: 'POST',
      });
      const json = await res.json();
      if (json.success && json.data) {
        setOrder(json.data);
      }
    } catch (err) {
      alert('Gagal menyimulasikan pembayaran');
    } finally {
      setIsSimulating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSuccess = order.status === 'SUCCESS';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Status Alert Banner */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          isSuccess
            ? 'bg-[#10b981]/10 border-[#10b981]/40 text-[#4edea3]'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${
                isSuccess ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/25' : 'bg-amber-500 text-black'
              }`}
            >
              {isSuccess ? '✓' : '⏳'}
            </span>
            <div>
              <div className="text-[10px] font-mono tracking-widest uppercase font-bold text-white/60">
                STATUS TRANSAKSI
              </div>
              <h2 className="text-lg font-extrabold text-white">
                {isSuccess ? 'Pembayaran Berhasil & Top Up Sukses' : 'Menunggu Pembayaran'}
              </h2>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-[#94a3b8]">Nomor Invoice:</div>
            <div className="font-mono text-sm font-bold text-white flex items-center gap-1.5 justify-end">
              <span>{order.invoice_id}</span>
              <button
                onClick={() => copyToClipboard(order.invoice_id)}
                className="text-[#4edea3] hover:underline text-xs"
              >
                {copied ? 'Tersalin' : 'Salin'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Payment Details Box */}
      <div className="bg-[#181b25] border border-[#262a34] rounded-2xl p-6 sm:p-8 shadow-xl">
        {/* QRIS / VA Section */}
        {!isSuccess ? (
          <div className="text-center mb-8 pb-8 border-b border-[#262a34]">
            <div className="text-xs text-[#94a3b8] mb-2">Batas Waktu Pembayaran:</div>
            <div className="inline-block px-4 py-1.5 rounded-lg bg-[#0f131c] border border-amber-500/30 font-mono text-amber-400 font-extrabold text-sm mb-6">
              {countdown}
            </div>

            {order.payment_code === 'QRIS' ? (
              <div className="flex flex-col items-center">
                <div className="p-4 bg-white rounded-2xl shadow-2xl inline-block mb-3 border-4 border-[#10b981]">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                      order.qr_string || order.invoice_id
                    )}`}
                    alt="QRIS Nazilah Store"
                    className="w-52 h-52 object-contain"
                  />
                  <div className="text-center font-mono text-[10px] font-bold text-black mt-1">
                    QRIS RESMI NASIONAL
                  </div>
                </div>
                <p className="text-xs text-[#94a3b8] max-w-sm">
                  Pindai QR di atas menggunakan GoPay, OVO, DANA, ShopeePay, BCA Mobile, Livin Mandiri, atau aplikasi e-wallet lainnya.
                </p>
              </div>
            ) : (
              <div className="max-w-md mx-auto p-5 rounded-xl bg-[#0f131c] border border-[#262a34] text-left">
                <div className="text-xs text-[#94a3b8] mb-1">Nomor {order.payment_code}:</div>
                <div className="flex items-center justify-between gap-4 font-mono text-lg font-bold text-white mb-2">
                  <span>{order.payment_reference || '88081234567890'}</span>
                  <button
                    onClick={() => copyToClipboard(order.payment_reference || '88081234567890')}
                    className="px-3 py-1 rounded-lg bg-[#10b981] text-white text-xs font-sans font-bold hover:bg-[#059669] transition"
                  >
                    Salin
                  </button>
                </div>
                <p className="text-[11px] text-[#64748b]">
                  Transfer tepat sesuai nominal tagihan agar sistem otomatis melakukan konfirmasi tanpa bukti transfer manual.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center mb-8 pb-8 border-b border-[#262a34]">
            <div className="w-16 h-16 rounded-full bg-[#10b981]/20 border border-[#10b981] text-[#4edea3] flex items-center justify-center text-3xl mx-auto mb-3">
              ⚡
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Top-Up Telah Masuk ke Akun Game!</h3>
            <p className="text-xs text-[#94a3b8] max-w-md mx-auto mb-4">
              Item telah berhasil dikreditkan ke User ID <span className="text-white font-mono">{order.target_user_id}</span> ({order.target_nickname}). Silakan restart aplikasi game Anda.
            </p>

            {order.sn_number && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f131c] border border-[#10b981]/40 font-mono text-xs">
                <span className="text-[#94a3b8]">Serial Number (SN):</span>
                <span className="font-bold text-[#4edea3]">{order.sn_number}</span>
              </div>
            )}
          </div>
        )}

        {/* Invoice Item Breakdown */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Rincian Pembelian
          </h4>

          <div className="bg-[#0f131c] border border-[#262a34] rounded-xl p-4 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[#94a3b8]">Game:</span>
              <span className="font-semibold text-white uppercase">{order.game_slug.replace('-', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94a3b8]">Item Top Up:</span>
              <span className="font-semibold text-[#4edea3]">{order.sku_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94a3b8]">User ID / Akun:</span>
              <span className="font-mono text-white">
                {order.target_user_id} {order.target_zone_id ? `(${order.target_zone_id})` : ''} — {order.target_nickname}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94a3b8]">Metode Pembayaran:</span>
              <span className="font-semibold text-white">{order.payment_code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94a3b8]">Nomor WhatsApp:</span>
              <span className="font-mono text-white">{order.whatsapp_number}</span>
            </div>

            <div className="border-t border-[#262a34] pt-2.5 mt-2.5 space-y-1.5">
              <div className="flex justify-between text-[#94a3b8]">
                <span>Harga Produk:</span>
                <span className="font-mono-numbers">Rp{order.amount_item.toLocaleString('id-ID')}</span>
              </div>
              {order.amount_discount > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>Diskon Promo:</span>
                  <span className="font-mono-numbers">-Rp{order.amount_discount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between text-[#94a3b8]">
                <span>Biaya Layanan:</span>
                <span className="font-mono-numbers">Rp{order.amount_fee.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-[#262a34]">
                <span>Total Pembayaran:</span>
                <span className="text-[#4edea3] font-mono-numbers">
                  Rp{order.amount_total.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-8 pt-6 border-t border-[#262a34] flex flex-col sm:flex-row items-center justify-between gap-4">
          <a
            href="/"
            className="text-xs text-[#94a3b8] hover:text-white transition flex items-center gap-1"
          >
            &larr; Kembali ke Katalog
          </a>

          {!isSuccess && (
            <button
              onClick={handleSimulatePayment}
              disabled={isSimulating}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#10b981] hover:from-[#10b981] hover:to-[#059669] text-white text-xs font-bold transition shadow-lg shadow-[#10b981]/25 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>⚡</span>
              <span>{isSimulating ? 'Memverifikasi...' : 'Simulasikan Pembayaran Berhasil (Demo H2H)'}</span>
            </button>
          )}

          {isSuccess && (
            <a
              href={`https://wa.me/6281234567890?text=Halo%20Admin%20Nazilah%20Store,%20saya%20sudah%20topup%20invoice%20${order.invoice_id}`}
              target="_blank"
              className="px-5 py-2.5 rounded-xl bg-[#262a34] hover:bg-[#3c4a42] text-white text-xs font-bold transition flex items-center gap-2"
            >
              <span>Hubungi CS WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

