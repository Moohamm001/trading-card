import { useState } from 'react';
import type { PokemonCard, PokemonEnergyType, PrintType } from '../../types';

// Pokemon card color theme by energy type
const ENERGY_THEME: Record<PokemonEnergyType, { bg: string; border: string; badge: string; icon: string }> = {
  Fire:       { bg: 'from-red-900 to-orange-950',   border: 'from-red-500 via-orange-300 to-red-500',    badge: 'bg-red-700 text-red-100',    icon: '🔥' },
  Water:      { bg: 'from-blue-900 to-cyan-950',     border: 'from-blue-400 via-cyan-200 to-blue-400',    badge: 'bg-blue-700 text-blue-100',   icon: '💧' },
  Grass:      { bg: 'from-green-900 to-emerald-950', border: 'from-green-500 via-lime-300 to-green-500',  badge: 'bg-green-700 text-green-100', icon: '🌿' },
  Lightning:  { bg: 'from-yellow-900 to-amber-950',  border: 'from-yellow-400 via-yellow-200 to-yellow-400', badge: 'bg-yellow-600 text-yellow-100', icon: '⚡' },
  Psychic:    { bg: 'from-purple-900 to-pink-950',   border: 'from-purple-500 via-pink-300 to-purple-500', badge: 'bg-purple-700 text-purple-100', icon: '🔮' },
  Fighting:   { bg: 'from-orange-900 to-red-950',    border: 'from-orange-500 via-amber-300 to-orange-500', badge: 'bg-orange-700 text-orange-100', icon: '👊' },
  Darkness:   { bg: 'from-gray-900 to-slate-950',    border: 'from-gray-500 via-slate-300 to-gray-500',  badge: 'bg-gray-700 text-gray-100',   icon: '🌑' },
  Metal:      { bg: 'from-slate-800 to-gray-950',    border: 'from-slate-400 via-gray-200 to-slate-400',  badge: 'bg-slate-600 text-slate-100', icon: '⚙️' },
  Dragon:     { bg: 'from-indigo-900 to-purple-950', border: 'from-indigo-500 via-purple-300 to-indigo-500', badge: 'bg-indigo-700 text-indigo-100', icon: '🐉' },
  Fairy:      { bg: 'from-pink-900 to-rose-950',     border: 'from-pink-500 via-rose-200 to-pink-500',   badge: 'bg-pink-700 text-pink-100',   icon: '✨' },
  Colorless:  { bg: 'from-gray-800 to-gray-950',     border: 'from-gray-400 via-gray-200 to-gray-400',   badge: 'bg-gray-600 text-gray-100',   icon: '⭐' },
};

const PRINT_SHIMMER: Record<PrintType, string> = {
  'Normal':        '',
  'Foil':          'after:absolute after:inset-0 after:bg-gradient-to-br after:from-white/10 after:via-transparent after:to-white/5 after:pointer-events-none',
  'Holo':          'after:absolute after:inset-0 after:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.15),transparent_60%)] after:pointer-events-none',
  'Reverse Holo':  'after:absolute after:inset-0 after:bg-gradient-to-tr after:from-cyan-400/10 after:via-transparent after:to-pink-400/10 after:pointer-events-none',
  'Full Art':      '',
  'Alternate Art': '',
  'First Edition': '',
  'Promo':         'after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_30%_30%,rgba(255,215,0,0.15),transparent_60%)] after:pointer-events-none',
  'Secret Rare':   'after:absolute after:inset-0 after:bg-[radial-gradient(ellipse_at_50%_50%,rgba(255,215,0,0.2),rgba(255,100,255,0.1),transparent_70%)] after:pointer-events-none',
};

interface Props {
  card: PokemonCard;
  onClick?: () => void;
  priceSlot?: React.ReactNode;
}

export function PokemonCardFrame({ card, onClick, priceSlot }: Props) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const theme = ENERGY_THEME[card.energyType];

  return (
    <div className="flex flex-col">
      {/* Outer gradient border — matches real Pokemon card gold-yellow border style */}
      <div
        onClick={onClick}
        className={`relative rounded-2xl p-[3px] bg-gradient-to-b ${theme.border}
          hover:scale-[1.02] hover:shadow-2xl transition-all duration-200 cursor-pointer select-none`}
        style={{ width: '100%', aspectRatio: '2.5 / 3.5' }}
      >
        <div className={`relative w-full h-full rounded-xl overflow-hidden ${PRINT_SHIMMER[card.printType]}`}>
          {/* Pokemon TCG API gives us the full card scan — display it directly */}
          {!imgError ? (
            <>
              {!imgLoaded && (
                <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg} animate-pulse flex items-center justify-center`}>
                  <span className="text-4xl opacity-30">{theme.icon}</span>
                </div>
              )}
              <img
                src={card.imageUrl}
                alt={`${card.name} — ${card.setName}`}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
                className={`w-full h-full object-contain transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                loading="lazy"
              />
            </>
          ) : (
            // Fallback when image fails: render a styled card frame
            <div className={`w-full h-full bg-gradient-to-br ${theme.bg} flex flex-col`}>
              {/* Header */}
              <div className={`px-2 py-1 flex items-center justify-between ${theme.badge}`}>
                <span className="font-black text-sm truncate">{card.name}</span>
                {card.hp && <span className="text-xs font-bold shrink-0 ml-1">HP {card.hp}</span>}
              </div>
              {/* Art placeholder */}
              <div className="flex-1 flex items-center justify-center">
                <span className="text-6xl opacity-40">{theme.icon}</span>
              </div>
              {/* Footer info */}
              <div className="p-2 space-y-1">
                <div className="text-xs text-gray-400">{card.rarity}</div>
                <div className="text-xs text-gray-500">{card.setName} · #{card.cardNumber}</div>
              </div>
            </div>
          )}

          {/* Print type badge — only for special versions */}
          {card.printType !== 'Normal' && imgLoaded && (
            <div className="absolute bottom-8 right-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/60 text-yellow-300 border border-yellow-700/50 backdrop-blur-sm">
              {card.printType.toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Card footer info (outside the aspect-ratio frame) */}
      <div className="mt-1.5 px-0.5 space-y-0.5">
        <div className="flex items-center justify-between gap-1">
          <span className="text-white text-xs font-semibold truncate">{card.name}</span>
          {card.hp && <span className="text-gray-500 text-[10px] shrink-0">HP {card.hp}</span>}
        </div>
        <div className="flex items-center justify-between text-[10px] text-gray-500">
          <span>{theme.icon} {card.energyType}</span>
          <span className="font-mono">#{card.cardNumber}</span>
        </div>
      </div>

      {/* Price slot */}
      {priceSlot && (
        <div className="mt-1 bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          {priceSlot}
        </div>
      )}
    </div>
  );
}
