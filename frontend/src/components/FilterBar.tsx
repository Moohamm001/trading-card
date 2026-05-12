import { X } from 'lucide-react';
import type { PokemonFilterState, PokemonEnergyType, PrintType } from '../types';
import type { RiftboundFilters, RiftboundMeta } from '../games/lol/useRiftboundCards';

// ── Shared helpers ────────────────────────────────────────────────────────────
function toggle<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

function Chip({ label, selected, onToggle, className = '' }: {
  label: string; selected: boolean; onToggle: () => void; className?: string;
}) {
  return (
    <button
      onClick={onToggle}
      className={`px-2.5 py-1 rounded-full text-xs font-medium border bg-gray-900 transition-all cursor-pointer
        ${selected ? 'opacity-100 scale-105 !bg-gray-800' : 'opacity-40 hover:opacity-70'} ${className}`}
    >
      {label}
    </button>
  );
}

// ── Domain colour map for Riftbound ───────────────────────────────────────────
const DOMAIN_STYLE: Record<string, string> = {
  fury:      'border-red-600 text-red-300',
  calm:      'border-cyan-600 text-cyan-300',
  mind:      'border-purple-600 text-purple-300',
  body:      'border-green-600 text-green-300',
  order:     'border-yellow-600 text-yellow-300',
  chaos:     'border-indigo-600 text-indigo-300',
  colorless: 'border-gray-500 text-gray-300',
};

const DOMAIN_ICON: Record<string, string> = {
  fury: '🔥', calm: '💧', mind: '🔮', body: '🌿',
  order: '⚔️', chaos: '🌑', colorless: '⭐',
};

const RARITY_STYLE: Record<string, string> = {
  common:       'border-gray-600 text-gray-400',
  uncommon:     'border-teal-600 text-teal-300',
  rare:         'border-blue-600 text-blue-300',
  epic:         'border-purple-600 text-purple-300',
  showcase:     'border-yellow-500 text-yellow-300',
  overnumbered: 'border-amber-400 text-amber-300',
};

const TYPE_STYLE: Record<string, string> = {
  unit:        'border-orange-600 text-orange-300',
  spell:       'border-blue-600 text-blue-300',
  rune:        'border-yellow-600 text-yellow-300',
  gear:        'border-teal-600 text-teal-300',
  legend:      'border-purple-600 text-purple-300',
  battlefield: 'border-green-600 text-green-300',
  token:       'border-gray-500 text-gray-400',
};

// ── Pokemon ───────────────────────────────────────────────────────────────────
const POKEMON_ENERGY_TYPES: PokemonEnergyType[] = [
  'Fire', 'Water', 'Grass', 'Lightning', 'Psychic', 'Fighting',
  'Darkness', 'Metal', 'Dragon', 'Fairy', 'Colorless',
];
const ENERGY_ICON: Record<PokemonEnergyType, string> = {
  Fire: '🔥', Water: '💧', Grass: '🌿', Lightning: '⚡', Psychic: '🔮',
  Fighting: '👊', Darkness: '🌑', Metal: '⚙️', Dragon: '🐉', Fairy: '✨', Colorless: '⭐',
};

const PRINT_TYPES: PrintType[] = [
  'Normal', 'Foil', 'Holo', 'Reverse Holo', 'Full Art',
  'Alternate Art', 'First Edition', 'Promo', 'Secret Rare',
];
const PRINT_STYLE: Record<PrintType, string> = {
  'Normal':        'border-gray-600 text-gray-400',
  'Foil':          'border-yellow-600 text-yellow-300',
  'Holo':          'border-cyan-600 text-cyan-300',
  'Reverse Holo':  'border-teal-600 text-teal-300',
  'Full Art':      'border-purple-600 text-purple-300',
  'Alternate Art': 'border-pink-600 text-pink-300',
  'First Edition': 'border-amber-600 text-amber-300',
  'Promo':         'border-rose-600 text-rose-300',
  'Secret Rare':   'border-indigo-600 text-indigo-300',
};

