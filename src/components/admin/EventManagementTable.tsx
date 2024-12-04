import React, { useState } from 'react';
import { useEventStore } from '../../store/eventStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Pencil, Trash2, Loader2, Archive, RefreshCw } from 'lucide-react';
import { Event, EventFilter } from '../../types/event';
import { UpdateEventForm } from './UpdateEventForm';
import clsx from 'clsx';

export const EventManagementTable: React.FC = () => {
  const { events, removeEvent, toggleArchive } = useEventStore();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isArchiving, setIsArchiving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<EventFilter>('upcoming');

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return;
    }

    setIsDeleting(id);
    setError(null);

    try {
      await removeEvent(id);
    } catch (err) {
      setError('Erreur lors de la suppression de l\'événement');
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleArchive = async (event: Event) => {
    setIsArchiving(event.id!);
    setError(null);

    try {
      await toggleArchive(event.id!, !event.archived);
    } catch (err) {
      setError('Erreur lors de l\'archivage de l\'événement');
      console.error('Archive error:', err);
    } finally {
      setIsArchiving(null);
    }
  };

  const filteredEvents = events.filter(event => {
    const now = new Date();
    const eventDate = new Date(event.date);

    switch (filter) {
      case 'upcoming':
        return eventDate >= now && !event.archived;
      case 'past':
        return eventDate < now && !event.archived;
      case 'archived':
        return event.archived;
      default:
        return true;
    }
  });

  return (
    <>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('upcoming')}
            className={clsx(
              "px-4 py-2 rounded-md text-sm font-medium",
              filter === 'upcoming'
                ? "bg-blue-100 text-blue-700"
                : "text-gray-500 hover:bg-gray-100"
            )}
          >
            À venir
          </button>
          <button
            onClick={() => setFilter('past')}
            className={clsx(
              "px-4 py-2 rounded-md text-sm font-medium",
              filter === 'past'
                ? "bg-blue-100 text-blue-700"
                : "text-gray-500 hover:bg-gray-100"
            )}
          >
            Passés
          </button>
          <button
            onClick={() => setFilter('archived')}
            className={clsx(
              "px-4 py-2 rounded-md text-sm font-medium",
              filter === 'archived'
                ? "bg-blue-100 text-blue-700"
                : "text-gray-500 hover:bg-gray-100"
            )}
          >
            Archivés
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Titre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lieu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Participants
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEvents.map((event) => (
              <tr key={event.id} className={clsx(event.archived && "bg-gray-50")}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(event.date), 'Pp', { locale: fr })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {event.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {event.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {event.currentParticipants}/{event.maxParticipants}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Modifier"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleArchive(event)}
                      disabled={isArchiving === event.id}
                      className={clsx(
                        "hover:text-blue-900 disabled:opacity-50",
                        event.archived ? "text-green-600" : "text-blue-600"
                      )}
                      title={event.archived ? "Restaurer" : "Archiver"}
                    >
                      {isArchiving === event.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : event.archived ? (
                        <RefreshCw className="w-5 h-5" />
                      ) : (
                        <Archive className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(event.id!)}
                      disabled={isDeleting === event.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      title="Supprimer"
                    >
                      {isDeleting === event.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedEvent && (
        <UpdateEventForm
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </>
  );
};