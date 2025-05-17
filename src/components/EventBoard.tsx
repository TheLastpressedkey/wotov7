import React, { useState, useEffect } from 'react';
import { EventCard } from './EventCard';
import { RegistrationForm } from './volunteer/RegistrationForm';
import { TokenConfirmation } from './ui/TokenConfirmation';
import { Loader2, History, Search, MapPin, Users, Filter as FilterIcon } from 'lucide-react';
import { pb } from '../lib/pocketbase';
import type { EventRecord } from '../types/pocketbase';

type EventFilter = 'upcoming' | 'past';
type EventSort = 'popular' | 'date' | 'participants';
type LocationFilter = 'all' | string;

export const EventBoard: React.FC = () => {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [filter, setFilter] = useState<EventFilter>('upcoming');
  const [confirmationToken, setConfirmationToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<EventSort>('date');
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('all');
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const records = await pb.collection('events').getFullList({
        sort: 'date',
        filter: 'archived = false'
      });
      
      setEvents(records);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Une erreur est survenue lors du chargement des événements.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (eventId: string) => {
    setSelectedEventId(eventId);
  };

  const handleRegistrationSuccess = (token: string) => {
    setSelectedEventId(null);
    setConfirmationToken(token);
  };

  // Get unique locations from events
  const locations = Array.from(new Set(events.map(event => event.location)));

  // Filter and sort events
  const filteredEvents = events
    .filter(event => {
      const now = new Date();
      const eventDate = new Date(event.date);
      const matchesTimeFilter = filter === 'upcoming' ? eventDate >= now : eventDate < now;
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation = locationFilter === 'all' || event.location === locationFilter;
      
      return matchesTimeFilter && matchesSearch && matchesLocation;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          const presentA = a.registrations?.filter(reg => reg.status === 'present').length || 0;
          const presentB = b.registrations?.filter(reg => reg.status === 'present').length || 0;
          return presentB - presentA;
        case 'participants':
          const ratioA = ((a.registrations?.filter(reg => reg.status === 'present').length || 0) / a.maxParticipants) * 100;
          const ratioB = ((b.registrations?.filter(reg => reg.status === 'present').length || 0) / b.maxParticipants) * 100;
          return ratioB - ratioA;
        default:
          return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">Une erreur est survenue lors du chargement des événements.</p>
          <button
            onClick={fetchEvents}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un événement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Mobile Filter Toggle */}
        <button
          className="md:hidden w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 rounded-lg text-gray-700"
          onClick={() => setIsFilterVisible(!isFilterVisible)}
        >
          <FilterIcon className="w-5 h-5" />
          {isFilterVisible ? 'Masquer les filtres' : 'Afficher les filtres'}
        </button>

        {/* Filters */}
        <div className={`flex flex-col md:flex-row gap-4 items-start md:items-center ${isFilterVisible ? 'block' : 'hidden md:flex'}`}>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <FilterIcon className="w-5 h-5 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as EventSort)}
              className="w-full md:w-auto border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Date</option>
              <option value="popular">Popularité</option>
              <option value="participants">Taux de participation</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <MapPin className="w-5 h-5 text-gray-500" />
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full md:w-auto border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les villes</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setFilter(filter === 'upcoming' ? 'past' : 'upcoming')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors w-full md:w-auto justify-center md:justify-start"
          >
            <History className="w-5 h-5" />
            {filter === 'upcoming' ? 'Voir les événements passés' : 'Voir les événements à venir'}
          </button>
        </div>
      </div>

      {/* Results count and title */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h2 className="text-2xl md:text-3xl font-bold">
          {filter === 'upcoming' ? 'Événements à venir' : 'Événements passés'}
        </h2>
        <p className="text-gray-600">
          {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''} trouvé{filteredEvents.length > 1 ? 's' : ''}
        </p>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Aucun événement {filter === 'upcoming' ? 'à venir' : 'passé'} ne correspond à vos critères.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onRegister={() => handleRegister(event.id)}
              isPast={filter === 'past'}
            />
          ))}
        </div>
      )}

      {selectedEventId && (
        <RegistrationForm
          eventId={selectedEventId}
          onSuccess={handleRegistrationSuccess}
          onCancel={() => setSelectedEventId(null)}
        />
      )}

      {confirmationToken && (
        <TokenConfirmation
          token={confirmationToken}
          onClose={() => setConfirmationToken(null)}
        />
      )}
    </div>
  );
};