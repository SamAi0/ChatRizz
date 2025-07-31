import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClose: () => void;
}

export default function SearchBar({ onSearch, onClose }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="flex items-center space-x-2 p-3 bg-gray-800/50 backdrop-blur-sm border-b border-purple-500/20">
      <Search size={20} className="text-purple-300" />
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search messages..."
        className="flex-1 bg-transparent text-white placeholder-purple-200 focus:outline-none"
        autoFocus
      />
      <button
        onClick={onClose}
        className="p-1 text-purple-300 hover:bg-white/10 rounded-full transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  );
}