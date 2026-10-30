import { useState } from 'react';
import type { SyntheticEvent } from 'react';

export default function LoginForm() {
  const [loginType, setLoginType] = useState<'password' | 'otp'>('password');
  const [authId, setAuthId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSentMessage, setOtpSentMessage] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successUser, setSuccessUser] = useState<any | null>(null);

  const handleSendOtp = async () => {
    if (!authId.trim()) {
      alert('Masukkan nomor WhatsApp atau email terlebih dahulu');
      return;
    }
    setIsSendingOtp(true);
    setOtpSentMessage(null);
    try {
      const res = await fetch('/api/v1/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: authId.trim(), action: 'login' }),
      });
      const json = await res.json();
      if (json.success) {
        setOtpSentMessage(json.message);
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

  const handleLogin = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!authId.trim()) {
      setErrorMessage('Nomor WhatsApp atau Email wajib diisi');
      return;
    }
    if (loginType === 'password' && !password) {
      setErrorMessage('Kata sandi wajib diisi');
      return;
    }
    if (loginType === 'otp' && !otpCode.trim()) {
      setErrorMessage('Kode OTP wajib diisi');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_id: authId.trim(),
          password: loginType === 'password' ? password : null,
          otp_code: loginType === 'otp' ? otpCode.trim() : null,
          login_type: loginType,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setSuccessUser(json.data.user);
        localStorage.setItem('nazilah_token', json.data.token);
        localStorage.setItem('nazilah_user', JSON.stringify(json.data.user));
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        setErrorMessage(json.message || 'Login gagal');
      }
    } catch (err: any) {
      setErrorMessage('Gagal menghubungi backend: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      {/* LEFT COLUMN: Benefits & Value Prop (5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/30 text-[#4edea3] text-[11px] font-mono font-bold">
          <span>⚡</span>
          <span>OFFICIAL H2H SPEED ENGINE 24/7</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
          Akses Harga Reseller & <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4edea3] to-emerald-400">
            Checkout Instan 1-Detik.
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
          Masuk untuk mengecek riwayat pesanan, saldo deposit NazilahPay, dan menikmati potongan harga khusus mitra kemitraan game se-Indonesia.
        </p>

        <div className="space-y-3 pt-2 text-xs text-[#dfe2ef]">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#10b981]/20 text-[#4edea3] flex items-center justify-center font-bold text-xs">
              ✓
            </span>
            <span>Bebas biaya admin QRIS dengan Saldo NazilahPay</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#10b981]/20 text-[#4edea3] flex items-center justify-center font-bold text-xs">
              ✓
            </span>
            <span>Harga Khusus Member & Reseller VIP Otomatis</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#10b981]/20 text-[#4edea3] flex items-center justify-center font-bold text-xs">
              ✓
            </span>
            <span>Keamanan Akun Terenkripsi Standar Bank</span>
          </div>
        </div>

        {/* Price Difference Comparison Box */}
        <div className="p-4 rounded-xl bg-[#181b25] border border-[#262a34]">
          <div className="text-[10px] font-mono uppercase text-amber-400 font-bold mb-1">
            Contoh Selisih Harga Core:
          </div>
          <div className="text-xs font-bold text-white mb-2">Weekly Diamond Pass MLBB</div>
          <div className="flex items-baseline justify-between text-xs font-mono">
            <span className="text-[#94a3b8] line-through">Publik: Rp26.500</span>
            <span className="text-[#4edea3] font-bold text-sm">Reseller: Rp24.500</span>
          </div>
          <div className="text-[10px] text-[#10b981] mt-1 font-semibold">
            Hemat Rp2.000 per transaksi!
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Login Card (7 cols) */}
      <div className="lg:col-span-7">
        <div className="bg-[#181b25] border border-[#262a34] rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-extrabold text-white mb-1">Masuk ke Akun Anda</h2>
            <p className="text-xs text-[#94a3b8]">
              Gunakan nomor WhatsApp atau email yang telah terdaftar.
            </p>
          </div>

          {/* Tab Switcher: Password vs OTP WhatsApp */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#0f131c] border border-[#262a34] mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginType('password');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                loginType === 'password'
                  ? 'bg-[#1c1f29] text-white shadow border border-[#3c4a42]'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              <span>🔑</span>
              <span>Kata Sandi</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginType('otp');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                loginType === 'otp'
                  ? 'bg-[#1c1f29] text-white shadow border border-[#3c4a42]'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              <span>💬</span>
              <span>OTP WhatsApp</span>
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#dfe2ef] mb-1.5">
                Nomor WhatsApp atau Email Terdaftar <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={authId}
                  onChange={(e) => setAuthId(e.target.value)}
                  placeholder="Contoh: 081234567890 atau demo@nazilahstore.com"
                  className="w-full bg-[#0f131c] border border-[#262a34] focus:border-[#10b981] rounded-xl px-4 py-3 text-xs sm:text-sm text-white font-mono placeholder-[#64748b] outline-none transition"
                />
              </div>
            </div>

            {loginType === 'password' ? (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#dfe2ef]">
                    Kata Sandi <span className="text-rose-400">*</span>
                  </label>
                  <a
                    href="/reset-kata-sandi"
                    className="text-xs text-[#4edea3] hover:underline"
                  >
                    Lupa Kata Sandi?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi..."
                    className="w-full bg-[#0f131c] border border-[#262a34] focus:border-[#10b981] rounded-xl px-4 py-3 pr-10 text-xs sm:text-sm text-white font-mono placeholder-[#64748b] outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-xs text-[#94a3b8] hover:text-white"
                  >
                    {showPassword ? 'Tutup' : 'Lihat'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-[#dfe2ef] mb-1.5">
                  Kode Verifikasi OTP WhatsApp (6 Digit) <span className="text-rose-400">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="6 digit kode OTP"
                    className="flex-1 bg-[#0f131c] border border-[#262a34] focus:border-[#10b981] rounded-xl px-4 py-3 text-xs sm:text-sm text-white font-mono tracking-widest outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp}
                    className="px-4 py-3 rounded-xl bg-[#262a34] hover:bg-[#3c4a42] text-xs font-bold text-white transition disabled:opacity-50 whitespace-nowrap"
                  >
                    {isSendingOtp ? 'Mengirim...' : 'Kirim OTP'}
                  </button>
                </div>
                {otpSentMessage && (
                  <p className="text-[11px] text-[#4edea3] mt-1 font-mono">{otpSentMessage}</p>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                defaultChecked
                className="w-4 h-4 rounded bg-[#0f131c] border-[#262a34] text-[#10b981] focus:ring-0"
              />
              <label htmlFor="remember" className="text-xs text-[#94a3b8] cursor-pointer">
                Ingat perangkat ini selama 30 hari
              </label>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
                {errorMessage}
              </div>
            )}

            {successUser && (
              <div className="p-3 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 text-xs text-[#4edea3]">
                ✓ Berhasil masuk! Selamat datang, <strong>{successUser.name}</strong> ({successUser.role.toUpperCase()}). Mengalihkan...
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-[#10b981]/25 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? 'Memverifikasi Akun...' : 'Masuk Sekarang →'}
            </button>
          </form>

          {/* Quick Demo Credentials Info */}
          <div className="mt-6 p-3 rounded-xl bg-[#0f131c] border border-[#262a34] text-[11px] text-[#94a3b8]">
            <div className="font-bold text-white mb-1">Akun Demo Siap Pakai:</div>
            <div>WhatsApp: <span className="font-mono text-[#4edea3]">081234567890</span> (atau email: <span className="font-mono text-[#4edea3]">demo@nazilahstore.com</span>)</div>
            <div>Kata Sandi: <span className="font-mono text-white">Password123!</span> | Master OTP: <span className="font-mono text-amber-400">842910</span></div>
          </div>

          <div className="mt-6 text-center text-xs text-[#94a3b8]">
            Belum memiliki akun mitra?{' '}
            <a href="/daftar" className="text-[#4edea3] font-bold hover:underline">
              Daftar Kemitraan Reseller Sekarang
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

