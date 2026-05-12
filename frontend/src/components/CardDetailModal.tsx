import { useEffect, useRef, useState } from 'react';
import { X, Zap, Star, Layers, Palette, Hash } from 'lucide-react';
import type { PokemonCard } from '../types';
import type { RiftboundCard } from '../games/lol/useRiftboundCards';
import type { useCollection } from '../hooks/useCollection';
import { PricePanel } from './PricePanel';
import { CollectionBadge } from './CollectionBadge';

type AnyCard = RiftboundCard | PokemonCard;

// ── Domain/Energy colour map ──────────────────────────────────────────────────
const DOMAIN_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  fury:      { bg: 'bg-red-900/60',    text: 'text-red-300',    icon: '🔥' },
  calm:      { bg: 'bg-cyan-900/60',   text: 'text-cyan-300',   icon: '💧' },
  mind:      { bg: 'bg-purple-900/60', text: 'text-purple-300', icon: '🔮' },
  body:      { bg: 'bg-green-900/60',  text: 'text-green-300',  icon: '🌿' },
  order:     { bg: 'bg-yellow-900/60', text: 'text-yellow-300', icon: '⚔️' },
  chaos:     { bg: 'bg-indigo-900/60', text: 'text-indigo-300', icon: '🌑' },
  colorless: { bg: 'bg-gray-800/60',   text: 'text-gray-300',   icon: '⭐' },
  Fire:      { bg: 'bg-red-900/60',    text: 'text-red-300',    icon: '🔥' },
  Water:     { bg: 'bg-blue-900/60',   text: 'text-blue-300',   icon: '💧' },
  Grass:     { bg: 'bg-green-900/60',  text: 'text-green-300',  icon: '🌿' },
  Lightning: { bg: 'bg-yellow-900/60', text: 'text-yellow-300', icon: '⚡' },
  Psychic:   { bg: 'bg-pink-900/60',   text: 'text-pink-300',   icon: '🔮' },
  Fighting:  { bg: 'bg-orange-900/60', text: 'text-orange-300', icon: '👊' },
  Darkness:  { bg: 'bg-gray-900/80',   text: 'text-gray-300',   icon: '🌑' },
  Metal:     { bg: 'bg-slate-800/60',  text: 'text-slate-300',  icon: '⚙️' },
  Dragon:    { bg: 'bg-indigo-900/60', text: 'text-indigo-300', icon: '🐉' },
  Fairy:     { bg: 'bg-rose-900/60',   text: 'text-rose-300',   icon: '✨' },
  Colorless: { bg: 'bg-gray-800/60',   text: 'text-gray-300',   icon: '⭐' },
};

const RARITY_STYLE: Record<string, string> = {
  common:       'bg-gray-700 text-gray-300',
  uncommon:     'bg-teal-800 text-teal-200',
  rare:         'bg-blue-800 text-blue-200',
  epic:         'bg-purple-800 text-purple-200',
  showcase:     'bg-gradient-to-r from-yellow-800 to-amber-700 text-yellow-200',
  overnumbered: 'bg-gradient-to-r from-amber-800 to-yellow-700 text-amber-200',
  legendary:    'bg-gradient-to-r from-yellow-800 to-amber-700 text-yellow-200',
  'rare holo':  'bg-gradient-to-r from-blue-800 to-cyan-700 text-blue-200',
  'holo rare':  'bg-gradient-to-r from-blue-800 to-cyan-700 text-blue-200',
};

