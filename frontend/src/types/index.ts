// ── Game registry ────────────────────────────────────────────────────────────
export type GameId = 'lol' | 'pokemon';

export interface GameDef {
  id: GameId;
  label: string;
  icon: string;
  color: string; // tailwind bg class for tab accent
}

export const GAMES: GameDef[] = [
  { id: 'lol', label: 'League of Legends', icon: '⚔️', color: 'from-yellow-600 to-yellow-800' },
  { id: 'pokemon', label: 'Pokémon', icon: '⚡', color: 'from-yellow-400 to-red-500' },
];

// ── Print types (versions) ────────────────────────────────────────────────────
export type PrintType =
  | 'Normal'
  | 'Foil'
  | 'Holo'
  | 'Reverse Holo'
  | 'Full Art'
  | 'Alternate Art'
  | 'First Edition'
  | 'Promo'
  | 'Secret Rare';

// ── LoL-specific ──────────────────────────────────────────────────────────────
export type LolCardType = 'Champion' | 'Spell' | 'Landmark' | 'Equipment' | 'Trap' | 'Support';
export type LolRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type LolRegion =
  | 'Demacia' | 'Noxus' | 'Freljord' | 'Piltover' | 'Zaun'
  | 'Ionia' | 'Shadow Isles' | 'Bilgewater' | 'Shurima' | 'Targon'
  | 'Void' | 'Bandle City';

export interface LolCard {
  id: string;
  game: 'lol';
  name: string;
  type: LolCardType;
  rarity: LolRarity;
  region: LolRegion;
  setId: string;
  setName: string;
  setVersion: string;
  printType: PrintType;
  cost: number;
  attack?: number;
  health?: number;
  description: string;
  flavorText?: string;
  imageUrl: string;
  keywords: string[];
  cardNumber: string;
}

// ── Pokemon-specific ──────────────────────────────────────────────────────────
export type PokemonEnergyType =
  | 'Fire' | 'Water' | 'Grass' | 'Lightning' | 'Psychic'
  | 'Fighting' | 'Darkness' | 'Metal' | 'Dragon' | 'Fairy' | 'Colorless';

export interface PokemonCard {
  id: string;
  game: 'pokemon';
  name: string;
  printType: PrintType;
  rarity: string;
  setId: string;
  setName: string;
  setVersion: string;
  hp?: number;
  energyType: PokemonEnergyType;
  evolvesFrom?: string;
  imageUrl: string; // full card scan from pokemontcg.io
  cardNumber: string;
  artist?: string;
}

// ── Unified card type ─────────────────────────────────────────────────────────
export type AnyCard = LolCard | PokemonCard;

// ── Price types ───────────────────────────────────────────────────────────────
export type PriceSource = 'ebay' | 'tcgplayer' | 'cardmarket' | 'pricecharting';

export const PRICE_SOURCE_META: Record<PriceSource, { label: string; color: string; url: string }> = {
  ebay: { label: 'eBay', color: 'bg-yellow-800 text-yellow-300', url: 'https://www.ebay.com' },
  tcgplayer: { label: 'TCGplayer', color: 'bg-blue-800 text-blue-300', url: 'https://www.tcgplayer.com' },
  cardmarket: { label: 'Cardmarket', color: 'bg-green-800 text-green-300', url: 'https://www.cardmarket.com' },
  pricecharting: { label: 'PriceCharting', color: 'bg-purple-800 text-purple-300', url: 'https://www.pricecharting.com' },
};

export interface PriceListing {
  title: string;
  price: number;
  currency: string;
  soldDate: string;
  condition: string;
  url: string;
  source: PriceSource;
}

export interface PriceData {
  listings: PriceListing[];
  avgPrice: number;
  lowPrice: number;
  highPrice: number;
  lastUpdated: string;
  sources: PriceSource[];
}

// ── Filter state ──────────────────────────────────────────────────────────────
export interface LolFilterState {
  game: 'lol';
  search: string;
  types: LolCardType[];
  rarities: LolRarity[];
  regions: LolRegion[];
  sets: string[];
  printTypes: PrintType[];
  sortBy: 'name' | 'cost' | 'rarity';
  sortDir: 'asc' | 'desc';
}

export interface PokemonFilterState {
  game: 'pokemon';
  search: string;
  energyTypes: PokemonEnergyType[];
  rarities: string[];
  sets: string[];
  printTypes: PrintType[];
  sortBy: 'name' | 'hp' | 'rarity';
  sortDir: 'asc' | 'desc';
}

export type FilterState = LolFilterState | PokemonFilterState;
