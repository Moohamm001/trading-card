import type { GameId } from '../types';
import { GAMES } from '../types';

interface Props {
  active: GameId;
  onChange: (g: GameId) => void;
}

const FUTURE_GAMES = [
  { label: 'Magic: The Gathering', icon: '🧙' },
  { label: 'Yu-Gi-Oh!', icon: '👁️' },
  { label: 'One Piece', icon: '🏴‍☠️' },
];

export function GameTabs({ active, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {GAMES.map((g) => (
        <button
          key={g.id}
          onClick={() => onChange(g.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all whitespace-nowrap cursor-pointer
            ${active === g.id
              ? `bg-gradient-to-r ${g.color} text-white shadow-lg shadow-black/30`
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
            }`}
        >
          <span className="text-base">{g.icon}</span>
          {g.label}
        </button>
      ))}

      <div className="h-6 w-px bg-gray-700 mx-1 shrink-0" />

      {/* Future game placeholders */}
      {FUTURE_GAMES.map((g) => (
        <button
          key={g.label}
          disabled
          title="Coming soon"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-600 bg-gray-900 border border-gray-800 border-dashed cursor-not-allowed opacity-50 whitespace-nowrap"
        >
          <span className="text-sm">{g.icon}</span>
          {g.label}
          <span className="text-[10px] text-gray-700 font-medium">soon</span>
        </button>
      ))}
    </div>
  );
}
