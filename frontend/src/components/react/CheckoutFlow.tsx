import { useState, useEffect, useMemo } from 'react';

export interface Game {
  slug: string;
  name: string;
  publisher: string;
  category: string;
  cover_url: string;
  banner_url: string;
  currency_name: string;
  currency_icon: string;
  requires_zone: boolean;
  zone_label?: string;
  id_hint: string;
  is_active: boolean;
}

export interface ProductSku {
  sku_code: string;
  game_slug: string;
  name: string;
  category: string;
  base_cost: number;
  selling_price: number;
  discount_price?: number;
  stock_quota?: number;
  is_available: boolean;
}

export interface PaymentChannel {
  code: string;
  name: string;
  group_type: string;
  fee_flat: number;
  fee_percent: number;
  logo_url: string;
  is_active: boolean;
}

interface Props {
  game: Game;
  skus: ProductSku[];
  paymentChannels: PaymentChannel[];
  initialSku?: string;
}

export default function CheckoutFlow({ game, skus, paymentChannels, initialSku }: Props) {
  // Step 1: Account
  const [userId, setUserId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [nickname, setNickname] = useState<string | null>(null);
  const [isCheckingId, setIsCheckingId] = useState(false);
  const [idError, setIdError] = useState<string | null>(null);

  // Step 2: SKU selection
  const [selectedSku, setSelectedSku] = useState<ProductSku | null>(() => {
    if (initialSku) {
      return skus.find((s) => s.sku_code === initialSku) || skus[0] || null;
    }
    return skus[0] || null;
  });
  const [skuCategory, setSkuCategory] = useState<string>('all');

  // Step 3: Payment
  const [selectedPayment, setSelectedPayment] = useState<PaymentChannel>(() => {
    return paymentChannels.find((p) => p.code === 'QRIS') || paymentChannels[0];
  });

  // Step 4: Contact & Promo
  const [whatsapp, setWhatsapp] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Debounced ID verification
  useEffect(() => {
    if (userId.trim().length < 4) {
      setNickname(null);
      setIdError(null);
      return;
    }

    setIsCheckingId(true);
    setIdError(null);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/v1/game/check-id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            game_slug: game.slug,
            user_id: userId,
            zone_id: game.requires_zone ? zoneId : null,
          }),
        });
        const json = await res.json();
        if (json.success && json.data?.is_valid) {
          setNickname(json.data.nickname);
          setIdError(null);
        } else {
          setNickname(null);
          setIdError(json.data?.message || 'ID tidak valid');
        }
      } catch (err) {
        setNickname(`Player_${userId.slice(-4)}`);
      } finally {
        setIsCheckingId(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [userId, zoneId, game.slug, game.requires_zone]);

  // Apply promo code
  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'NAZILAHPRO' || code === 'FLASH2026') {
      const base = selectedSku?.discount_price || selectedSku?.selling_price || 0;
      const disc = Math.round(base * 0.05);
      setPromoDiscount(disc);
      setPromoMessage(`✓ Voucher ${code} aktif! Diskon 5% (Rp${disc.toLocaleString('id-ID')})`);
    } else if (code) {
      setPromoDiscount(0);
      setPromoMessage('✕ Kode voucher tidak valid atau sudah kadaluarsa');
    }
  };

  // Price calculations
  const priceCalculation = useMemo(() => {
    const itemPrice = selectedSku ? selectedSku.discount_price || selectedSku.selling_price : 0;
    const fee = selectedPayment
      ? selectedPayment.fee_flat + Math.round(itemPrice * selectedPayment.fee_percent)
      : 0;
    const total = Math.max(0, itemPrice - promoDiscount + fee);
    return { itemPrice, fee, total };
  }, [selectedSku, selectedPayment, promoDiscount]);

  // Handle Order Submission
  const handleSubmitOrder = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!userId.trim()) {
      alert('Mohon masukkan ID Game Anda terlebih dahulu');
      return;
    }
    if (game.requires_zone && !zoneId.trim()) {
      alert('Mohon masukkan Zone ID / Server');
      return;
    }
    if (!selectedSku) {
      alert('Mohon pilih nominal top-up');
      return;
    }
    if (!whatsapp.trim() || whatsapp.trim().length < 9) {
      alert('Mohon masukkan Nomor WhatsApp yang valid untuk menerima bukti pembayaran');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_slug: game.slug,
          sku_code: selectedSku.sku_code,
          target_user_id: userId,
          target_zone_id: game.requires_zone ? zoneId : null,
          target_nickname: nickname || 'GamerPlayer',
          whatsapp_number: whatsapp,
          payment_code: selectedPayment.code,
          promo_code: promoCode || null,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        window.location.href = `/invoice/${json.data.invoice_id}`;
      } else {
        setSubmitError(json.message || 'Gagal membuat pesanan');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Terjadi kesalahan sistem saat menghubungi backend');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Grouped SKUs
  const filteredSkus = useMemo(() => {
    if (skuCategory === 'all') return skus;
    return skus.filter((s) => s.category === skuCategory);
  }, [skus, skuCategory]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* LEFT COLUMN: Game Card & Sticky Summary (Lg: 4 Cols) */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-[#181b25] border border-[#262a34] rounded-2xl overflow-hidden p-6 shadow-xl">
          <div className="aspect-[16/9] w-full rounded-xl overflow-hidden mb-5 bg-[#0a0e17] relative">
            <img src={game.banner_url} alt={game.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#181b25] via-transparent to-transparent"></div>
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#10b981] text-white text-[11px] font-bold">
                100% RESMI
              </span>
              <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[#4edea3] text-[11px] font-mono">
                {game.currency_icon} {game.currency_name}
              </span>
            </div>
          </div>

          <h1 className="text-xl font-extrabold text-white mb-1">{game.name}</h1>
          <p className="text-xs text-[#94a3b8] mb-4">{game.publisher}</p>

          <div className="space-y-2.5 text-xs text-[#94a3b8] border-t border-[#262a34] pt-4">
            <div className="flex items-center gap-2 text-[#4edea3]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
              <span>Proses Pengiriman Otomatis 1-3 Detik</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>Layanan Aktif 24 Jam Nonstop</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>Metode Pembayaran QRIS & VA Lengkap</span>
            </div>
          </div>
        </div>

        {/* Desktop Sticky Summary Preview */}
        <div className="hidden lg:block bg-[#181b25] border border-[#262a34] rounded-2xl p-6 shadow-xl sticky top-24">
          <h3 className="text-sm font-bold text-white mb-4 pb-2 border-b border-[#262a34] flex items-center justify-between">
            <span>Ringkasan Pesanan</span>
            <span className="text-[10px] font-mono text-[#10b981]">SINGLE-PAGE</span>
          </h3>

          <div className="space-y-3 text-xs mb-5">
            <div className="flex justify-between">
              <span className="text-[#94a3b8]">Target Akun:</span>
              <span className="font-semibold text-white">
                {nickname ? (
                  <span className="text-[#4edea3]">{nickname}</span>
                ) : userId ? (
                  `${userId} ${zoneId ? `(${zoneId})` : ''}`
                ) : (
                  <span className="text-[#64748b]">Belum diisi</span>
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#94a3b8]">Item Top Up:</span>
              <span className="font-semibold text-white text-right max-w-[180px] truncate">
                {selectedSku?.name || <span className="text-[#64748b]">Pilih item</span>}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#94a3b8]">Metode Bayar:</span>
              <span className="font-semibold text-white">{selectedPayment?.name}</span>
            </div>

            {promoDiscount > 0 && (
              <div className="flex justify-between text-amber-400">
                <span>Diskon Promo:</span>
                <span className="font-mono-numbers">-Rp{promoDiscount.toLocaleString('id-ID')}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-[#94a3b8]">Biaya Layanan:</span>
              <span className="font-mono-numbers text-white">
                Rp{priceCalculation.fee.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="border-t border-[#262a34] pt-3 flex justify-between items-baseline">
              <span className="font-bold text-white">Total Tagihan:</span>
              <span className="text-lg font-extrabold text-[#4edea3] font-mono-numbers">
                Rp{priceCalculation.total.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <button
            onClick={handleSubmitOrder}
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-extrabold text-sm transition-all shadow-lg shadow-[#10b981]/25 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Memproses Pesanan...</span>
            ) : (
              <>
                <span>Beli Sekarang</span>
                <span>&rarr;</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: 4-Step Interactive Checkout Flow (Lg: 8 Cols) */}
      <div className="lg:col-span-8 space-y-6">
        {/* STEP 1: Account Info */}
        <div className="bg-[#181b25] border border-[#262a34] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-7 h-7 rounded-lg bg-[#10b981] text-white font-bold flex items-center justify-center text-xs">
              1
            </span>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Masukkan Data Akun Game
              </h2>
              <p className="text-xs text-[#94a3b8]">{game.id_hint}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#dfe2ef] mb-1.5">
                User ID / Player ID <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Contoh: 12345678"
                className="w-full bg-[#0f131c] border border-[#262a34] focus:border-[#10b981] rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder-[#64748b] outline-none transition"
              />
            </div>

            {game.requires_zone && (
              <div>
                <label className="block text-xs font-semibold text-[#dfe2ef] mb-1.5">
                  {game.zone_label || 'Zone ID'} <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  placeholder="Contoh: 2024"
                  className="w-full bg-[#0f131c] border border-[#262a34] focus:border-[#10b981] rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder-[#64748b] outline-none transition"
                />
              </div>
            )}
          </div>

          {/* Verification Badge */}
          <div className="mt-4">
            {isCheckingId && (
              <div className="flex items-center gap-2 text-xs text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <span>Memverifikasi akun ke server game...</span>
              </div>
            )}

            {!isCheckingId && nickname && (
              <div className="p-3 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 flex items-center gap-2 text-xs text-[#4edea3]">
                <span className="font-bold">✓ Akun Terverifikasi:</span>
                <span className="font-extrabold font-mono text-white">{nickname}</span>
              </div>
            )}

            {!isCheckingId && idError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
                {idError}
              </div>
            )}
          </div>
        </div>

        {/* STEP 2: Choose SKU Nominal */}
        <div className="bg-[#181b25] border border-[#262a34] rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-[#10b981] text-white font-bold flex items-center justify-center text-xs">
                2
              </span>
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Pilih Nominal Top Up
                </h2>
                <p className="text-xs text-[#94a3b8]">Pilih item diamond atau pass membership</p>
              </div>
            </div>

            {/* Sku Category Tabs */}
            <div className="flex items-center gap-1.5">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'pass', label: 'Membership / Pass' },
                { id: 'instant', label: 'Top Up Instan' },
                { id: 'special', label: 'Paket Spesial' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSkuCategory(tab.id)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition ${
                    skuCategory === tab.id
                      ? 'bg-[#10b981] text-white'
                      : 'bg-[#0f131c] text-[#94a3b8] hover:text-white border border-[#262a34]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sku Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredSkus.map((sku) => {
              const isSelected = selectedSku?.sku_code === sku.sku_code;
              const hasDiscount = !!sku.discount_price;
              const price = sku.discount_price || sku.selling_price;

              return (
                <button
                  key={sku.sku_code}
                  type="button"
                  onClick={() => setSelectedSku(sku)}
                  className={`relative p-3.5 rounded-xl text-left border transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#1c1f29] border-[#10b981] ring-1 ring-[#10b981] shadow-lg shadow-[#10b981]/15'
                      : 'bg-[#0f131c] border-[#262a34] hover:border-[#3c4a42] hover:bg-[#181b25]'
                  }`}
                >
                  {hasDiscount && (
                    <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500 text-white shadow">
                      FLASH SALE
                    </span>
                  )}

                  <div className="mb-2">
                    <span className="text-[10px] text-[#4edea3] font-mono block">
                      {game.currency_icon} {sku.category.toUpperCase()}
                    </span>
                    <h4 className="text-xs font-bold text-white line-clamp-2 mt-0.5">{sku.name}</h4>
                  </div>

                  <div className="mt-2 pt-2 border-t border-[#262a34] w-full flex items-baseline justify-between">
                    <div>
                      <div className="text-xs font-extrabold text-[#4edea3] font-mono-numbers">
                        Rp{price.toLocaleString('id-ID')}
                      </div>
                      {hasDiscount && (
                        <div className="text-[10px] text-[#64748b] line-through font-mono-numbers">
                          Rp{sku.selling_price.toLocaleString('id-ID')}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-[#10b981] text-white flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 3: Payment Method */}
        <div className="bg-[#181b25] border border-[#262a34] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-7 h-7 rounded-lg bg-[#10b981] text-white font-bold flex items-center justify-center text-xs">
              3
            </span>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Pilih Metode Pembayaran
              </h2>
              <p className="text-xs text-[#94a3b8]">Pembayaran otomatis diverifikasi sistem dalam 3 detik</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {paymentChannels.map((pay) => {
              const isSelected = selectedPayment?.code === pay.code;
              const itemBase = selectedSku?.discount_price || selectedSku?.selling_price || 0;
              const fee = pay.fee_flat + Math.round(itemBase * pay.fee_percent);
              const totalForThisPay = itemBase - promoDiscount + fee;

              return (
                <button
                  key={pay.code}
                  type="button"
                  onClick={() => setSelectedPayment(pay)}
                  className={`p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#1c1f29] border-[#10b981] ring-1 ring-[#10b981]'
                      : 'bg-[#0f131c] border-[#262a34] hover:border-[#3c4a42]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-xs text-white font-mono">{pay.code}</span>
                    <span className="text-[10px] text-[#94a3b8] uppercase">{pay.group_type}</span>
                  </div>

                  <p className="text-[11px] text-[#dfe2ef] line-clamp-1 mb-2">{pay.name}</p>

                  <div className="pt-2 border-t border-[#262a34] flex items-center justify-between text-[11px]">
                    <span className="text-[#94a3b8] text-[10px]">Total:</span>
                    <span className="font-extrabold text-[#4edea3] font-mono-numbers">
                      Rp{totalForThisPay.toLocaleString('id-ID')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 4: Contact & Promo Voucher */}
        <div className="bg-[#181b25] border border-[#262a34] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-7 h-7 rounded-lg bg-[#10b981] text-white font-bold flex items-center justify-center text-xs">
              4
            </span>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Kontak & Kode Promo
              </h2>
              <p className="text-xs text-[#94a3b8]">Bukti transaksi dan invoice otomatis dikirimkan via WhatsApp</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#dfe2ef] mb-1.5">
                Nomor WhatsApp Aktif <span className="text-rose-400">*</span>
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full bg-[#0f131c] border border-[#262a34] focus:border-[#10b981] rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder-[#64748b] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#dfe2ef] mb-1.5">
                Kode Promo (Opsional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Gunakan: NAZILAHPRO"
                  className="w-full bg-[#0f131c] border border-[#262a34] focus:border-[#10b981] rounded-xl px-4 py-2.5 text-xs text-white uppercase font-mono placeholder-[#64748b] outline-none transition"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-4 py-2.5 rounded-xl bg-[#262a34] hover:bg-[#3c4a42] text-white text-xs font-bold transition"
                >
                  Pakai
                </button>
              </div>
            </div>
          </div>

          {promoMessage && (
            <div className={`mt-3 text-xs ${promoDiscount > 0 ? 'text-[#4edea3]' : 'text-rose-400'}`}>
              {promoMessage}
            </div>
          )}

          {submitError && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
              {submitError}
            </div>
          )}
        </div>

        {/* Mobile Sticky Bottom Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0f131c]/95 backdrop-blur-lg border-t border-[#1c1f29] p-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] text-[#94a3b8]">Total Bayar:</div>
            <div className="text-base font-extrabold text-[#4edea3] font-mono-numbers">
              Rp{priceCalculation.total.toLocaleString('id-ID')}
            </div>
          </div>

          <button
            onClick={handleSubmitOrder}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-bold text-xs transition shadow-lg shadow-[#10b981]/20 disabled:opacity-50"
          >
            {isSubmitting ? 'Memproses...' : 'Beli Sekarang &rarr;'}
          </button>
        </div>
      </div>
    </div>
  );
}

