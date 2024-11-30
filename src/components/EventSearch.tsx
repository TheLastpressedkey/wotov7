import React from 'react';
import { Search } from 'lucide-react';

interface EventSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  selectedFilter: string;
}

export const EventSearch: React.FC<EventSearchProps> = ({
  searchTerm,
  onSearchChange,
  onFilterChange,
  selectedFilter,
}) => {
  return (
    <div className="mb-8 space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher un événement..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => onFilterChange('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            selectedFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Tous
        </button>
        <button
          onClick={() => onFilterChange('upcoming')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            selectedFilter === 'upcoming'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          À venir
        </button>
        <button
          onClick={() => onFilterChange('available')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            selectedFilter === 'available'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Places disponibles
        </button>
      </div>
    </div>
  );
};