// ── Riftbound FilterBar ───────────────────────────────────────────────────────
function RiftboundFilterBar({ filters, onChange, meta }: {
  filters: RiftboundFilters;
  onChange: (f: RiftboundFilters) => void;
  meta?: RiftboundMeta;
}) {
  const activeCount = filters.sets.length + filters.types.length + filters.rarities.length + filters.domains.length;
  const sortOptions: Array<{ key: RiftboundFilters['sortBy']; label: string }> = [
    { key: 'name', label: 'Name' }, { key: 'energy', label: 'Energy' },
    { key: 'set', label: 'Set' }, { key: 'rarity', label: 'Rarity' },
  ];
  const domains = meta?.domains?.length ? meta.domains : ['fury', 'calm', 'mind', 'body', 'order', 'chaos'];
  const types = meta?.types?.length ? meta.types : [];
  const rarities = meta?.rarities?.length
    ? [...meta.rarities, 'Overnumbered']
    : ['Common', 'Uncommon', 'Rare', 'Epic', 'Showcase', 'Overnumbered'];
  const sets = meta?.sets?.length ? meta.sets : [];

  return (
    <>
      {/* Sort */}
      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Sort by</label>
        <div className="flex flex-wrap gap-1.5">
          {sortOptions.map(({ key, label }) => (
            <button key={key}
              onClick={() => onChange({ ...filters, sortBy: key, sortDir: filters.sortBy === key ? (filters.sortDir === 'asc' ? 'desc' : 'asc') : 'asc' })}
              className={`px-2 py-1 rounded text-xs border capitalize transition-colors cursor-pointer
                ${filters.sortBy === key ? 'bg-yellow-800 border-yellow-600 text-yellow-300' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200'}`}>
              {label} {filters.sortBy === key ? (filters.sortDir === 'asc' ? '↑' : '↓') : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Domain */}
      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Domain</label>
        <div className="flex flex-wrap gap-1.5">
          {domains.map((d) => (
            <Chip key={d}
              label={`${DOMAIN_ICON[d] ?? ''} ${d.charAt(0).toUpperCase() + d.slice(1)}`}
              selected={filters.domains.includes(d)}
              onToggle={() => onChange({ ...filters, domains: toggle(filters.domains, d) })}
              className={DOMAIN_STYLE[d] ?? 'border-gray-600 text-gray-300'} />
          ))}
        </div>
      </div>

      {/* Rarity / Version */}
      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Rarity / Version</label>
        <div className="flex flex-wrap gap-1.5">
          {rarities.map((r) => (
            <Chip key={r}
              label={r}
              selected={filters.rarities.includes(r)}
              onToggle={() => onChange({ ...filters, rarities: toggle(filters.rarities, r) })}
              className={RARITY_STYLE[r.toLowerCase()] ?? 'border-gray-600 text-gray-300'} />
          ))}
        </div>
      </div>

      {/* Card Type */}
      {types.length > 0 && (
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Card Type</label>
          <div className="flex flex-wrap gap-1.5">
            {types.map((t) => (
              <Chip key={t}
                label={t}
                selected={filters.types.includes(t)}
                onToggle={() => onChange({ ...filters, types: toggle(filters.types, t) })}
                className={TYPE_STYLE[t.toLowerCase()] ?? 'border-gray-600 text-gray-300'} />
            ))}
          </div>
        </div>
      )}

      {/* Set */}
      {sets.length > 0 && (
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Set</label>
          <div className="flex flex-col gap-1.5">
            {sets.map((s) => (
              <button key={s.id}
                onClick={() => onChange({ ...filters, sets: toggle(filters.sets, s.id) })}
                className={`px-3 py-1.5 rounded-lg text-xs text-left border transition-all cursor-pointer
                  ${filters.sets.includes(s.id)
                    ? 'bg-yellow-900/60 border-yellow-600 text-yellow-300'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200'}`}>
                <div className="font-semibold">{s.name}</div>
                <div className="opacity-50">{s.id} · {s.collectorNumberMax} cards</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeCount > 0 && (
        <button
          onClick={() => onChange({ ...filters, sets: [], types: [], rarities: [], domains: [] })}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors cursor-pointer">
          <X size={12} /> Clear all ({activeCount})
        </button>
      )}
    </>
  );
}

// ── Pokemon FilterBar ─────────────────────────────────────────────────────────
function PokemonFilterBar({ filters, onChange, pokemonSets = [] }: {
  filters: PokemonFilterState;
  onChange: (f: PokemonFilterState) => void;
  pokemonSets?: Array<{ id: string; name: string; releaseDate: string }>;
}) {
  const activeCount = filters.energyTypes.length + filters.sets.length + filters.printTypes.length;
  return (
    <>
      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Sort by</label>
        <div className="flex gap-1.5 flex-wrap">
          {(['name', 'hp', 'rarity'] as const).map((s) => (
            <button key={s}
              onClick={() => onChange({ ...filters, sortBy: s, sortDir: filters.sortBy === s ? (filters.sortDir === 'asc' ? 'desc' : 'asc') : 'asc' })}
              className={`px-2 py-1 rounded text-xs border capitalize transition-colors cursor-pointer
                ${filters.sortBy === s ? 'bg-red-800 border-red-600 text-red-300' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200'}`}>
              {s} {filters.sortBy === s ? (filters.sortDir === 'asc' ? '↑' : '↓') : ''}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Print Version</label>
        <div className="flex flex-wrap gap-1.5">
          {PRINT_TYPES.map((p) => (
            <Chip key={p} label={p} selected={filters.printTypes.includes(p)}
              onToggle={() => onChange({ ...filters, printTypes: toggle(filters.printTypes, p) })}
              className={PRINT_STYLE[p]} />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Energy Type</label>
        <div className="flex flex-wrap gap-1.5">
          {POKEMON_ENERGY_TYPES.map((t) => (
            <button key={t}
              onClick={() => onChange({ ...filters, energyTypes: toggle(filters.energyTypes, t) })}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border bg-gray-900 transition-all cursor-pointer
                border-gray-600 text-gray-300 ${filters.energyTypes.includes(t) ? 'opacity-100 scale-105 bg-gray-800' : 'opacity-40 hover:opacity-70'}`}>
              {ENERGY_ICON[t]} {t}
            </button>
          ))}
        </div>
      </div>

      {pokemonSets.length > 0 && (
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Set</label>
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
            {pokemonSets.map((s) => (
              <button key={s.id}
                onClick={() => onChange({ ...filters, sets: toggle(filters.sets, s.id) })}
                className={`px-3 py-1.5 rounded-lg text-xs text-left border transition-all cursor-pointer
                  ${filters.sets.includes(s.id) ? 'bg-red-900/60 border-red-600 text-red-300' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200'}`}>
                <div className="font-semibold">{s.name}</div>
                <div className="opacity-60">{s.releaseDate}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeCount > 0 && (
        <button onClick={() => onChange({ ...filters, energyTypes: [], sets: [], printTypes: [] })}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors cursor-pointer">
          <X size={12} /> Clear all ({activeCount})
        </button>
      )}
    </>
  );
}

// ── Exported FilterBar wrapper ─────────────────────────────────────────────────
export type FilterBarMode =
  | { mode: 'riftbound'; filters: RiftboundFilters; onChange: (f: RiftboundFilters) => void; meta?: RiftboundMeta }
  | { mode: 'pokemon'; filters: PokemonFilterState; onChange: (f: PokemonFilterState) => void; pokemonSets?: Array<{ id: string; name: string; releaseDate: string }> };

export function FilterBar(props: FilterBarMode) {
  return (
    <aside className="w-56 shrink-0 bg-gray-900/80 border border-gray-700 rounded-xl p-4 space-y-5 self-start sticky top-[7.5rem] max-h-[calc(100vh-9rem)] overflow-y-auto">
      <span className="block text-gray-200 font-semibold text-sm uppercase tracking-wider">Filters</span>
      {props.mode === 'riftbound'
        ? <RiftboundFilterBar filters={props.filters} onChange={props.onChange} meta={props.meta} />
        : <PokemonFilterBar filters={props.filters} onChange={props.onChange} pokemonSets={props.pokemonSets} />
      }
    </aside>
  );
}
