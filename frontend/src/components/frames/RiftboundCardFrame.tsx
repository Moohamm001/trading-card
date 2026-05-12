import { useState } from 'react';
import type { RiftboundCard } from '../../games/lol/useRiftboundCards';

// Domain colour themes — border gradient around the card
const DOMAIN_BORDER: Record<string, string> = {
  fury:      'from-red-600 via-orange-400 to-red-600',
  calm:      'from-cyan-500 via-blue-300 to-cyan-500',
  mind:      'from-purple-600 via-violet-300 to-purple-600',
  body:      'from-green-600 via-lime-400 to-green-600',
  order:     'from-yellow-500 via-amber-300 to-yellow-500',
  chaos:     'from-indigo-700 via-purple-400 to-indigo-700',
  colorless: 'from-gray-500 via-gray-300 to-gray-500',
};

// Rarity glow for Showcase / Overnumbered
const RARITY_GLOW: Record<string, string> = {
  showcase:     'hover:shadow-yellow-400/40',
  overnumbered: 'hover:shadow-amber-500/50',
  epic:         'hover:shadow-purple-500/30',
  rare:         'hover:shadow-blue-500/25',
};

function domainBorder(domains: string[]): string {
  const d = domains[0]?.toLowerCase() ?? 'colorless';
  return DOMAIN_BORDER[d] ?? DOMAIN_BORDER.colorless;
}

function rarityGlow(rarity: string): string {
  return RARITY_GLOW[rarity.toLowerCase()] ?? '';
}

const RARITY_BADGE: Record<string, string> = {
  showcase:     'bg-yellow-800/80 text-yellow-200 border-yellow-600',
  overnumbered: 'bg-amber-800/80 text-amber-200 border-amber-600',
  epic:         'bg-purple-800/80 text-purple-200 border-purple-600',
  rare:         'bg-blue-800/80 text-blue-200 border-blue-600',
  uncommon:     'bg-teal-800/80 text-teal-200 border-teal-600',
  common:       'bg-gray-700/80 text-gray-300 border-gray-600',
};

interface Props {
  card: RiftboundCard;
  onClick?: () => void;
  priceSlot?: React.ReactNode;
}

export function RiftboundCardFrame({ card, onClick, priceSlot }: Props) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const border = domainBorder(card.domains);
  const effectiveRarity = card.isOvernumbered ? 'overnumbered' : card.rarity.toLowerCase();
  const glow = RARITY_GLOW[effectiveRarity] ?? rarityGlow(card.rarity);
  const isSpecial = effectiveRarity === 'showcase' || effectiveRarity === 'overnumbered';

  return (
    <div className="flex flex-col">
      {/* Outer gradient border — 3px for Showcase, 2px otherwise */}
      <div
        onClick={onClick}
        className={`relative rounded-xl p-[2px] bg-gradient-to-b ${border}
          hover:scale-[1.02] transition-all duration-200 cursor-pointer select-none
          hover:shadow-2xl ${glow} ${isSpecial ? 'ring-1 ring-yellow-500/30' : ''}`}
        style={{ aspectRatio: '744 / 1039' }}
      >
        <div className="relative w-full h-full rounded-[10px] overflow-hidden bg-gray-950">
          {/* Loading skeleton */}
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 animate-pulse" />
          )}

          {/* Actual card image — full Riot CDN render (744×1039) */}
          {!imgError ? (
            <img
              src={card.imageUrl}
              alt={card.name}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          ) : (
            // Fallback when CDN is unreachable
            <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-b
              ${card.domains[0] === 'fury' ? 'from-red-950 to-gray-950' :
                card.domains[0] === 'calm' ? 'from-blue-950 to-gray-950' :
                card.domains[0] === 'chaos' ? 'from-purple-950 to-gray-950' : 'from-gray-900 to-gray-950'}`}
            >
              <div className="text-white/20 text-xs uppercase tracking-widest mb-2">{card.type}</div>
              <div className="text-white/60 font-bold text-sm text-center px-2">{card.name}</div>
              <div className="text-white/30 text-xs mt-1">{card.code}</div>
            </div>
          )}

          {/* Showcase / Overnumbered shimmer overlay */}
          {isSpecial && imgLoaded && (
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-yellow-300/10 to-transparent pointer-events-none" />
          )}

          {/* Rarity badge — top-right corner, semi-transparent */}
          {effectiveRarity !== 'common' && effectiveRarity !== 'uncommon' && imgLoaded && (
            <div className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold border backdrop-blur-sm
              ${RARITY_BADGE[effectiveRarity] ?? RARITY_BADGE.common}`}>
              {card.isOvernumbered ? 'Overnumbered' : card.rarity}
            </div>
          )}
        </div>
      </div>

      {/* Card footer info (outside the image frame) */}
      <div className="mt-1.5 px-0.5 space-y-0.5">
        <div className="flex items-center justify-between gap-1">
          <span className="text-white text-xs font-semibold truncate">{card.name}</span>
          <span className="text-gray-500 text-[10px] shrink-0 font-mono">{card.energy}⚡</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-gray-500">
          <span>{card.type} · {card.domains.map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join('/')}</span>
          <span className="font-mono">{card.code}</span>
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