// ── Riftbound card details ────────────────────────────────────────────────────
function RiftboundDetails({ card }: { card: RiftboundCard }) {
  return (
    <div className="space-y-4">
      {/* Name + code */}
      <div>
        <h2 className="text-2xl font-bold text-white leading-tight">{card.name}</h2>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-mono text-sm text-gray-400">{card.code}</span>
          <span className="text-gray-600">·</span>
          <span className="text-sm text-gray-400">{card.setName}</span>
        </div>
      </div>

      {/* Domain badges */}
      <div className="flex flex-wrap gap-2">
        {card.domains.map((d) => {
          const c = DOMAIN_COLORS[d] ?? DOMAIN_COLORS.colorless;
          return (
            <span key={d} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${c.bg} ${c.text}`}>
              {c.icon} {d.charAt(0).toUpperCase() + d.slice(1)}
            </span>
          );
        })}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <Stat icon={<Layers size={14} />} label="Type" value={card.type} />
        <Stat icon={<Star size={14} />} label="Rarity" value={card.rarity}
          valueClass={RARITY_STYLE[card.rarity.toLowerCase()]}
          pill />
        <Stat icon={<Zap size={14} />} label="Energy" value={String(card.energy)} />
        <Stat icon={<Hash size={14} />} label="Number" value={card.code} mono />
      </div>

      {/* Ability text */}
      {card.text && (
        <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Ability</p>
          <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">
            {card.text}
          </p>
        </div>
      )}

      {/* Artist */}
      {card.artist && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Palette size={13} />
          <span>Illustrated by <span className="text-gray-300">{card.artist}</span></span>
        </div>
      )}
    </div>
  );
}

// ── Pokemon card details ──────────────────────────────────────────────────────
function PokemonDetails({ card }: { card: PokemonCard }) {
  const c = DOMAIN_COLORS[card.energyType] ?? DOMAIN_COLORS.Colorless;
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white leading-tight">{card.name}</h2>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-mono text-sm text-gray-400">#{card.cardNumber}</span>
          <span className="text-gray-600">·</span>
          <span className="text-sm text-gray-400">{card.setName}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${c.bg} ${c.text}`}>
          {c.icon} {card.energyType}
        </span>
        {card.hp && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-900/60 text-red-300">
            ❤️ {card.hp} HP
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat icon={<Star size={14} />} label="Rarity" value={card.rarity}
          valueClass={RARITY_STYLE[card.rarity.toLowerCase()]} pill />
        <Stat icon={<Layers size={14} />} label="Print" value={card.printType} />
        <Stat icon={<Hash size={14} />} label="Number" value={`#${card.cardNumber}`} mono />
        {card.evolvesFrom && <Stat icon={<Zap size={14} />} label="Evolves From" value={card.evolvesFrom} />}
      </div>

      {card.artist && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Palette size={13} />
          <span>Illustrated by <span className="text-gray-300">{card.artist}</span></span>
        </div>
      )}
    </div>
  );
}

// ── Generic stat row ──────────────────────────────────────────────────────────
function Stat({ icon, label, value, valueClass = '', pill = false, mono = false }: {
  icon: React.ReactNode; label: string; value: string;
  valueClass?: string; pill?: boolean; mono?: boolean;
}) {
  return (
    <div className="bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700/50">
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">{icon} {label}</div>
      {pill ? (
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${valueClass}`}>{value}</span>
      ) : (
        <span className={`text-sm font-medium text-gray-200 ${mono ? 'font-mono' : ''}`}>{value}</span>
      )}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
interface Props {
  card: AnyCard | null;
  onClose: () => void;
  relatedCards?: AnyCard[];
  onSelectRelated?: (c: AnyCard) => void;
  collection?: ReturnType<typeof useCollection>;
}

export function CardDetailModal({ card, onClose, relatedCards = [], onSelectRelated, collection }: Props) {
  const [imgError, setImgError] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);
  const prevCardId = useRef<string | undefined>(undefined);

  if (card?.id !== prevCardId.current) {
    prevCardId.current = card?.id;
    if (imgError) setImgError(false);
  }

  // Escape key
  useEffect(() => {
    if (!card) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [card, onClose]);

  // Lock scroll
  useEffect(() => {
    if (card) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [card]);

  if (!card) return null;

  const isRiftbound = card.game === 'lol';

  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div className="relative bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col md:flex-row overflow-hidden flex-1 min-h-0">
          {/* ── Left: Card image ── */}
          <div className="md:w-72 shrink-0 bg-gray-950 flex items-center justify-center p-6">
            <div className="w-full" style={{ maxWidth: '240px', aspectRatio: '744/1039' }}>
              {!imgError ? (
                <img
                  src={card.imageUrl}
                  alt={card.name}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover rounded-xl shadow-2xl"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-gray-800 flex items-center justify-center">
                  <span className="text-gray-600 text-sm">No image</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Details + price ── */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {isRiftbound
              ? <RiftboundDetails card={card as RiftboundCard} />
              : <PokemonDetails card={card as PokemonCard} />
            }

            {/* Collection buttons */}
            {collection && (
              <div className="border-t border-gray-800 pt-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">My Collection</p>
                <CollectionBadge
                  status={collection.getStatus(card.id)}
                  onToggleOwned={() => collection.toggle(card.id, 'owned')}
                  onToggleWanted={() => collection.toggle(card.id, 'wanted')}
                />
              </div>
            )}

            {/* Price section */}
            <div className="border-t border-gray-800 pt-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Market Price</p>
              <PricePanel cardName={card.name} setName={card.setName} expanded />
            </div>

            {/* Related cards (other versions / printings) */}
            {relatedCards.length > 0 && (
              <div className="border-t border-gray-800 pt-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                  Other Versions ({relatedCards.length})
                </p>
                <div className="flex gap-2 flex-wrap">
                  {relatedCards.map((rc) => (
                    <button
                      key={rc.id}
                      onClick={() => onSelectRelated?.(rc)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-500 transition-colors cursor-pointer"
                    >
                      <img src={rc.imageUrl} alt={rc.name} className="w-6 h-8 object-cover rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <div className="text-left">
                        <div className="text-xs text-gray-200 font-medium">
                          {isRiftbound ? (rc as RiftboundCard).rarity : (rc as PokemonCard).printType}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          {isRiftbound ? (rc as RiftboundCard).code : `#${(rc as PokemonCard).cardNumber}`}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
