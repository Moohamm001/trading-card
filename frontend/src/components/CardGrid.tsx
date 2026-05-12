import { useState } from 'react';
import type { PokemonCard } from '../types';
import type { RiftboundCard } from '../games/lol/useRiftboundCards';
import type { useCollection } from '../hooks/useCollection';
import { CardItem } from './CardItem';
import { CardDetailModal } from './CardDetailModal';

type AnyCard = RiftboundCard | PokemonCard;

interface Props {
  cards: AnyCard[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  total?: number;
  collection?: ReturnType<typeof useCollection>;
}

function SkeletonCard() {
  return (
    <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden animate-pulse"
      style={{ aspectRatio: '744/1039' }}>
      <div className="w-full h-full bg-gradient-to-b from-gray-800/50 to-gray-900/50" />
    </div>
  );
}

export function CardGrid({ cards, isLoading, hasMore, onLoadMore, total, collection }: Props) {
  const [selectedCard, setSelectedCard] = useState<AnyCard | null>(null);

  const relatedCards = selectedCard
    ? cards.filter((c) => c.name === selectedCard.name && c.id !== selectedCard.id)
    : [];

  if (!isLoading && cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-600">
        <span className="text-5xl mb-4">🃏</span>
        <p className="text-lg font-medium">No cards match your filters</p>
        <p className="text-sm mt-1">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {total !== undefined && (
          <p className="text-xs text-gray-500">
            {cards.length} of {total} card{total !== 1 ? 's' : ''} shown
          </p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onClick={() => setSelectedCard(card)}
              collection={collection}
            />
          ))}
          {isLoading && Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={`sk-${i}`} />)}
        </div>

        {hasMore && !isLoading && onLoadMore && (
          <div className="flex justify-center pt-2">
            <button
              onClick={onLoadMore}
              className="px-6 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm text-gray-300 transition-colors cursor-pointer"
            >
              Load more
            </button>
          </div>
        )}
      </div>

      <CardDetailModal
        card={selectedCard}
        onClose={() => setSelectedCard(null)}
        relatedCards={relatedCards}
        onSelectRelated={(c) => setSelectedCard(c)}
        collection={collection}
      />
    </>
  );
}
