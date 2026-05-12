import { Search, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  resultCount?: number;
  placeholder?: string;
}

export function SearchBar({ value, onChange, resultCount, placeholder = 'Search cards…' }: Props) {
  return (
    <div className="relative flex items-center">
      <Search size={15} className="absolute left-3 text-gray-500 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-10 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-600
          focus:outline-none focus:border-yellow-600 focus:ring-1 focus:ring-yellow-600/30 transition-colors text-sm"
      />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-3 text-gray-500 hover:text-gray-300 cursor-pointer">
          <X size={13} />
        </button>
      )}
      {resultCount !== undefined && (
        <span className="absolute -bottom-5 right-0 text-xs text-gray-600">
          {resultCount} card{resultCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}
