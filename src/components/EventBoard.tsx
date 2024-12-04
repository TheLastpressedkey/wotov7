import React, { useState, useEffect } from 'react';
import { EventCard } from './EventCard';
import { EventSearch } from './EventSearch';
import { useEventStore } from '../store/eventStore';
import { RegistrationForm } from './volunteer/RegistrationForm';
import { TokenConfirmation } from './ui/TokenConfirmation';
import { Loader2 } from 'lucide-react';
import { EventFilter } from '../types/event';

export const EventBoard: React.FC = () => {
  const { events, loading, error, fetchEvents } = useEventStore();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmationToken, setConfirmationToken] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleRegister = (eventId: string) => {
    setSelectedEventId(eventId);
  };

  const handleRegistrationSuccess = async (token: string) => {
    setSelectedEventId(null);
    setConfirmationToken(token);
    // Rafraîchir les données après l'inscription
    await fetchEvents();
  };

  const filteredEvents = events.filter(event => {
    if (event.archived) return false;

    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.description?.toLowerCase().includes(searchTerm.toLowerCase()));

    const now = new Date();
    const eventDate = new Date(event.date);

    switch (filter) {
      case 'upcoming':
        return matchesSearch && eventDate >= now;
      case 'past':
        return matchesSearch && eventDate < now;
      case 'full':
        return matchesSearch && event.currentParticipants >= event.maxParticipants;
      case 'available':
        return matchesSearch && event.currentParticipants < event.maxParticipants;
      default:
        return matchesSearch;
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
            onClick={() => fetchEvents()}
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
      <h2 className="text-3xl font-bold mb-8">Événements</h2>
      
      <EventSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedFilter={filter}
        onFilterChange={setFilter}
      />

      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            {searchTerm 
              ? "Aucun événement ne correspond à votre recherche."
              : "Aucun événement disponible pour le moment."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onRegister={() => handleRegister(event.id!)}
              isPast={new Date(event.date) < new Date()}
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
