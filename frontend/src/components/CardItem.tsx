import { useState } from 'react';
import { DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import type { PokemonCard } from '../types';
import type { RiftboundCard } from '../games/lol/useRiftboundCards';
import type { useCollection } from '../hooks/useCollection';
import { RiftboundCardFrame } from './frames/RiftboundCardFrame';
import { PokemonCardFrame } from './frames/PokemonCardFrame';
import { PricePanel } from './PricePanel';
import { CollectionBadge } from './CollectionBadge';

type AnyCard = RiftboundCard | PokemonCard;

function PriceToggle({ cardName, setName }: { cardName: string; setName: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((p) => !p); }}
        className="flex items-center justify-center gap-1.5 w-full py-1.5 text-xs text-gray-500 hover:text-green-400 transition-colors cursor-pointer"
      >
        <DollarSign size={11} />
        {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        {open ? 'Hide price' : 'Check price'}
      </button>
      {open && <PricePanel cardName={cardName} setName={setName} />}
    </div>
  );
}

interface Props {
  card: AnyCard;
  onClick?: () => void;
  collection?: ReturnType<typeof useCollection>;
}

export function CardItem({ card, onClick, collection }: Props) {
  const status = collection?.getStatus(card.id) ?? null;

  const collectionSlot = collection ? (
    <div className="flex items-center justify-between px-2 py-1 border-t border-gray-800">
      <CollectionBadge
        status={status}
        onToggleOwned={() => collection.toggle(card.id, 'owned')}
        onToggleWanted={() => collection.toggle(card.id, 'wanted')}
        compact
      />
      {status && (
        <span className={`text-[10px] font-medium ${status === 'owned' ? 'text-green-500' : 'text-yellow-500'}`}>
          {status === 'owned' ? '✓ owned' : '★ wanted'}
        </span>
      )}
    </div>
  ) : null;

  const priceSlot = (
    <div>
      <PriceToggle cardName={card.name} setName={card.setName} />
      {collectionSlot}
    </div>
  );

  if (card.game === 'pokemon') {
    return (
      <PokemonCardFrame
        card={card}
        onClick={onClick}
        priceSlot={priceSlot}
      />
    );
  }

  return (
    <RiftboundCardFrame
      card={card as RiftboundCard}
      onClick={onClick}
      priceSlot={priceSlot}
    />
  );
}
