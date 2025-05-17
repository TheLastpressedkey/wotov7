import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Users, Calendar } from 'lucide-react';
import { pb } from '../../../lib/pocketbase';
import type { EventRecord } from '../../../types/pocketbase';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData
} from 'chart.js';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

// Enregistrer les composants Chart.js nécessaires
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const Statistics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalVolunteers: 0,
    activeEvents: 0,
    participationRate: 0,
    volunteerHours: 0,
    monthlyGrowth: 0,
    weeklyEvents: 0,
    monthlyParticipationChange: 0,
    monthlyHoursChange: 0
  });
  const [chartData, setChartData] = useState<ChartData<'line'>>({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const events = await pb.collection('events').getFullList<EventRecord>();
        
        const now = new Date();
        const sixMonthsAgo = subMonths(now, 6);
        
        // Générer les mois pour l'axe X
        const months = eachMonthOfInterval({
          start: startOfMonth(sixMonthsAgo),
          end: endOfMonth(now)
        });

        // Calculer les taux de participation par mois
        const monthlyRates = months.map(month => {
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(month);

          const monthEvents = events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= monthStart && eventDate <= monthEnd;
          });

          let totalParticipants = 0;
          let totalCapacity = 0;

          monthEvents.forEach(event => {
            const presentParticipants = event.registrations?.filter(reg => reg.status === 'present').length || 0;
            totalParticipants += presentParticipants;
            totalCapacity += event.maxParticipants;
          });

          return totalCapacity > 0 ? (totalParticipants / totalCapacity) * 100 : 0;
        });

        // Mettre à jour les données du graphique
        setChartData({
          labels: months.map(month => format(month, 'MMMM yyyy', { locale: fr })),
          datasets: [
            {
              label: 'Taux de participation (%)',
              data: monthlyRates,
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
              fill: true
            }
          ]
        });

        // Calculer les autres statistiques...
        const activeEvents = events.filter(e => !e.archived && new Date(e.date) >= now).length;
        
        const uniqueVolunteers = new Set();
        let totalPresentParticipants = 0;
        let totalMaxParticipants = 0;
        
        events.forEach(event => {
          const presentRegistrations = event.registrations?.filter(reg => reg.status === 'present') || [];
          presentRegistrations.forEach(reg => uniqueVolunteers.add(reg.userId));
          totalPresentParticipants += presentRegistrations.length;
          totalMaxParticipants += event.maxParticipants;
        });

        const participationRate = totalMaxParticipants > 0
          ? Math.round((totalPresentParticipants / totalMaxParticipants) * 100)
          : 0;

        const lastMonthEvents = events.filter(e => {
          const eventDate = new Date(e.date);
          return eventDate >= subMonths(now, 1) && eventDate <= now;
        });

        const monthlyGrowth = lastMonthEvents.length > 0
          ? Math.round((lastMonthEvents.length / events.length) * 100)
          : 0;

        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const weeklyEvents = events.filter(e => {
          const eventDate = new Date(e.date);
          return eventDate >= weekAgo && eventDate <= now;
        }).length;

        setStats({
          totalVolunteers: uniqueVolunteers.size,
          activeEvents,
          participationRate,
          volunteerHours: totalPresentParticipants * 3,
          monthlyGrowth,
          weeklyEvents,
          monthlyParticipationChange: 5,
          monthlyHoursChange: 18
        });

      } catch (err) {
        console.error('Error fetching statistics:', err);
        setError('Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Évolution du taux de participation'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Taux de participation (%)'
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Nombre total de bénévoles */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Bénévoles</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalVolunteers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>+{stats.monthlyGrowth}% ce mois</span>
          </div>
        </div>

        {/* Événements actifs */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Événements Actifs</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeEvents}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-500" />
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>+{stats.weeklyEvents} cette semaine</span>
          </div>
        </div>

        {/* Taux de participation */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Taux de Participation</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.participationRate}%</p>
            </div>
            <BarChart2 className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>+{stats.monthlyParticipationChange}% vs dernier mois</span>
          </div>
        </div>

        {/* Heures de bénévolat */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Heures de Bénévolat</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.volunteerHours}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-500" />
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>+{stats.monthlyHoursChange}% ce mois</span>
          </div>
        </div>
      </div>

      {/* Graphique des statistiques mensuelles */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiques Mensuelles</h2>
        <div className="h-[400px]">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};