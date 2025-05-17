import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Download, Search, Filter, Phone, Mail, Calendar, Eye } from 'lucide-react';
import { pb } from '../../../lib/pocketbase';
import type { EventRecord } from '../../../types/pocketbase';
import { Badge } from '../../ui/Badge';
import { VolunteerDetails } from './VolunteerDetails';

type Volunteer = {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  registrationDate: string;
  status: 'present' | 'absent' | 'undecided';
};

type VolunteerStats = {
  totalEvents: number;
  presentEvents: number;
  absentEvents: number;
  undecidedEvents: number;
  firstEventDate: Date;
};

type SortField = 'name' | 'events' | 'date';
type SortDirection = 'asc' | 'desc';

type VolunteerEvent = {
  id: string;
  title: string;
  date: string;
  status: 'present' | 'absent' | 'undecided';
  registrationDate: string;
};

type VolunteerWithDetails = {
  info: Volunteer;
  stats: VolunteerStats;
  events: VolunteerEvent[];
};

export const VolunteersManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [volunteers, setVolunteers] = useState<Map<string, VolunteerWithDetails>>(new Map());
  const [selectedVolunteer, setSelectedVolunteer] = useState<VolunteerWithDetails | null>(null);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer tous les événements
      const events = await pb.collection('events').getFullList<EventRecord>();
      
      // Créer un Map pour stocker les informations des bénévoles
      const volunteersMap = new Map<string, VolunteerWithDetails>();

      // Parcourir tous les événements pour collecter les informations des bénévoles
      events.forEach(event => {
        event.registrations?.forEach(registration => {
          const existingVolunteer = volunteersMap.get(registration.userId);
          
          const eventInfo = {
            id: event.id,
            title: event.title,
            date: event.date,
            status: registration.status,
            registrationDate: registration.registrationDate,
          };
          
          if (existingVolunteer) {
            // Mettre à jour les statistiques
            existingVolunteer.stats.totalEvents++;
            if (registration.status === 'present') existingVolunteer.stats.presentEvents++;
            if (registration.status === 'absent') existingVolunteer.stats.absentEvents++;
            if (registration.status === 'undecided') existingVolunteer.stats.undecidedEvents++;
            
            // Mettre à jour la première date d'événement si nécessaire
            const registrationDate = new Date(registration.registrationDate);
            if (registrationDate < existingVolunteer.stats.firstEventDate) {
              existingVolunteer.stats.firstEventDate = registrationDate;
            }

            // Ajouter l'événement à l'historique
            existingVolunteer.events.push(eventInfo);
          } else {
            // Créer une nouvelle entrée pour le bénévole
            volunteersMap.set(registration.userId, {
              info: {
                userId: registration.userId,
                userName: registration.userName,
                userEmail: registration.userEmail,
                userPhone: registration.userPhone,
                registrationDate: registration.registrationDate,
                status: registration.status,
              },
              stats: {
                totalEvents: 1,
                presentEvents: registration.status === 'present' ? 1 : 0,
                absentEvents: registration.status === 'absent' ? 1 : 0,
                undecidedEvents: registration.status === 'undecided' ? 1 : 0,
                firstEventDate: new Date(registration.registrationDate),
              },
              events: [eventInfo],
            });
          }
        });
      });

      setVolunteers(volunteersMap);
    } catch (err) {
      console.error('Error fetching volunteers:', err);
      setError('Erreur lors du chargement des bénévoles');
    } finally {
      setLoading(false);
    }
  };

  const downloadVolunteersList = () => {
    const csvContent = [
      ['Nom', 'Email', 'Téléphone', 'Nombre d\'événements', 'Présences', 'Absences', 'Indécis', 'Première participation'].join(','),
      ...[...volunteers.values()].map(({ info, stats }) => [
        info.userName,
        info.userEmail,
        info.userPhone || 'Non renseigné',
        stats.totalEvents,
        stats.presentEvents,
        stats.absentEvents,
        stats.undecidedEvents,
        format(stats.firstEventDate, 'Pp', { locale: fr }),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `benevoles_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const sortedVolunteers = [...volunteers.values()]
    .filter(({ info }) => 
      info.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      info.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (info.userPhone && info.userPhone.includes(searchQuery))
    )
    .sort((a, b) => {
      switch (sortField) {
        case 'name':
          return sortDirection === 'asc'
            ? a.info.userName.localeCompare(b.info.userName)
            : b.info.userName.localeCompare(a.info.userName);
        case 'events':
          return sortDirection === 'asc'
            ? a.stats.totalEvents - b.stats.totalEvents
            : b.stats.totalEvents - a.stats.totalEvents;
        case 'date':
          return sortDirection === 'asc'
            ? a.stats.firstEventDate.getTime() - b.stats.firstEventDate.getTime()
            : b.stats.firstEventDate.getTime() - a.stats.firstEventDate.getTime();
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
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

  if (selectedVolunteer) {
    return (
      <VolunteerDetails
        volunteer={{
          ...selectedVolunteer.info,
          stats: selectedVolunteer.stats,
          events: selectedVolunteer.events,
        }}
        onBack={() => setSelectedVolunteer(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Liste des bénévoles</h2>
        <button
          onClick={downloadVolunteersList}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Download className="w-5 h-5 mr-2" />
          Exporter la liste
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-lg shadow">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un bénévole..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={`${sortField}-${sortDirection}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split('-');
              setSortField(field as SortField);
              setSortDirection(direction as SortDirection);
            }}
            className="border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date-desc">Date d'inscription (récent)</option>
            <option value="date-asc">Date d'inscription (ancien)</option>
            <option value="name-asc">Nom (A-Z)</option>
            <option value="name-desc">Nom (Z-A)</option>
            <option value="events-desc">Nombre d'événements (décroissant)</option>
            <option value="events-asc">Nombre d'événements (croissant)</option>
          </select>
        </div>
      </div>

      {/* Liste des bénévoles */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bénévole
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Événements
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Présences
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Première participation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedVolunteers.map(volunteer => (
                <tr key={volunteer.info.userId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {volunteer.info.userName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <a 
                        href={`mailto:${volunteer.info.userEmail}`}
                        className="text-sm text-gray-600 hover:text-blue-600 flex items-center"
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        {volunteer.info.userEmail}
                      </a>
                      {volunteer.info.userPhone && (
                        <a 
                          href={`tel:${volunteer.info.userPhone}`}
                          className="text-sm text-gray-600 hover:text-blue-600 flex items-center"
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          {volunteer.info.userPhone}
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {volunteer.stats.totalEvents} événement{volunteer.stats.totalEvents > 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge status="present" />
                        <span className="text-sm text-gray-600">{volunteer.stats.presentEvents}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge status="absent" />
                        <span className="text-sm text-gray-600">{volunteer.stats.absentEvents}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge status="undecided" />
                        <span className="text-sm text-gray-600">{volunteer.stats.undecidedEvents}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {format(volunteer.stats.firstEventDate, 'Pp', { locale: fr })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedVolunteer(volunteer)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Voir les détails"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};