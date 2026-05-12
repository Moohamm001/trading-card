import { Bookmark, CheckCircle2 } from 'lucide-react';
import type { CollectionStatus } from '../hooks/useCollection';

interface Props {
  status: CollectionStatus;
  onToggleOwned: () => void;
  onToggleWanted: () => void;
  compact?: boolean;
}

export function CollectionBadge({ status, onToggleOwned, onToggleWanted, compact = false }: Props) {
  if (compact) {
    return (
      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onToggleOwned}
          title={status === 'owned' ? 'Remove from collection' : 'Mark as owned'}
          className={`p-1 rounded transition-colors cursor-pointer
            ${status === 'owned' ? 'text-green-400' : 'text-gray-600 hover:text-green-500'}`}
        >
          <CheckCircle2 size={14} />
        </button>
        <button
          onClick={onToggleWanted}
          title={status === 'wanted' ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`p-1 rounded transition-colors cursor-pointer
            ${status === 'wanted' ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-500'}`}
        >
          <Bookmark size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={onToggleOwned}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all cursor-pointer
          ${status === 'owned'
            ? 'bg-green-900/60 border-green-600 text-green-300'
            : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-green-700 hover:text-green-400'}`}
      >
        <CheckCircle2 size={14} />
        {status === 'owned' ? 'In Collection' : 'Own it'}
      </button>
      <button
        onClick={onToggleWanted}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all cursor-pointer
          ${status === 'wanted'
            ? 'bg-yellow-900/60 border-yellow-600 text-yellow-300'
            : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-yellow-700 hover:text-yellow-400'}`}
      >
        <Bookmark size={14} />
        {status === 'wanted' ? 'On Wishlist' : 'Want it'}
      </button>
    </div>
  );
}
