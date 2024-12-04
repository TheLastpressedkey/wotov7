import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from './ui/Input';

interface EventSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedFilter: string;
  onFilterChange: (value: string) => void;
}

export const EventSearch: React.FC<EventSearchProps> = ({
  searchTerm,
  onSearchChange,
  selectedFilter,
  onFilterChange,
}) => {
  return (
    <div className="mb-8 space-y-4">
      <Input
        icon={Search}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Rechercher un événement..."
      />
      
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 w-5 h-5" />
          <span className="text-sm text-gray-600">Filtrer par :</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedFilter === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => onFilterChange('upcoming')}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedFilter === 'upcoming'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            À venir
          </button>
          <button
            onClick={() => onFilterChange('past')}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedFilter === 'past'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Passés
          </button>
          <button
            onClick={() => onFilterChange('full')}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedFilter === 'full'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Complets
          </button>
          <button
            onClick={() => onFilterChange('available')}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedFilter === 'available'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Places disponibles
          </button>
        </div>
      </div>
    </div>
  );
};