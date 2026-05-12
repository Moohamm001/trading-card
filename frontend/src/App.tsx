import { useState, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GameTabs } from './components/GameTabs';
import { FilterBar } from './components/FilterBar';
import { CardGrid } from './components/CardGrid';
import { SearchBar } from './components/SearchBar';
import type { GameId, PokemonFilterState, PokemonCard } from './types';
import { usePokemonCards, usePokemonSets } from './games/pokemon/usePokemonCards';
import {
  useRiftboundCards, useRiftboundMeta,
  type RiftboundFilters, type RiftboundCard,
  DEFAULT_RIFTBOUND_FILTERS,
} from './games/lol/useRiftboundCards';
import { useCollection } from './hooks/useCollection';
import './index.css';

const queryClient = new QueryClient();

const DEFAULT_POKEMON_FILTERS: PokemonFilterState = {
  game: 'pokemon', search: '', energyTypes: [], rarities: [], sets: [], printTypes: [],
  sortBy: 'name', sortDir: 'asc',
};

const PAGE_SIZE = 40;

// ── Riftbound view ────────────────────────────────────────────────────────────
function RiftboundView({ filters, onFiltersChange, collection }: {
  filters: RiftboundFilters;
  onFiltersChange: (f: RiftboundFilters) => void;
  collection: ReturnType<typeof useCollection>;
}) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useRiftboundCards(filters);
  const { data: meta } = useRiftboundMeta();

  const allCards: RiftboundCard[] = useMemo(() => data?.cards ?? [], [data]);

  const filtered = useMemo(() => {
    let cards = allCards;
    if (filters.types.length > 1)
      cards = cards.filter((c) => filters.types.includes(c.type));
    if (filters.rarities.length >= 1) {
      const wantsOvernumbered = filters.rarities.includes('Overnumbered');
      const otherRarities = filters.rarities.filter((r) => r !== 'Overnumbered');
      if (filters.rarities.length > 1 || wantsOvernumbered) {
        cards = cards.filter((c) =>
          otherRarities.includes(c.rarity) || (wantsOvernumbered && c.isOvernumbered)
        );
      }
    }
    if (filters.domains.length > 1)
      cards = cards.filter((c) => c.domains.some((d) => filters.domains.includes(d)));
    if (filters.sets.length > 1)
      cards = cards.filter((c) => filters.sets.includes(c.setId));

    const sorted = [...cards].sort((a, b) => {
      let cmp = 0;
      if (filters.sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (filters.sortBy === 'energy') cmp = a.energy - b.energy;
      else if (filters.sortBy === 'set') cmp = a.setId.localeCompare(b.setId) || a.collectorNumber - b.collectorNumber;
      else if (filters.sortBy === 'rarity') cmp = a.rarity.localeCompare(b.rarity);
      return filters.sortDir === 'asc' ? cmp : -cmp;
    });

    return sorted;
  }, [allCards, filters]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  return (
    <div className="flex gap-5 items-start">
      <FilterBar
        mode="riftbound"
        filters={filters}
        onChange={(f) => { setPage(1); onFiltersChange(f); }}
        meta={meta}
      />
      <main className="flex-1 min-w-0 pt-1">
        <CardGrid
          cards={paginated as (RiftboundCard | PokemonCard)[]}
          isLoading={isLoading || isFetching}
          hasMore={hasMore}
          onLoadMore={() => setPage((p) => p + 1)}
          total={filtered.length}
          collection={collection}
        />
      </main>
    </div>
  );
}

// ── Pokemon view ──────────────────────────────────────────────────────────────
function PokemonView({ filters, onFiltersChange, collection }: {
  filters: PokemonFilterState;
  onFiltersChange: (f: PokemonFilterState) => void;
  collection: ReturnType<typeof useCollection>;
}) {
  const [page, setPage] = useState(1);
  const setId = filters.sets.length === 1 ? filters.sets[0] : undefined;
  const { data, isLoading, isFetching } = usePokemonCards({
    search: filters.search, setId, types: filters.energyTypes, page,
  });
  const { data: pokemonSets } = usePokemonSets();

  const filteredCards = useMemo((): PokemonCard[] => {
    if (!data?.cards) return [];
    let cards = data.cards;
    if (filters.printTypes.length > 0) cards = cards.filter((c) => filters.printTypes.includes(c.printType));
    return cards;
  }, [data, filters.printTypes]);

  const totalPages = data ? Math.ceil(data.totalCount / (data.pageSize || 20)) : 0;

  return (
    <div className="flex gap-5 items-start">
      <FilterBar
        mode="pokemon"
        filters={filters}
        onChange={(f) => { setPage(1); onFiltersChange(f); }}
        pokemonSets={pokemonSets}
      />
      <main className="flex-1 min-w-0 pt-1">
        <CardGrid
          cards={filteredCards as (RiftboundCard | PokemonCard)[]}
          isLoading={isLoading || isFetching}
          hasMore={page < totalPages}
          onLoadMore={() => setPage((p) => p + 1)}
          total={data?.totalCount}
          collection={collection}
        />
      </main>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
function AppInner() {
  const [game, setGame] = useState<GameId>('lol');
  const [riftboundFilters, setRiftboundFilters] = useState<RiftboundFilters>(DEFAULT_RIFTBOUND_FILTERS);
  const [pokemonFilters, setPokemonFilters] = useState<PokemonFilterState>(DEFAULT_POKEMON_FILTERS);
  const collection = useCollection();

  const activeSearch = game === 'lol' ? riftboundFilters.search : pokemonFilters.search;

  function handleSearch(v: string) {
    if (game === 'lol') setRiftboundFilters((f) => ({ ...f, search: v }));
    else setPokemonFilters((f) => ({ ...f, search: v }));
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900/95 border-b border-gray-800 sticky top-0 z-20 backdrop-blur-sm">
        <div className="max-w-screen-2xl mx-auto px-6 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xl">🃏</span>
            <span className="font-bold text-yellow-400 text-base">CardMarket</span>
          </div>
          <div className="flex-1">
            <SearchBar
              value={activeSearch}
              onChange={handleSearch}
              placeholder={game === 'lol' ? 'Search Riftbound cards, champions, keywords…' : 'Search Pokémon cards…'}
            />
          </div>
          {/* Collection stats */}
          {(collection.counts.owned > 0 || collection.counts.wanted > 0) && (
            <div className="flex items-center gap-3 text-xs shrink-0">
              {collection.counts.owned > 0 && (
                <span className="flex items-center gap-1 text-green-400">
                  <span className="font-bold">{collection.counts.owned}</span>
                  <span className="text-gray-500">owned</span>
                </span>
              )}
              {collection.counts.wanted > 0 && (
                <span className="flex items-center gap-1 text-yellow-400">
                  <span className="font-bold">{collection.counts.wanted}</span>
                  <span className="text-gray-500">wanted</span>
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Game tabs */}
      <div className="max-w-screen-2xl mx-auto px-6 py-3 border-b border-gray-800">
        <GameTabs active={game} onChange={setGame} />
      </div>

      {/* Content */}
      <div className="max-w-screen-2xl mx-auto px-6 py-5">
        {game === 'lol'
          ? <RiftboundView filters={riftboundFilters} onFiltersChange={setRiftboundFilters} collection={collection} />
          : <PokemonView filters={pokemonFilters} onFiltersChange={setPokemonFilters} collection={collection} />
        }
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}
