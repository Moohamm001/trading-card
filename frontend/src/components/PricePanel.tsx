import { useState } from 'react';
import { ExternalLink, TrendingUp, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { PriceListing, PriceData, PriceSource } from '../types';
import { PRICE_SOURCE_META } from '../types';

interface Props {
  cardName: string;
  setName?: string;
  expanded?: boolean;
}

function useCardPrice(cardName: string, setName?: string) {
  return useQuery<PriceData>({
    queryKey: ['price', cardName, setName],
    queryFn: async () => {
      const res = await axios.get<PriceData>('/api/prices/card', {
        params: { name: cardName, set: setName },
      });
      return res.data;
    },
    staleTime: 1000 * 60 * 15,
    retry: 1,
  });
}

function SourceBadge({ source }: { source: PriceSource }) {
  const meta = PRICE_SOURCE_META[source];
  return (
    <a
      href={meta.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${meta.color} hover:opacity-80 transition-opacity shrink-0`}
    >
      {meta.label}
      <ExternalLink size={7} />
    </a>
  );
}

export function PricePanel({ cardName, setName, expanded: defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { data, isLoading, isError } = useCardPrice(cardName, setName);

  if (isLoading) {
    return (
      <div className="p-3 space-y-2 animate-pulse">
        <div className="h-3 bg-gray-800 rounded w-24" />
        <div className="h-3 bg-gray-800 rounded w-16" />
      </div>
    );
  }

  if (isError || !data || data.listings.length === 0) {
    return (
      <p className="p-2 text-xs text-gray-600 italic">No recent sold listings found</p>
    );
  }

  // Group listings by source
  const bySource = data.listings.reduce<Record<PriceSource, PriceListing[]>>((acc, l) => {
    acc[l.source] = acc[l.source] ?? [];
    acc[l.source].push(l);
    return acc;
  }, {} as Record<PriceSource, PriceListing[]>);

  return (
    <div className="p-2 space-y-2">
      {/* Summary row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <TrendingUp size={11} className="text-green-400" />
          <span className="text-xs text-gray-400">Avg</span>
          <span className="text-green-400 font-bold text-sm">${data.avgPrice.toFixed(2)}</span>
        </div>
        <div className="flex gap-2 text-xs text-gray-500">
          <span>Lo <span className="text-gray-300">${data.lowPrice.toFixed(2)}</span></span>
          <span>Hi <span className="text-gray-300">${data.highPrice.toFixed(2)}</span></span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Package size={9} />
          {data.listings.length}
        </div>
      </div>

      {/* Source badges */}
      <div className="flex gap-1 flex-wrap">
        {data.sources.map((src) => <SourceBadge key={src} source={src} />)}
      </div>

      {/* Listings toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); setExpanded((p) => !p); }}
        className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-400 transition-colors cursor-pointer"
      >
        {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        {expanded ? 'Hide' : 'Show'} listings
      </button>

      {expanded && (
        <div className="space-y-2 border-t border-gray-800 pt-2">
          {(Object.entries(bySource) as [PriceSource, PriceListing[]][]).map(([source, listings]) => (
            <div key={source}>
              <div className="mb-1"><SourceBadge source={source} /></div>
              {listings.slice(0, 3).map((l, i) => (
                <a
                  key={i}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 group py-0.5"
                >
                  <span className="flex-1 text-[10px] text-gray-500 truncate group-hover:text-blue-400 transition-colors">
                    {l.title.length > 30 ? l.title.slice(0, 30) + '…' : l.title}
                  </span>
                  <span className="text-[10px] text-gray-400 shrink-0 italic">{l.condition}</span>
                  <span className="text-xs text-green-400 font-semibold shrink-0">${l.price.toFixed(2)}</span>
                </a>
              ))}
            </div>
          ))}
          <p className="text-[9px] text-gray-700 pt-1">
            Updated: {new Date(data.lastUpdated).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}
