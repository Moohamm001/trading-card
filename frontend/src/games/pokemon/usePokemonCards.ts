import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { PokemonCard, PokemonEnergyType, PrintType } from '../../types';

// Pokemon TCG API — free, public, CORS-enabled
// Returns actual high-res card scan images (images.large)
const PTCG_BASE = 'https://api.pokemontcg.io/v2';

interface PtcgCard {
  id: string;
  name: string;
  supertype: string;
  subtypes?: string[];
  hp?: string;
  types?: string[];
  evolvesFrom?: string;
  set: { id: string; name: string; series: string; releaseDate: string };
  number: string;
  rarity?: string;
  images: { small: string; large: string };
  artist?: string;
}

function ptcgRarityToPrintType(rarity?: string): PrintType {
  if (!rarity) return 'Normal';
  const r = rarity.toLowerCase();
  if (r.includes('secret')) return 'Secret Rare';
  if (r.includes('full art') || r.includes('ultra rare')) return 'Full Art';
  if (r.includes('rainbow') || r.includes('hyper')) return 'Alternate Art';
  if (r.includes('promo')) return 'Promo';
  if (r.includes('holo rare')) return 'Holo';
  if (r.includes('reverse holo')) return 'Reverse Holo';
  if (r.includes('rare')) return 'Holo';
  return 'Normal';
}

function ptcgTypeToEnergy(types?: string[]): PokemonEnergyType {
  const t = types?.[0]?.toLowerCase() ?? '';
  const map: Record<string, PokemonEnergyType> = {
    fire: 'Fire', water: 'Water', grass: 'Grass', lightning: 'Lightning',
    psychic: 'Psychic', fighting: 'Fighting', darkness: 'Darkness',
    metal: 'Metal', dragon: 'Dragon', fairy: 'Fairy', colorless: 'Colorless',
  };
  return map[t] ?? 'Colorless';
}

function toAppCard(c: PtcgCard): PokemonCard {
  return {
    id: c.id,
    game: 'pokemon',
    name: c.name,
    printType: ptcgRarityToPrintType(c.rarity),
    rarity: c.rarity ?? 'Common',
    setId: c.set.id,
    setName: c.set.name,
    setVersion: c.set.releaseDate?.slice(0, 4) ?? '???',
    hp: c.hp ? parseInt(c.hp) : undefined,
    energyType: ptcgTypeToEnergy(c.types),
    evolvesFrom: c.evolvesFrom,
    imageUrl: c.images.large,
    cardNumber: c.number,
    artist: c.artist,
  };
}

export interface PokemonCardPage {
  cards: PokemonCard[];
  totalCount: number;
  page: number;
  pageSize: number;
}

interface UsePokemonCardsOptions {
  search?: string;
  setId?: string;
  types?: PokemonEnergyType[];
  printTypes?: PrintType[];
  rarities?: string[];
  page?: number;
}

export function usePokemonCards(opts: UsePokemonCardsOptions = {}) {
  const { search = '', setId, types = [], page = 1 } = opts;

  return useQuery<PokemonCardPage>({
    queryKey: ['pokemon-cards', search, setId, types.join(','), page],
    queryFn: async () => {
      const filters: string[] = ['supertype:Pokémon'];

      if (search.trim()) {
        filters.push(`name:${search.trim()}*`);
      }
      if (setId) {
        filters.push(`set.id:${setId}`);
      }
      if (types.length > 0) {
        filters.push(`types:${types.join(' OR types:')}`);
      }

      const params = new URLSearchParams({
        q: filters.join(' '),
        page: String(page),
        pageSize: '20',
        orderBy: '-set.releaseDate,name',
      });

      const res = await axios.get<{ data: PtcgCard[]; totalCount: number; page: number; pageSize: number }>(
        `${PTCG_BASE}/cards?${params.toString()}`
      );

      return {
        cards: res.data.data.map(toAppCard),
        totalCount: res.data.totalCount,
        page: res.data.page,
        pageSize: res.data.pageSize,
      };
    },
    staleTime: 1000 * 60 * 10,
    placeholderData: (prev) => prev,
  });
}

export function usePokemonSets() {
  return useQuery({
    queryKey: ['pokemon-sets'],
    queryFn: async () => {
      const res = await axios.get<{ data: Array<{ id: string; name: string; releaseDate: string; total: number }> }>(
        `${PTCG_BASE}/sets?orderBy=-releaseDate&pageSize=40`
      );
      return res.data.data;
    },
    staleTime: 1000 * 60 * 60, // sets don't change often
  });
}
