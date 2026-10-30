import { useState } from 'react';

export default function MlbbCalculator() {
  const [activeTab, setActiveTab] = useState<'winrate' | 'magicwheel'>('winrate');

  // Winrate state
  const [totalMatches, setTotalMatches] = useState<number>(500);
  const [currentWr, setCurrentWr] = useState<number>(52.5);
  const [targetWr, setTargetWr] = useState<number>(60.0);
  const [winrateResult, setWinrateResult] = useState<number | null>(null);

  // Magic wheel state
  const [currentPoints, setCurrentPoints] = useState<number>(120);
  const targetPoints = 200; // Legend Skin threshold

  const calculateWinrate = () => {
    if (targetWr <= currentWr || targetWr >= 100) {
      alert('Target winrate harus lebih tinggi dari winrate saat ini dan kurang dari 100%');
      return;
    }
    const currentWins = totalMatches * (currentWr / 100);
    // (currentWins + X) / (totalMatches + X) = targetWr / 100
    const needed = Math.ceil(((targetWr / 100) * totalMatches - currentWins) / (1 - targetWr / 100));
    setWinrateResult(needed);
  };

  // Magic Wheel calculation: each 5 spin = 270 diamonds (with weekly discount)
  const remainingPoints = Math.max(0, targetPoints - currentPoints);
  const spinsNeeded = remainingPoints;
  const estimatedDiamonds = Math.round(spinsNeeded * 54); // ~54 diamonds per spin average

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-[#181b25] border border-[#262a34] rounded-2xl p-6 sm:p-8 shadow-xl text-center">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xl mx-auto mb-4">
          🧮
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
          Kalkulator Pintar Mobile Legends
        </h1>
        <p className="text-xs sm:text-sm text-[#94a3b8] max-w-lg mx-auto mb-6">
          Hitung estimasi win beruntun untuk mencapai target winrate impian atau estimasi diamond yang dibutuhkan untuk Magic Wheel Legend skin.
        </p>

        {/* Tab Switcher */}
        <div className="inline-flex p-1 rounded-xl bg-[#0f131c] border border-[#262a34]">
          <button
            onClick={() => setActiveTab('winrate')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'winrate'
                ? 'bg-[#10b981] text-white shadow-md shadow-[#10b981]/20'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Kalkulator Winrate
          </button>
          <button
            onClick={() => setActiveTab('magicwheel')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'magicwheel'
                ? 'bg-[#10b981] text-white shadow-md shadow-[#10b981]/20'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Magic Wheel & Zodiac
          </button>
        </div>
      </div>

      {/* Tab 1: Winrate Calculator */}
      {activeTab === 'winrate' && (
        <div className="bg-[#181b25] border border-[#262a34] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#dfe2ef] mb-1.5">
                Total Pertandingan Saat Ini
              </label>
              <input
                type="number"
                value={totalMatches}
                onChange={(e) => setTotalMatches(Number(e.target.value))}
                min={1}
                className="w-full bg-[#0f131c] border border-[#262a34] focus:border-[#10b981] rounded-xl px-4 py-3 text-xs text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#dfe2ef] mb-1.5">
                Winrate Saat Ini (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={currentWr}
                onChange={(e) => setCurrentWr(Number(e.target.value))}
                min={0}
                max={99.9}
                className="w-full bg-[#0f131c] border border-[#262a34] focus:border-[#10b981] rounded-xl px-4 py-3 text-xs text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#dfe2ef] mb-1.5">
                Target Winrate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={targetWr}
                onChange={(e) => setTargetWr(Number(e.target.value))}
                min={0.1}
                max={99.9}
                className="w-full bg-[#0f131c] border border-[#262a34] focus:border-[#10b981] rounded-xl px-4 py-3 text-xs text-white font-mono outline-none"
              />
            </div>
          </div>

          <button
            onClick={calculateWinrate}
            className="w-full py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white text-xs sm:text-sm font-bold transition shadow-lg shadow-[#10b981]/20"
          >
            Hitung Estimasi Kemenangan
          </button>

          {winrateResult !== null && (
            <div className="p-6 rounded-2xl bg-[#0f131c] border border-[#10b981]/40 text-center">
              <div className="text-xs text-[#94a3b8] mb-1">Hasil Perhitungan:</div>
              <div className="text-3xl font-extrabold text-[#4edea3] font-mono-numbers mb-2">
                {winrateResult} Kemenangan
              </div>
              <p className="text-xs text-[#dfe2ef] max-w-md mx-auto">
                Anda membutuhkan sekitar <strong className="text-white">{winrateResult} kemenangan beruntun (Win Streak)</strong> tanpa kalah untuk menaikkan winrate dari {currentWr}% menjadi {targetWr}%.
              </p>
              <div className="mt-4">
                <a
                  href="/order/mobile-legends"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#262a34] hover:bg-[#3c4a42] text-xs font-semibold text-[#4edea3] transition"
                >
                  Top Up Diamond MLBB Sekarang &rarr;
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Magic Wheel Calculator */}
      {activeTab === 'magicwheel' && (
        <div className="bg-[#181b25] border border-[#262a34] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div>
            <label className="block text-xs font-semibold text-[#dfe2ef] mb-1.5">
              Poin Magic Wheel / Bintang Zodiac Saat Ini (0 - 200)
            </label>
            <input
              type="number"
              value={currentPoints}
              onChange={(e) => setCurrentPoints(Math.min(200, Math.max(0, Number(e.target.value))))}
              min={0}
              max={200}
              className="w-full bg-[#0f131c] border border-[#262a34] focus:border-[#10b981] rounded-xl px-4 py-3 text-xs text-white font-mono outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-[#0f131c] border border-[#262a34] text-center">
              <div className="text-xs text-[#94a3b8] mb-1">Sisa Spin Dibutuhkan</div>
              <div className="text-2xl font-extrabold text-white font-mono-numbers">
                {spinsNeeded} Spin
              </div>
              <div className="text-[11px] text-[#64748b] mt-1">Hingga 200 Magic Core</div>
            </div>

            <div className="p-5 rounded-xl bg-[#0f131c] border border-[#262a34] text-center">
              <div className="text-xs text-[#94a3b8] mb-1">Estimasi Diamond Dibutuhkan</div>
              <div className="text-2xl font-extrabold text-amber-400 font-mono-numbers">
                ~{estimatedDiamonds.toLocaleString('id-ID')} 💎
              </div>
              <div className="text-[11px] text-[#64748b] mt-1">Setara Rp{Math.round(estimatedDiamonds * 260).toLocaleString('id-ID')}</div>
            </div>
          </div>

          <div className="text-center pt-2">
            <a
              href="/order/mobile-legends"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold transition shadow-lg shadow-[#10b981]/20"
            >
              <span>Top Up Paket Diamond Hemat</span>
              <span>&rarr;</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

