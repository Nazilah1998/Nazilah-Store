import { useState, useMemo } from 'react';

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

export default function GameCatalog({ games }: { games: Game[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: '🔥 Semua Game' },
    { id: 'populer', label: '⭐ Paling Populer' },
    { id: 'mobile', label: '📱 Mobile Games' },
    { id: 'pc', label: '💻 PC Games' },
  ];

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchCategory =
        selectedCategory === 'all' ||
        (selectedCategory === 'populer' && game.category === 'populer') ||
        game.category === selectedCategory;
      const matchSearch =
        game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.publisher.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [games, selectedCategory, searchQuery]);

  return (
    <section>
      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#10b981] text-white shadow-md shadow-[#10b981]/20'
                  : 'bg-[#181b25] text-[#94a3b8] hover:bg-[#1c1f29] hover:text-white border border-[#262a34]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari game favorit..."
            className="w-full bg-[#181b25] border border-[#262a34] focus:border-[#10b981] rounded-lg px-3.5 py-2 pl-9 text-xs text-white placeholder-[#64748b] outline-none transition"
          />
          <svg
            className="w-4 h-4 text-[#64748b] absolute left-3 top-2.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Game Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredGames.map((game) => (
          <a
            key={game.slug}
            href={`/order/${game.slug}`}
            className="group flex flex-col bg-[#181b25] hover:bg-[#1c1f29] border border-[#262a34] hover:border-[#10b981] rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-1 shadow-lg hover:shadow-[#10b981]/10"
          >
            {/* Poster Image */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#0a0e17]">
              <img
                src={game.cover_url}
                alt={game.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f131c] via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
              
              <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-[#4edea3] flex items-center gap-1">
                <span>{game.currency_icon}</span>
                <span>{game.currency_name}</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-wider mb-0.5">
                  {game.publisher}
                </div>
                <h3 className="text-xs font-bold text-white group-hover:text-[#4edea3] transition-colors line-clamp-1">
                  {game.name}
                </h3>
              </div>

              <div className="mt-3 pt-2 border-t border-[#262a34] flex items-center justify-between text-[11px]">
                <span className="text-[#94a3b8] text-[10px]">1-3 Detik</span>
                <span className="text-[#4edea3] font-semibold group-hover:translate-x-0.5 transition-transform">
                  Top Up &rarr;
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {filteredGames.length === 0 && (
        <div className="text-center py-16 bg-[#181b25] border border-[#262a34] rounded-2xl">
          <p className="text-sm text-[#94a3b8]">Tidak ada game yang cocok dengan pencarian "{searchQuery}"</p>
        </div>
      )}
    </section>
  );
}

