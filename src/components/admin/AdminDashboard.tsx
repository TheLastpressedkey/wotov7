import React, { useEffect, useState } from 'react';
import { Calendar, Users, Activity, Loader2, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useEventStore } from '../../store/eventStore';
import { useVolunteerStore } from '../../store/volunteerStore';
import { useSupabaseStatus } from '../../hooks/useSupabaseStatus';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { VolunteerTable } from './VolunteerTable';

export const AdminDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const connectionStatus = useSupabaseStatus();
  
  const { events, fetchEvents } = useEventStore();
  const { volunteers, fetchVolunteers } = useVolunteerStore();

  // Initial data load
  useEffect(() => {
    if (connectionStatus === 'connected') {
      loadData();
    }
  }, [connectionStatus]); // Only run when connection status changes

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await fetchEvents();
      const volunteerPromises = events.map(event => fetchVolunteers(event.id));
      await Promise.all(volunteerPromises);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load data'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!isLoading && connectionStatus === 'connected') {
      await loadData();
    }
  };

  if (connectionStatus === 'connecting') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Connexion à la base de données...</p>
        </div>
      </div>
    );
  }

  if (connectionStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <WifiOff className="w-8 h-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 text-lg mb-4">
            Impossible de se connecter à la base de données.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const allVolunteers = Object.values(volunteers).flat();
  const presentVolunteers = allVolunteers.filter(v => v.status === 'present');
  const upcomingEvents = events.filter(e => new Date(e.date) > new Date());
  
  const stats = {
    totalEvents: events.length,
    upcomingEvents: upcomingEvents.length,
    totalVolunteers: presentVolunteers.length,
    averageVolunteers: upcomingEvents.length 
      ? (presentVolunteers.length / upcomingEvents.length).toFixed(1) 
      : '0',
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {isLoading ? 'Actualisation...' : 'Rafraîchir'}
          </button>
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-600">Connecté à la base de données</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-gray-500">Événements à venir</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">{stats.upcomingEvents}</p>
                <p className="text-sm text-gray-500">/ {stats.totalEvents} total</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-gray-500">Bénévoles confirmés</p>
              <p className="text-2xl font-bold">{stats.totalVolunteers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Activity className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-gray-500">Moyenne bénévoles/événement</p>
              <p className="text-2xl font-bold">{stats.averageVolunteers}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Événements à venir et leurs bénévoles</h2>
        {upcomingEvents.length === 0 ? (
          <p className="text-center text-gray-500 py-4">Aucun événement à venir</p>
        ) : (
          upcomingEvents.map(event => (
            <div key={event.id} className="mb-8 last:mb-0">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-blue-600">{event.title}</h3>
                <p className="text-sm text-gray-600">
                  {format(new Date(event.date), 'EEEE d MMMM yyyy', { locale: fr })} - {event.location}
                </p>
              </div>
              <VolunteerTable eventId={event.id} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};