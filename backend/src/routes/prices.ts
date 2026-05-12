import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

type PriceSource = 'ebay' | 'tcgplayer' | 'cardmarket' | 'pricecharting';

interface Listing {
  title: string;
  price: number;
  currency: string;
  soldDate: string;
  condition: string;
  url: string;
  source: PriceSource;
}

interface PriceData {
  listings: Listing[];
  avgPrice: number;
  lowPrice: number;
  highPrice: number;
  lastUpdated: string;
  sources: PriceSource[];
}

// ── eBay OAuth token cache ────────────────────────────────────────────────────
let tokenCache: { token: string; expiresAt: number } | null = null;

async function getEbayToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) return tokenCache.token;

  const credentials = Buffer.from(
    `${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`
  ).toString('base64');

  const res = await axios.post(
    'https://api.ebay.com/identity/v1/oauth2/token',
    'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
    { headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  tokenCache = { token: res.data.access_token, expiresAt: Date.now() + (res.data.expires_in - 60) * 1000 };
  return tokenCache.token;
}

async function fetchEbayListings(cardName: string): Promise<Listing[]> {
  const token = await getEbayToken();
  const q = encodeURIComponent(`League of Legends trading card ${cardName}`);

  const res = await axios.get(
    `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${q}&filter=buyingOptions:{FIXED_PRICE}&limit=8&sort=newlyListed`,
    { headers: { Authorization: `Bearer ${token}`, 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US' } }
  );

  return (res.data.itemSummaries ?? []).map((item: any) => ({
    title: item.title,
    price: parseFloat(item.price?.value ?? '0'),
    currency: item.price?.currency ?? 'USD',
    soldDate: new Date().toISOString(),
    condition: item.condition ?? 'Unknown',
    url: item.itemWebUrl,
    source: 'ebay' as PriceSource,
  }));
}

// ── Deterministic mock generator ─────────────────────────────────────────────
// Prices are derived from the card name so they stay consistent between calls
function mockListings(cardName: string): Listing[] {
  const seed = cardName.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const base = 2 + (seed % 20);

  const ebayBase = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent('league of legends ' + cardName + ' trading card')}`;
  const tcgBase  = `https://www.tcgplayer.com/search/all/product?q=${encodeURIComponent(cardName)}`;
  const cmBase   = `https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=${encodeURIComponent(cardName)}`;
  const pcBase   = `https://www.pricecharting.com/search-products?q=${encodeURIComponent(cardName + ' card')}`;

  const conditions = ['Near Mint', 'Lightly Played', 'Moderately Played', 'Heavily Played'] as const;

  const ebayListings: Listing[] = conditions.map((cond, i) => ({
    title: `League of Legends ${cardName} Trading Card TCG ${cond}`,
    price: Math.round((base + i * 1.5 + (seed % 4)) * 100) / 100,
    currency: 'USD',
    soldDate: new Date(Date.now() - i * 86400000 * 3).toISOString(),
    condition: cond,
    url: ebayBase,
    source: 'ebay',
  }));

  const tcgListings: Listing[] = [
    {
      title: `${cardName} - Near Mint`,
      price: Math.round((base + 2 + (seed % 3)) * 100) / 100,
      currency: 'USD',
      soldDate: new Date(Date.now() - 86400000).toISOString(),
      condition: 'Near Mint',
      url: tcgBase,
      source: 'tcgplayer',
    },
    {
      title: `${cardName} - Lightly Played`,
      price: Math.round((base - 1 + (seed % 2)) * 100) / 100,
      currency: 'USD',
      soldDate: new Date(Date.now() - 86400000 * 2).toISOString(),
      condition: 'Lightly Played',
      url: tcgBase,
      source: 'tcgplayer',
    },
  ];

  const cmListings: Listing[] = [
    {
      title: `${cardName} NM/Mint`,
      price: Math.round((base + 1 + (seed % 5)) * 0.93 * 100) / 100, // ~EUR conversion
      currency: 'EUR',
      soldDate: new Date(Date.now() - 86400000 * 4).toISOString(),
      condition: 'Near Mint',
      url: cmBase,
      source: 'cardmarket',
    },
  ];

  const pcListings: Listing[] = [
    {
      title: `${cardName} Trading Card`,
      price: Math.round((base + (seed % 6)) * 100) / 100,
      currency: 'USD',
      soldDate: new Date(Date.now() - 86400000 * 5).toISOString(),
      condition: 'CIB',
      url: pcBase,
      source: 'pricecharting',
    },
  ];

  return [...ebayListings, ...tcgListings, ...cmListings, ...pcListings];
}

function buildResponse(listings: Listing[]): PriceData {
  const usdPrices = listings.filter((l) => l.currency === 'USD' && l.price > 0).map((l) => l.price);
  const sources = [...new Set(listings.map((l) => l.source))] as PriceSource[];

  if (usdPrices.length === 0) {
    return { listings, avgPrice: 0, lowPrice: 0, highPrice: 0, lastUpdated: new Date().toISOString(), sources };
  }

  return {
    listings,
    avgPrice: Math.round((usdPrices.reduce((a, b) => a + b, 0) / usdPrices.length) * 100) / 100,
    lowPrice: Math.min(...usdPrices),
    highPrice: Math.max(...usdPrices),
    lastUpdated: new Date().toISOString(),
    sources,
  };
}

// ── Route ─────────────────────────────────────────────────────────────────────
router.get('/card', async (req: Request, res: Response) => {
  const { name } = req.query as { name?: string; set?: string };

  if (!name) { res.status(400).json({ error: 'name is required' }); return; }

  const hasEbayCredentials = !!(process.env.EBAY_CLIENT_ID && process.env.EBAY_CLIENT_SECRET);

  if (hasEbayCredentials) {
    try {
      const ebayListings = await fetchEbayListings(name);
      // Merge eBay live data with mock data for other sources
      const otherMock = mockListings(name).filter((l) => l.source !== 'ebay');
      res.json(buildResponse([...ebayListings, ...otherMock]));
      return;
    } catch (err: any) {
      console.error('eBay API error:', err.response?.data ?? err.message);
      // Fall through to full mock
    }
  }

  // No credentials or eBay error — return mock data for all sources
  res.json(buildResponse(mockListings(name)));
});

export default router;
