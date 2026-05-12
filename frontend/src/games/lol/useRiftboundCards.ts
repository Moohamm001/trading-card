import { useQuery, keepPreviousData } from '@tanstack/react-query';
import axios from 'axios';

export interface RiftboundCard {
  game: 'lol';
  id: string;
  name: string;
  code: string;
  setId: string;
  setName: string;
  type: string;
  rarity: string;
  domains: string[];
  energy: number;
  imageUrl: string;
  text: string;
  tags: string[];
  artist: string;
  collectorNumber: number;
  isOvernumbered: boolean;
}

export interface RiftboundMeta {
  sets: Array<{ id: string; name: string; collectorNumberMax: number }>;
  types: string[];
  rarities: string[];
  domains: string[];
}

interface CardsResponse {
  cards: RiftboundCard[];
  total: number;
  sets: RiftboundMeta['sets'];
  cachedAt: number;
}

export interface RiftboundFilters {
  search: string;
  sets: string[];
  types: string[];
  rarities: string[];
  domains: string[];
  sortBy: 'name' | 'energy' | 'rarity' | 'set';
  sortDir: 'asc' | 'desc';
}

export const DEFAULT_RIFTBOUND_FILTERS: RiftboundFilters = {
  search: '', sets: [], types: [], rarities: [], domains: [],
  sortBy: 'name', sortDir: 'asc',
};

export function useRiftboundCards(filters: RiftboundFilters) {
  // Build server-side filter params (only pass what's unambiguously filterable server-side)
  const params: Record<string, string> = {};
  if (filters.sets.length === 1) params.set = filters.sets[0];
  if (filters.types.length === 1) params.type = filters.types[0];
  // 'Overnumbered' is a client-only filter (flag on card, not a server rarity value)
  if (filters.rarities.length === 1 && filters.rarities[0] !== 'Overnumbered')
    params.rarity = filters.rarities[0];
  if (filters.domains.length === 1) params.domain = filters.domains[0];
  if (filters.search.trim()) params.q = filters.search.trim();

  return useQuery<CardsResponse>({
    queryKey: ['riftbound-cards', params],
    queryFn: async () => {
      const res = await axios.get<CardsResponse>('/api/riftbound/cards', { params });
      return res.data;
    },
    staleTime: 1000 * 60 * 30,
    placeholderData: keepPreviousData,
  });
}

export function useRiftboundMeta() {
  return useQuery<RiftboundMeta>({
    queryKey: ['riftbound-meta'],
    queryFn: async () => {
      const res = await axios.get<RiftboundMeta>('/api/riftbound/meta');
      return res.data;
    },
    staleTime: 1000 * 60 * 60,
  });
}
