import { useState } from 'react';
import { Sword, Heart, Zap } from 'lucide-react';
import type { LolCard, LolRarity, LolCardType } from '../../types';

// Outer border gradient — mimics premium TCG card finish
const RARITY_FRAME: Record<LolRarity, { border: string; headerBg: string; gem: string; shine: string }> = {
  Common:   { border: 'from-gray-500 via-gray-400 to-gray-500',     headerBg: 'bg-gray-800',             gem: 'bg-gray-400',   shine: 'from-gray-400/20' },
  Rare:     { border: 'from-blue-600 via-blue-300 to-blue-600',     headerBg: 'bg-blue-950',              gem: 'bg-blue-400',   shine: 'from-blue-400/20' },
  Epic:     { border: 'from-purple-700 via-purple-300 to-purple-700', headerBg: 'bg-purple-950',          gem: 'bg-purple-400', shine: 'from-purple-400/25' },
  Legendary:{ border: 'from-yellow-600 via-yellow-300 to-yellow-600', headerBg: 'bg-yellow-950',          gem: 'bg-yellow-400', shine: 'from-yellow-400/30' },
};

const TYPE_COLOR: Record<LolCardType, string> = {
  Champion:  'bg-yellow-900 text-yellow-200 border-yellow-700',
  Spell:     'bg-blue-900 text-blue-200 border-blue-700',
  Landmark:  'bg-emerald-900 text-emerald-200 border-emerald-700',
  Equipment: 'bg-orange-900 text-orange-200 border-orange-700',
  Trap:      'bg-red-900 text-red-200 border-red-700',
  Support:   'bg-teal-900 text-teal-200 border-teal-700',
};

const REGION_ICON: Record<string, string> = {
  Demacia: '🛡️', Noxus: '⚔️', Freljord: '❄️', Piltover: '⚙️', Zaun: '🧪',
  Ionia: '🌸', 'Shadow Isles': '💀', Bilgewater: '🏴‍☠️', Shurima: '☀️',
  Targon: '🌟', Void: '🟣', 'Bandle City': '🌈',
};

interface Props {
  card: LolCard;
  onClick?: () => void;
  priceSlot?: React.ReactNode;
}

export function LolCardFrame({ card, onClick, priceSlot }: Props) {
  const [imgError, setImgError] = useState(false);
  const frame = RARITY_FRAME[card.rarity];

  return (
    // Outer wrapper — gradient border via padding trick
    <div
      onClick={onClick}
      className={`relative rounded-2xl p-[2px] bg-gradient-to-b ${frame.border}
        hover:scale-[1.02] hover:shadow-2xl transition-all duration-200 cursor-pointer select-none`}
      style={{ width: '100%', aspectRatio: '2.5 / 3.5' }}
    >
      {/* Inner card body */}
      <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-950 flex flex-col">

        {/* Shine overlay for Rare+ */}
        {card.rarity !== 'Common' && (
          <div className={`absolute inset-0 bg-gradient-to-br ${frame.shine} via-transparent to-transparent pointer-events-none z-10`} />
        )}

        {/* ── Header bar ── */}
        <div className={`${frame.headerBg} px-2 py-1.5 flex items-center justify-between gap-1 shrink-0`}>
          {/* Mana cost */}
          <div className="w-7 h-7 rounded-full bg-blue-800 border-2 border-blue-400 flex items-center justify-center shrink-0">
            <span className="text-blue-100 font-black text-xs">{card.cost}</span>
          </div>

          {/* Name */}
          <span className="text-white font-bold text-sm leading-tight flex-1 text-center truncate px-1">
            {card.name}
          </span>

          {/* Region icon */}
          <span className="text-base shrink-0" title={card.region}>
            {REGION_ICON[card.region] ?? '⚔️'}
          </span>
        </div>

        {/* ── Art area ── */}
        <div className="relative flex-1 overflow-hidden bg-gray-900 min-h-0">
          {!imgError ? (
            <img
              src={card.imageUrl}
              alt={card.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover object-top"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <span className="text-5xl opacity-20">{REGION_ICON[card.region] ?? '⚔️'}</span>
            </div>
          )}

          {/* Print type badge — corner ribbon */}
          {card.printType !== 'Normal' && (
            <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/70 text-yellow-300 border border-yellow-700/50 backdrop-blur-sm">
              {card.printType.toUpperCase()}
            </div>
          )}
        </div>

        {/* ── Type strip ── */}
        <div className={`px-2 py-0.5 flex items-center justify-between border-t border-b ${TYPE_COLOR[card.type]} text-[10px] font-semibold shrink-0`}>
          <span>{card.type}</span>
          {(card.attack !== undefined || card.health !== undefined) && (
            <div className="flex gap-2">
              {card.attack !== undefined && (
                <span className="flex items-center gap-0.5 text-orange-300">
                  <Sword size={8} /> {card.attack}
                </span>
              )}
              {card.health !== undefined && (
                <span className="flex items-center gap-0.5 text-red-300">
                  <Heart size={8} /> {card.health}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Text box ── */}
        <div className="bg-gray-900/95 px-2 py-1.5 shrink-0">
          {/* Keywords */}
          {card.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1">
              {card.keywords.map((kw) => (
                <span key={kw} className="flex items-center gap-0.5 px-1 py-0.5 bg-gray-800 rounded text-[9px] text-yellow-400 border border-gray-700">
                  <Zap size={7} /> {kw}
                </span>
              ))}
            </div>
          )}
          <p className="text-gray-300 text-[10px] leading-snug line-clamp-3">
            {card.description}
          </p>
          {card.flavorText && (
            <p className="text-gray-500 italic text-[9px] mt-1 line-clamp-2">
              {card.flavorText}
            </p>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="bg-gray-950 px-2 py-1 flex items-center justify-between shrink-0">
          {/* Rarity gem */}
          <div className={`w-3 h-3 rounded-full ${frame.gem} shadow-sm`} title={card.rarity} />
          <span className="text-gray-600 text-[9px]">{card.cardNumber}</span>
          <span className="text-gray-600 text-[9px]">{card.setName}</span>
        </div>

        {/* ── Price slot (injected) ── */}
        {priceSlot && <div className="bg-gray-950 border-t border-gray-800">{priceSlot}</div>}
      </div>
    </div>
  );
}
