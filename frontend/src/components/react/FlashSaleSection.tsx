import { useState, useEffect } from 'react';

interface FlashSaleItem {
  sku_code: string;
  game_slug: string;
  game_name: string;
  item_name: string;
  original_price: number;
  discount_price: number;
  stock_left: number;
  total_stock: number;
  ends_at: string;
}

export default function FlashSaleSection({ items }: { items: FlashSaleItem[] }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 11, minutes: 45, seconds: 20 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-3 border-b border-[#1c1f29]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
            ⚡
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
              FLASH SALE HARI INI
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                DISKON HINGGA 35%
              </span>
            </h2>
            <p className="text-xs text-[#94a3b8]">Promo harga termurah dengan kuota terbatas setiap hari</p>
          </div>
        </div>

        {/* Live Countdown Clock */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto font-mono text-xs">
          <span className="text-[#94a3b8] text-xs mr-1 font-sans">Berakhir dalam:</span>
          <div className="bg-[#1c1f29] border border-[#262a34] px-2 py-1 rounded text-amber-400 font-bold">
            {String(timeLeft.hours).padStart(2, '0')}
          </div>
          <span className="text-amber-400 font-bold">:</span>
          <div className="bg-[#1c1f29] border border-[#262a34] px-2 py-1 rounded text-amber-400 font-bold">
            {String(timeLeft.minutes).padStart(2, '0')}
          </div>
          <span className="text-amber-400 font-bold">:</span>
          <div className="bg-[#1c1f29] border border-[#262a34] px-2 py-1 rounded text-amber-400 font-bold">
            {String(timeLeft.seconds).padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Grid of Flash Sale Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => {
          const percentLeft = Math.round((item.stock_left / item.total_stock) * 100);
          return (
            <a
              key={item.sku_code}
              href={`/order/${item.game_slug}?sku=${item.sku_code}`}
              className="group relative bg-[#181b25] hover:bg-[#1c1f29] border border-[#262a34] hover:border-amber-500/50 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between shadow-lg shadow-black/20"
            >
              <div className="mb-3">
                <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1">
                  {item.game_name}
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                  {item.item_name}
                </h3>
              </div>

              <div className="my-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-extrabold text-[#4edea3] font-mono-numbers">
                    Rp{item.discount_price.toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs text-[#64748b] line-through font-mono-numbers">
                    Rp{item.original_price.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Stock Bar */}
              <div className="mt-2">
                <div className="flex justify-between text-[10px] text-[#94a3b8] mb-1">
                  <span>Tersisa: {item.stock_left} item</span>
                  <span>{percentLeft}%</span>
                </div>
                <div className="w-full bg-[#0f131c] rounded-full h-1.5 overflow-hidden border border-[#262a34]">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-rose-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${percentLeft}%` }}
                  ></div>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

