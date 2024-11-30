import React, { useState, useEffect } from 'react';
import { EventCard } from './EventCard';
import { useEventStore } from '../store/eventStore';
import { RegistrationForm } from './volunteer/RegistrationForm';
import { Loader2 } from 'lucide-react';
import { TokenDisplay } from './volunteer/TokenDisplay';

export const EventBoard: React.FC = () => {
  const { events, loading, error, fetchEvents } = useEventStore();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [registrationToken, setRegistrationToken] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleRegister = (eventId: string) => {
    setSelectedEventId(eventId);
  };

  const handleRegistrationSuccess = (token: string) => {
    setRegistrationToken(token);
    setSelectedEventId(null);
  };

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
      <h2 className="text-3xl font-bold mb-8 text-center">
        Événements à venir
      </h2>
      {events.length === 0 ? (
        <p className="text-center text-gray-600">Aucun événement à venir pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onRegister={() => handleRegister(event.id)}
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

      {registrationToken && (
        <TokenDisplay
          token={registrationToken}
          onClose={() => setRegistrationToken(null)}
        />
      )}
    </div>
  );
};