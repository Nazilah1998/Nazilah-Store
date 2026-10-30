import { useState, useEffect } from 'react';
import type { SyntheticEvent } from 'react';

export default function ResetPasswordForm() {
  const [target, setTarget] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSentMessage, setOtpSentMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!target.trim()) {
      alert('Masukkan nomor WhatsApp atau email terlebih dahulu');
      return;
    }
    setIsSendingOtp(true);
    setOtpSentMessage(null);
    try {
      const res = await fetch('/api/v1/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: target.trim(), action: 'reset' }),
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
      alert('Gagal mengirim OTP: ' + err.message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleReset = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!target.trim() || !otpCode.trim() || !newPassword) {
      setErrorMessage('Semua field wajib diisi');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: target.trim(),
          otp_code: otpCode.trim(),
          new_password: newPassword,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMessage('✓ Kata sandi berhasil direset! Mengalihkan ke halaman masuk...');
        setTimeout(() => {
          window.location.href = '/masuk';
        }, 1500);
      } else {
        setErrorMessage(json.message || 'Gagal mereset kata sandi');
      }
    } catch (err: any) {
      setErrorMessage('Terjadi kesalahan: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-[#181b25] border border-[#262a34] rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/30 text-[#4edea3] flex items-center justify-center text-2xl mx-auto">
          🔐
        </div>

        <div>
          <h1 className="text-xl font-extrabold text-white mb-1">
            Verifikasi OTP & Reset Sandi
          </h1>
          <p className="text-xs text-[#94a3b8]">
            Masukkan nomor WhatsApp atau email akun Anda untuk menerima kode OTP keamanan.
          </p>
        </div>

        <form onSubmit={handleReset} className="text-left space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#dfe2ef] mb-1.5">
              Nomor WhatsApp atau Email Terdaftar <span className="text-rose-400">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
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

          {otpSentMessage && (
            <p className="text-[11px] text-[#4edea3] font-mono">{otpSentMessage}</p>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#dfe2ef] mb-1.5">
              Kode OTP WhatsApp (6 Digit) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="Contoh: 842910"
              className="w-full bg-[#0f131c] border border-[#262a34] focus:border-[#10b981] rounded-xl px-4 py-2.5 text-xs text-white font-mono tracking-widest text-center text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#dfe2ef] mb-1.5">
              Kata Sandi Baru <span className="text-rose-400">*</span>
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 8 karakter..."
              className="w-full bg-[#0f131c] border border-[#262a34] focus:border-[#10b981] rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#dfe2ef] mb-1.5">
              Konfirmasi Kata Sandi Baru <span className="text-rose-400">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi kata sandi baru..."
              className="w-full bg-[#0f131c] border border-[#262a34] focus:border-[#10b981] rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none"
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
            {isLoading ? 'Memperbarui Sandi...' : 'Verifikasi & Simpan Sandi Baru →'}
          </button>

          <div className="text-center text-xs text-[#94a3b8] pt-2">
            Ingat kata sandi Anda?{' '}
            <a href="/masuk" className="text-[#4edea3] font-bold hover:underline">
              Masuk Sekarang
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

