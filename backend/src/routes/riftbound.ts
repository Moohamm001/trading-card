import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

// In-memory cache
interface Cache { data: NormalizedCard[]; sets: SetInfo[]; cachedAt: number }
let cache: Cache | null = null;
const CACHE_TTL = 30 * 60 * 1000; // 30 min

export interface SetInfo {
  id: string;
  name: string;
  collectorNumberMax: number;
}

export interface NormalizedCard {
  game: 'lol';
  id: string;          // e.g. "unl-131-219"
  name: string;
  code: string;        // e.g. "UNL-131"
  setId: string;       // e.g. "UNL"
  setName: string;
  type: string;        // "Champion" | "Unit" | "Spell" | "Gear" | "Rune" | "Legend" | "Battlefield" | "Token"
  rarity: string;      // "Common" | "Uncommon" | "Rare" | "Epic" | "Overnumbered"
  domains: string[];   // ["chaos"] | ["fury"] etc.
  energy: number;
  imageUrl: string;    // 744x1039 full card render from Riot CDN
  text: string;        // plain-text ability description
  tags: string[];
  artist: string;
  collectorNumber: number;
  isOvernumbered: boolean;
}

// ── Parse the deeply-nested Sanity/Next.js card objects ──────────────────────

function extractSet(raw: any): { id: string; name: string } {
  const v = raw?.set?.value;
  return { id: v?.id ?? '???', name: v?.label ?? '???' };
}

function extractRarity(raw: any): string {
  return raw?.rarity?.value?.id ?? 'common';
}

function extractType(raw: any): string {
  const types: any[] = raw?.cardType?.type ?? [];
  return types[0]?.id ?? 'unit';
}

function extractDomains(raw: any): string[] {
  const vals: any[] = raw?.domain?.values ?? [];
  return vals.map((v: any) => (v?.id ?? '').toLowerCase()).filter(Boolean);
}

function extractEnergy(raw: any): number {
  return raw?.energy?.value?.id ?? 0;
}

function extractText(raw: any): string {
  return (raw?.cardImage?.accessibilityText ?? raw?.text?.richText?.body ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractArtist(raw: any): string {
  const vals: any[] = raw?.illustrator?.values ?? [];
  return vals.map((v: any) => v?.label ?? '').filter(Boolean).join(', ');
}

function normalize(raw: any, sets: SetInfo[]): NormalizedCard | null {
  if (!raw?.name || !raw?.cardImage?.url) return null;

  const { id: setId, name: setName } = extractSet(raw);
  const collectorNumber = typeof raw.collectorNumber === 'number' ? raw.collectorNumber : parseInt(raw.collectorNumber, 10);
  const rawRarity = extractRarity(raw);
  const setInfo = sets.find((s) => s.id === setId);
  const isOvernumbered = rawRarity === 'overnumbered'
    || (setInfo !== undefined && collectorNumber > setInfo.collectorNumberMax);

  // Capitalise first letter to match our display conventions
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const code = (raw.publicCode as string | undefined)?.split('/')?.[0]?.trim() ?? `${setId}-${collectorNumber}`;

  return {
    game: 'lol' as const,
    id: raw.id ?? code.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    name: raw.name as string,
    code,
    setId,
    setName,
    type: cap(extractType(raw)),
    rarity: cap(rawRarity),
    domains: extractDomains(raw),
    energy: extractEnergy(raw),
    imageUrl: raw.cardImage.url as string,
    text: extractText(raw),
    tags: [],
    artist: extractArtist(raw),
    collectorNumber,
    isOvernumbered,
  };
}

// ── Fetch pipeline ─────────────────────────────────────────────────────────────

async function getBuildId(): Promise<string> {
  const res = await axios.get('https://riftbound.leagueoflegends.com/en-us/card-gallery/', {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CardMarket/1.0)', Accept: 'text/html' },
    timeout: 15000,
  });
  const match = (res.data as string).match(/\/_next\/static\/([^/]+)\/_buildManifest\.js/);
  if (!match?.[1]) throw new Error('Could not extract buildId from Riftbound site');
  return match[1];
}

async function fetchAll(): Promise<Cache> {
  const buildId = await getBuildId();
  console.log(`[Riftbound] buildId=${buildId}`);

  const url = `https://riftbound.leagueoflegends.com/_next/data/${buildId}/en-us/card-gallery.json`;
  const res = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CardMarket/1.0)', Accept: 'application/json' },
    timeout: 30000,
  });

  // Extract set metadata from blade[2].sets.items
  const blades: any[] = res.data?.pageProps?.page?.blades ?? [];
  const cardBlade = blades.find((b: any) => Array.isArray(b?.cards?.items));
  if (!cardBlade) throw new Error('Could not find card blade in API response');

  const sets: SetInfo[] = (cardBlade.sets?.items ?? []).map((s: any) => ({
    id: s.id ?? '???',
    name: s.name ?? s.id ?? '???',
    collectorNumberMax: s.collectorNumberMax ?? 999,
  }));

  const rawCards: any[] = cardBlade.cards.items;
  console.log(`[Riftbound] Got ${rawCards.length} raw cards across ${sets.length} sets`);

  const cards = rawCards.map((r) => normalize(r, sets)).filter((c): c is NormalizedCard => c !== null);
  console.log(`[Riftbound] Normalized ${cards.length} cards`);

  return { data: cards, sets, cachedAt: Date.now() };
}

async function getCache(): Promise<Cache> {
  if (cache && Date.now() - cache.cachedAt < CACHE_TTL) return cache;
  cache = await fetchAll();
  return cache;
}

// ── Routes ──────────────────────────────────────────────────────────────────

router.get('/cards', async (req: Request, res: Response) => {
  try {
    const { data, sets, cachedAt } = await getCache();

    // Optional server-side filtering
    const { set, type, rarity, domain, q } = req.query as Record<string, string | undefined>;
    let filtered = data;

    if (set) filtered = filtered.filter((c) => c.setId === set.toUpperCase());
    if (type) filtered = filtered.filter((c) => c.type.toLowerCase() === type.toLowerCase());
    if (rarity) filtered = filtered.filter((c) => c.rarity.toLowerCase() === rarity.toLowerCase());
    if (domain) filtered = filtered.filter((c) => c.domains.includes(domain.toLowerCase()));
    if (q) {
      const ql = q.toLowerCase();
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(ql) ||
        c.text.toLowerCase().includes(ql) ||
        c.type.toLowerCase().includes(ql) ||
        c.domains.some((d) => d.includes(ql))
      );
    }

    res.json({ cards: filtered, total: filtered.length, sets, cachedAt });
  } catch (err: any) {
    console.error('[Riftbound] Error:', err.message);
    res.status(502).json({ error: 'Failed to fetch Riftbound card data', detail: err.message });
  }
});

router.get('/meta', async (_req: Request, res: Response) => {
  try {
    const { data, sets } = await getCache();
    const types = [...new Set(data.map((c) => c.type))].sort();
    const rarities = [...new Set(data.map((c) => c.rarity))].sort();
    const domains = [...new Set(data.flatMap((c) => c.domains))].sort();
    res.json({ sets, types, rarities, domains });
  } catch (err: any) {
    res.status(502).json({ error: err.message });
  }
});

export default router;
