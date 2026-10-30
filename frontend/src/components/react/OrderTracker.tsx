import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import type { Transaction } from './LiveInvoice';

export default function OrderTracker() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Transaction[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/v1/orders/search?q=${encodeURIComponent(query.trim())}`);
      const json = await res.json();
      if (json.success && json.data) {
        setResults(json.data);
      } else {
        setResults([]);
      }
    } catch (err) {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Search Header */}
      <div className="bg-[#181b25] border border-[#262a34] rounded-2xl p-6 sm:p-8 shadow-xl text-center">
        <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 text-[#4edea3] flex items-center justify-center text-xl mx-auto mb-4">
          🔍
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
          Lacak Status Pesanan & Bukti Transaksi
        </h1>
        <p className="text-xs sm:text-sm text-[#94a3b8] max-w-lg mx-auto mb-6">
          Masukkan Nomor Invoice (contoh: <span className="font-mono text-[#4edea3]">NZL-20261030-XXXX</span>) atau Nomor WhatsApp yang digunakan saat pemesanan.
        </p>

        <form onSubmit={handleSearch} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari Nomor Invoice / No WhatsApp..."
            className="flex-1 bg-[#0f131c] border border-[#262a34] focus:border-[#10b981] rounded-xl px-4 py-3 text-xs sm:text-sm text-white font-mono placeholder-[#64748b] outline-none transition"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white text-xs sm:text-sm font-bold transition shadow-lg shadow-[#10b981]/25 disabled:opacity-50"
          >
            {isLoading ? 'Mencari...' : 'Lacak Pesanan'}
          </button>
        </form>
      </div>

      {/* Results List */}
      {hasSearched && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Hasil Pencarian ({results.length})
          </h2>

          {results.length === 0 ? (
            <div className="p-8 text-center bg-[#181b25] border border-[#262a34] rounded-2xl text-xs text-[#94a3b8]">
              Tidak ditemukan pesanan dengan kata kunci "<span className="text-white font-mono">{query}</span>".
              Pastikan format nomor invoice sudah benar.
            </div>
          ) : (
            results.map((tx) => {
              const isSuccess = tx.status === 'SUCCESS';
              return (
                <div
                  key={tx.invoice_id}
                  className="bg-[#181b25] border border-[#262a34] hover:border-[#3c4a42] rounded-2xl p-6 transition shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262a34] mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-bold text-white">{tx.invoice_id}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isSuccess
                              ? 'bg-[#10b981]/15 text-[#4edea3] border border-[#10b981]/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </div>
                      <div className="text-xs text-[#94a3b8]">
                        Waktu: {new Date(tx.created_at).toLocaleString('id-ID')}
                      </div>
                    </div>

                    <a
                      href={`/invoice/${tx.invoice_id}`}
                      className="px-4 py-1.5 rounded-lg bg-[#262a34] hover:bg-[#3c4a42] text-xs font-semibold text-white transition self-start sm:self-auto"
                    >
                      Buka Invoice &rarr;
                    </a>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-[#94a3b8] block mb-0.5">Game & Item:</span>
                      <span className="font-semibold text-white uppercase">{tx.game_slug.replace('-', ' ')}</span>
                      <span className="block text-[#4edea3] text-[11px] truncate">{tx.sku_name}</span>
                    </div>

                    <div>
                      <span className="text-[#94a3b8] block mb-0.5">Akun Tujuan:</span>
                      <span className="font-mono text-white">{tx.target_user_id}</span>
                      <span className="block text-[#94a3b8] text-[11px]">{tx.target_nickname}</span>
                    </div>

                    <div>
                      <span className="text-[#94a3b8] block mb-0.5">Metode Bayar:</span>
                      <span className="font-mono text-white">{tx.payment_code}</span>
                      <span className="block text-[#4edea3] font-mono-numbers font-bold">
                        Rp{tx.amount_total.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#94a3b8] block mb-0.5">Serial Number (SN):</span>
                      <span className="font-mono text-[11px] text-[#4edea3]">
                        {tx.sn_number || <span className="text-[#64748b]">- Menunggu -</span>}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

