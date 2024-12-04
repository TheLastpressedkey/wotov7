import React, { useState, useEffect } from 'react';
import { EventCard } from './EventCard';
import { useEventStore } from '../store/eventStore';
import { RegistrationForm } from './volunteer/RegistrationForm';
import { Loader2, History } from 'lucide-react';
import { EventFilter } from '../types/event';

export const EventBoard: React.FC = () => {
  const { events, loading, error, fetchEvents } = useEventStore();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [filter, setFilter] = useState<EventFilter>('upcoming');

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleRegister = (eventId: string) => {
    setSelectedEventId(eventId);
  };

  const handleRegistrationSuccess = (token: string) => {
    alert(`Inscription réussie ! Votre token est : ${token}\nConservez ce token pour modifier votre inscription ultérieurement.`);
    setSelectedEventId(null);
  };

  const filteredEvents = events.filter(event => {
    const now = new Date();
    const eventDate = new Date(event.date);

    if (event.archived) return false;

    switch (filter) {
      case 'upcoming':
        return eventDate >= now;
      case 'past':
        return eventDate < now;
      default:
        return true;
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
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">
          {filter === 'upcoming' ? 'Événements à venir' : 'Événements passés'}
        </h2>
        <button
          onClick={() => setFilter(filter === 'upcoming' ? 'past' : 'upcoming')}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <History className="w-5 h-5" />
          {filter === 'upcoming' ? 'Voir les événements passés' : 'Voir les événements à venir'}
        </button>
      </div>

      {filteredEvents.length === 0 ? (
        <p className="text-center text-gray-600">Aucun événement {filter === 'upcoming' ? 'à venir' : 'passé'} pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onRegister={() => handleRegister(event.id!)}
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
    </div>
  );
};