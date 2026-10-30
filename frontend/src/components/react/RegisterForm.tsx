import { useState, useEffect } from 'react';
import type { SyntheticEvent } from 'react';

export default function RegisterForm() {
  const [role, setRole] = useState<'member' | 'reseller'>('reseller');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSentMessage, setOtpSentMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Countdown timer for OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!whatsapp.trim() || whatsapp.trim().length < 9) {
      alert('Masukkan nomor WhatsApp yang valid terlebih dahulu');
      return;
    }
    setIsSendingOtp(true);
    setOtpSentMessage(null);
    try {
      const res = await fetch('/api/v1/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: whatsapp.trim(), action: 'register' }),
      });
      const json = await res.json();
      if (json.success) {
        setOtpSentMessage(json.message);
        setCountdown(60);
        if (json.data) setOtpCode(json.data); // auto-fill demo OTP
      } else {
        alert(json.message);
      }
    } catch (err: any) {
      alert('Gagal menghubungi gateway OTP: ' + err.message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleRegister = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !whatsapp.trim() || !email.trim() || !password) {
      setErrorMessage('Semua field bertanda * wajib diisi');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok');
      return;
    }
    if (!otpCode.trim()) {
      setErrorMessage('Silakan verifikasi kode OTP WhatsApp terlebih dahulu');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim(),
          whatsapp: whatsapp.trim(),
          email: email.trim(),
          password,
          role,
          otp_code: otpCode.trim(),
          referral_code: referralCode.trim() || null,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setSuccessMessage('✓ Akun berhasil dibuat! Mengalihkan ke halaman login...');
        localStorage.setItem('nazilah_token', json.data.token);
        localStorage.setItem('nazilah_user', JSON.stringify(json.data.user));
        setTimeout(() => {
          window.location.href = '/masuk';
        }, 1500);
      } else {
        setErrorMessage(json.message || 'Pendaftaran gagal');
      }
    } catch (err: any) {
      setErrorMessage('Terjadi kesalahan saat pendaftaran: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/30 text-[#4edea3] text-[11px] font-mono font-bold mb-3">
          <span>⭐</span>
          <span>PROGRAM KEMITRAAN & RESELLER INDONESIA</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          Daftar Akun Baru & Kemitraan Reseller
        </h1>
        <p className="text-xs sm:text-sm text-[#94a3b8]">
          Dapatkan akses langsung ke sistem harga modal H2H distributor, antrean instan 1-3 detik, dan potongan harga spesial.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Account Type Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#181b25] border border-[#262a34] rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Pilih Jenis Akun Anda
            </h3>

            {/* Member Reguler */}
            <div
              onClick={() => setRole('member')}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                role === 'member'
                  ? 'bg-[#1c1f29] border-[#10b981] ring-1 ring-[#10b981]'
                  : 'bg-[#0f131c] border-[#262a34] hover:border-[#3c4a42]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-white">Member Reguler</span>
                <span className="text-[10px] font-mono text-[#4edea3] bg-[#10b981]/15 px-2 py-0.5 rounded">
                  GRATIS
                </span>
              </div>
              <p className="text-[11px] text-[#94a3b8]">
                Cocok untuk penggunaan pribadi. Dapatkan diskon member langsung dan simpan ID game otomatis.
              </p>
            </div>

            {/* Reseller VIP */}
            <div
              onClick={() => setRole('reseller')}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                role === 'reseller'
                  ? 'bg-[#1c1f29] border-amber-500 ring-1 ring-amber-500'
                  : 'bg-[#0f131c] border-[#262a34] hover:border-[#3c4a42]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-amber-400">Reseller VIP & Partner</span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded">
                  REKOMENDASI
                </span>
              </div>
              <p className="text-[11px] text-[#94a3b8]">
                Akses harga modal H2H distributor termurah se-Indonesia, antrean pengiriman prioritas, dan saldo deposit NazilahPay bebas biaya admin.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#181b25] border border-[#262a34] text-xs text-[#94a3b8] space-y-2">
            <div className="font-bold text-white flex items-center gap-2">
              <span>🛡️</span>
              <span>Keamanan Data Terenkripsi</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Seluruh kredensial akun dilindungi hashing algoritma Argon2id dan otentikasi dua langkah (2FA) via WhatsApp resmi.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Full Registration Form (8 cols) */}
        <div className="lg:col-span-8">
          <form
            onSubmit={handleRegister}
            className="bg-[#181b25] border border-[#262a34] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5"
          >
            <div className="border-b border-[#262a34] pb-4 mb-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Lengkapi Data Pendaftaran ({role.toUpperCase()})
              </h2>
              <p className="text-xs text-[#94a3b8]">Pastikan nomor WhatsApp aktif untuk verifikasi OTP.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#dfe2ef] mb-1.5">
                  Nama Lengkap <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Muhammad Nazilah"
                  className="w-full bg-[#0f131c] border border-[#262a34] focus:border-[#10b981] rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#dfe2ef] mb-1.5">
                  Username <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: nazilah_store"
                  className="w-full bg-[#0f131c] border border-[#262a34] focus:border-[#10b981] rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none"
                />
              </div>
            </div>

            {/* WhatsApp + OTP input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#dfe2ef] mb-1.5">
                  Nomor WhatsApp Aktif <span className="text-rose-400">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="081234567890"
                    className="flex-1 bg-[#0f131c] border border-[#262a34] focus:border-[#10b981] rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp || countdown > 0}
                    className="px-3.5 py-2.5 rounded-xl bg-[#262a34] hover:bg-[#3c4a42] text-xs font-bold text-white transition disabled:opacity-50 whitespace-nowrap"
                  >
                    {countdown > 0 ? `${countdown}s` : isSendingOtp ? '...' : 'Kirim OTP'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#dfe2ef] mb-1.5">
                  Kode OTP WhatsApp (6 Digit) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Contoh: 842910"
                  className="w-full bg-[#0f131c] border border-[#262a34] focus:border-[#10b981] rounded-xl px-4 py-2.5 text-xs text-white font-mono tracking-widest outline-none"
                />
              </div>
            </div>

            {otpSentMessage && (
              <p className="text-[11px] text-[#4edea3] font-mono -mt-2">{otpSentMessage}</p>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#dfe2ef] mb-1.5">
                Alamat Email Aktif <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-[#0f131c] border border-[#262a34] focus:border-[#10b981] rounded-xl px-4 py-2.5 text-xs text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#dfe2ef] mb-1.5">
                  Buat Kata Sandi <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter..."
                  className="w-full bg-[#0f131c] border border-[#262a34] focus:border-[#10b981] rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#dfe2ef] mb-1.5">
                  Konfirmasi Kata Sandi <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi..."
                  className="w-full bg-[#0f131c] border border-[#262a34] focus:border-[#10b981] rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#dfe2ef] mb-1.5">
                Kode Referral Reseller (Opsional)
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Contoh: VIP-PARTNER"
                className="w-full bg-[#0f131c] border border-[#262a34] focus:border-[#10b981] rounded-xl px-4 py-2.5 text-xs text-white uppercase font-mono outline-none"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 text-xs text-[#4edea3]">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-[#10b981]/25 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? 'Mendaftarkan Akun...' : 'Buat Akun Nazilah Store →'}
            </button>

            <div className="text-center text-xs text-[#94a3b8] pt-2">
              Sudah memiliki akun?{' '}
              <a href="/masuk" className="text-[#4edea3] font-bold hover:underline">
                Masuk ke Akun Anda
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

