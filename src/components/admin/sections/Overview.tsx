import React, { useState, useEffect } from 'react';
import { Calendar, Users, Activity, Loader2, TrendingUp } from 'lucide-react';
import { pb } from '../../../lib/pocketbase';
import type { EventRecord } from '../../../types/pocketbase';

export const Overview: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalParticipants: 0,
    averageParticipants: 0,
    participationRate: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer tous les événements
        const events = await pb.collection('events').getFullList<EventRecord>();
        
        const now = new Date();
        
        // Filtrer les événements à venir (non archivés)
        const upcomingEvents = events.filter(e => 
          new Date(e.date) > now && !e.archived
        );

        // Calculer le nombre total de participants "present"
        let totalParticipants = 0;
        let totalPresentParticipants = 0;
        let totalMaxParticipants = 0;

        events.forEach(event => {
          const presentParticipants = event.registrations?.filter(reg => reg.status === 'present').length || 0;
          totalParticipants += event.registrations?.length || 0;
          totalPresentParticipants += presentParticipants;
          totalMaxParticipants += event.maxParticipants;
        });

        // Calculer la moyenne de participants par événement
        const averageParticipants = events.length > 0 
          ? Math.round(totalPresentParticipants / events.length) 
          : 0;

        // Calculer le taux de participation global
        const participationRate = totalMaxParticipants > 0
          ? Math.round((totalPresentParticipants / totalMaxParticipants) * 100)
          : 0;

        setStats({
          totalEvents: events.length,
          upcomingEvents: upcomingEvents.length,
          totalParticipants: totalPresentParticipants,
          averageParticipants,
          participationRate,
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            <p className="text-gray-500">Participants confirmés</p>
            <p className="text-2xl font-bold">{stats.totalParticipants}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <Activity className="w-8 h-8 text-purple-600 mr-3" />
          <div>
            <p className="text-gray-500">Moyenne participants/événement</p>
            <p className="text-2xl font-bold">{stats.averageParticipants}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <TrendingUp className="w-8 h-8 text-orange-600 mr-3" />
          <div>
            <p className="text-gray-500">Taux de participation</p>
            <p className="text-2xl font-bold">{stats.participationRate}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};