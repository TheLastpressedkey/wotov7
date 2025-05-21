import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { pb, isAdmin } from '../../lib/pocketbase';
import { Calendar, MapPin, Users, Clock, CheckCircle2, XCircle, HelpCircle, Settings as SettingsIcon, Award, Star, Calendar as CalendarIcon, TrendingUp, Filter, Search, ChevronDown } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Settings } from './Settings';
import { UpdateStatusModal } from '../volunteer/UpdateStatusModal';
import { AddToCalendarButton } from 'add-to-calendar-button-react';

type View = 'overview' | 'events' | 'settings';
type StatusFilter = 'all' | 'present' | 'absent' | 'undecided';
type SortBy = 'date' | 'title' | 'location';

type UserRegistration = {
  userId: string;
  userName: string;
  userEmail: string;
  status: 'present' | 'absent' | 'undecided';
  token: string;
  registrationDate: string;
};

type Event = {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  startTime?: string;
  endTime?: string;
  maxParticipants: number;
  currentParticipants: number;
  registrations?: UserRegistration[];
};

type UpdateStatusInfo = {
  eventId: string;
  token: string;
  currentStatus: 'present' | 'absent' | 'undecided';
} | null;

export const UserDashboard: React.FC = () => {
  const user = pb.authStore.model;
  const [view, setView] = useState<View>('overview');
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateStatusInfo, setUpdateStatusInfo] = useState<UpdateStatusInfo>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortDirection, setDirection] = useState<'asc' | 'desc'>('desc');
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const fetchUserEvents = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);

      const records = await pb.collection('events').getFullList<Event>();
      
      const eventsWithRegistrations = records.filter(event => 
        event.registrations?.some(reg => reg.userId === user.id) ?? false
      );

      setUserEvents(eventsWithRegistrations);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Erreur lors du chargement de vos inscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserEvents();
  }, [user?.id]);

  if (!user || isAdmin()) {
    return <Navigate to="/login" replace />;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <HelpCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present':
        return 'Présent';
      case 'absent':
        return 'Absent';
      default:
        return 'Indécis';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'undecided':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const now = new Date();
  const startMonth = startOfMonth(now);
  const endMonth = endOfMonth(now);

  const stats = {
    totalEvents: userEvents.length,
    confirmedThisMonth: userEvents.filter(event => {
      const eventDate = new Date(event.date);
      const registration = event.registrations?.find(reg => reg.userId === user.id);
      return eventDate >= startMonth && 
             eventDate <= endMonth && 
             registration?.status === 'present';
    }).length,
    totalConfirmed: userEvents.filter(event => 
      event.registrations?.find(reg => reg.userId === user.id)?.status === 'present'
    ).length,
    participationRate: userEvents.length > 0 
      ? Math.round((userEvents.filter(event => 
          event.registrations?.find(reg => reg.userId === user.id)?.status === 'present'
        ).length / userEvents.length) * 100)
      : 0
  };

  const filteredAndSortedEvents = userEvents
    .filter(event => {
      const registration = event.registrations?.find(reg => reg.userId === user.id);
      const matchesStatus = statusFilter === 'all' || registration?.status === statusFilter;
      const matchesSearch = searchQuery === '' || 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      switch (sortBy) {
        case 'title':
          return direction * a.title.localeCompare(b.title);
        case 'location':
          return direction * a.location.localeCompare(b.location);
        default:
          return direction * (new Date(a.date).getTime() - new Date(b.date).getTime());
      }
    });

  const formatEventForCalendar = (event: Event) => {
    const startDate = format(new Date(event.date), 'yyyy-MM-dd');
    const endDate = format(new Date(event.date), 'yyyy-MM-dd');
    
    return {
      name: event.title,
      description: event.description || '',
      location: event.location,
      startDate,
      endDate,
      startTime: event.startTime || '09:00',
      endTime: event.endTime || '18:00',
      options: ['Google', 'Apple', 'Outlook', 'iCal'],
      timeZone: "Europe/Paris"
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10 md:hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            Bonjour {user?.surname} 👋
          </h1>
          <button
            onClick={() => setIsFilterVisible(!isFilterVisible)}
            className="p-2 text-gray-600 hover:text-blue-600"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex mt-4 border rounded-lg overflow-hidden">
          <button
            onClick={() => setView('overview')}
            className={`flex-1 py-2 text-sm font-medium ${
              view === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600'
            }`}
          >
            Vue d'ensemble
          </button>
          <button
            onClick={() => setView('events')}
            className={`flex-1 py-2 text-sm font-medium ${
              view === 'events'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600'
            }`}
          >
            Événements
          </button>
          <button
            onClick={() => setView('settings')}
            className={`flex-1 py-2 text-sm font-medium ${
              view === 'settings'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600'
            }`}
          >
            Paramètres
          </button>
        </div>

        {view === 'events' && isFilterVisible && (
          <div className="mt-4 space-y-3 p-4 bg-gray-50 rounded-lg">
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
            
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Statut</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="w-full border border-gray-300 rounded-lg py-2 px-3"
              >
                <option value="all">Tous les statuts</option>
                <option value="present">Présent</option>
                <option value="absent">Absent</option>
                <option value="undecided">Indécis</option>
              </select>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Trier par</label>
              <select
                value={`${sortBy}-${sortDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-');
                  setSortBy(field as SortBy);
                  setDirection(direction as 'asc' | 'desc');
                }}
                className="w-full border border-gray-300 rounded-lg py-2 px-3"
              >
                <option value="date-desc">Date (plus récent)</option>
                <option value="date-asc">Date (plus ancien)</option>
                <option value="title-asc">Titre (A-Z)</option>
                <option value="title-desc">Titre (Z-A)</option>
                <option value="location-asc">Lieu (A-Z)</option>
                <option value="location-desc">Lieu (Z-A)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="hidden md:block max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bonjour {user?.surname} 👋
            </h1>
            <p className="text-gray-600">
              Bienvenue sur votre tableau de bord
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setView('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                view === 'overview'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              Vue d'ensemble
            </button>
            <button
              onClick={() => setView('events')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                view === 'events'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calendar className="w-5 h-5" />
              Événements
            </button>
            <button
              onClick={() => setView('settings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                view === 'settings'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <SettingsIcon className="w-5 h-5" />
              Paramètres
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        {view === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 md:hidden">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Ce mois</p>
                <p className="text-2xl font-bold text-blue-600">{stats.confirmedThisMonth}</p>
                <p className="text-xs text-gray-500">événements</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalEvents}</p>
                <p className="text-xs text-gray-500">événements</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Présences</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalConfirmed}</p>
                <p className="text-xs text-gray-500">confirmées</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Participation</p>
                <p className="text-2xl font-bold text-orange-600">{stats.participationRate}%</p>
                <p className="text-xs text-gray-500">taux moyen</p>
              </div>
            </div>

            <div className="hidden md:grid md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Événements ce mois</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.confirmedThisMonth}</p>
                  </div>
                  <CalendarIcon className="w-10 h-10 text-blue-100" />
                </div>
                <p className="text-xs text-gray-500 mt-2">Participations confirmées</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total événements</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.totalEvents}</p>
                  </div>
                  <Award className="w-10 h-10 text-purple-100" />
                </div>
                <p className="text-xs text-gray-500 mt-2">Inscriptions totales</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Participations</p>
                    <p className="text-3xl font-bold text-green-600">{stats.totalConfirmed}</p>
                  </div>
                  <Star className="w-10 h-10 text-green-100" />
                </div>
                <p className="text-xs text-gray-500 mt-2">Présences confirmées</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Taux de participation</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.participationRate}%</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-orange-100" />
                </div>
                <p className="text-xs text-gray-500 mt-2">Ratio de présence</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm md:shadow-md">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Vos prochains événements</h2>
              </div>
              <div className="divide-y">
                {userEvents
                  .filter(event => new Date(event.date) >= now)
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .slice(0, 3)
                  .map(event => {
                    const registration = event.registrations?.find(reg => reg.userId === user.id);
                    if (!registration) return null;

                    const calendarEvent = formatEventForCalendar(event);

                    return (
                      <div key={event.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{event.title}</h3>
                            <div className="mt-1 flex flex-col space-y-1 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span>{format(new Date(event.date), 'PPP', { locale: fr })}</span>
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <AddToCalendarButton
                              name={calendarEvent.name}
                              description={calendarEvent.description}
                              location={calendarEvent.location}
                              startDate={calendarEvent.startDate}
                              endDate={calendarEvent.endDate}
                              startTime={calendarEvent.startTime}
                              endTime={calendarEvent.endTime}
                              timeZone={calendarEvent.timeZone}
                              options={calendarEvent.options}
                              buttonStyle="text"
                              hideTextLabelButton
                              size="2"
                              className="!p-0"
                            />
                            <div className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(registration.status)}`}>
                              {getStatusText(registration.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {view === 'events' && (
          <div className="space-y-4">
            <div className="hidden md:flex justify-between items-center bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center space-x-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un événement..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="border border-gray-300 rounded-lg py-2 px-3"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="present">Présent</option>
                  <option value="absent">Absent</option>
                  <option value="undecided">Indécis</option>
                </select>
              </div>
              <select
                value={`${sortBy}-${sortDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-');
                  setSortBy(field as SortBy);
                  setDirection(direction as 'asc' | 'desc');
                }}
                className="border border-gray-300 rounded-lg py-2 px-3"
              >
                <option value="date-desc">Date (plus récent)</option>
                <option value="date-asc">Date (plus ancien)</option>
                <option value="title-asc">Titre (A-Z)</option>
                <option value="title-desc">Titre (Z-A)</option>
                <option value="location-asc">Lieu (A-Z)</option>
                <option value="location-desc">Lieu (Z-A)</option>
              </select>
            </div>

            <div className="bg-white rounded-lg shadow-md">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Chargement de vos inscriptions...</p>
                </div>
              ) : error ? (
                <div className="p-4">
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                    {error}
                  </div>
                </div>
              ) : filteredAndSortedEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">
                    {searchQuery 
                      ? "Aucun événement ne correspond à votre recherche."
                      : statusFilter === 'all' 
                        ? "Vous n'êtes inscrit à aucun événement pour le moment."
                        : `Aucun événement avec le statut "${getStatusText(statusFilter)}".`}
                  </p>
                  {statusFilter === 'all' && !searchQuery && (
                    <a 
                      href="/"
                      className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Voir les événements disponibles
                    </a>
                  )}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredAndSortedEvents.map((event) => {
                    const registration = event.registrations?.find(reg => reg.userId === user.id);
                    if (!registration) return null;
                    
                    const calendarEvent = formatEventForCalendar(event);
                    
                    return (
                      <div key={event.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div className="flex items-center text-gray-500">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>{format(new Date(event.date), 'PPP', { locale: fr })}</span>
                              </div>
                              {(event.startTime || event.endTime) && (
                                <div className="flex items-center text-gray-500">
                                  <Clock className="w-4 h-4 mr-2" />
                                  <span>
                                    {event.startTime && event.endTime
                                      ? `${event.startTime} - ${event.endTime}`
                                      : event.startTime || event.endTime}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center text-gray-500">
                                <MapPin className="w-4 h-4 mr-2" />
                                <span>{event.location}</span>
                              </div>
                              <div className="flex items-center text-gray-500">
                                <Users className="w-4 h-4 mr-2" />
                                <span>
                                  {event.currentParticipants}/{event.maxParticipants} participants
                                </span>
                              </div>
                            </div>
                            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <div className="text-sm text-gray-500">
                                <span className="font-medium">Token :</span>{' '}
                                <code className="bg-gray-100 px-2 py-1 rounded">
                                  {registration.token}
                                </code>
                              </div>
                              <div className="flex items-center gap-4">
                                <AddToCalendarButton
                                  name={calendarEvent.name}
                                  description={calendarEvent.description}
                                  location={calendarEvent.location}
                                  startDate={calendarEvent.startDate}
                                  endDate={calendarEvent.endDate}
                                  startTime={calendarEvent.startTime}
                                  endTime={calendarEvent.endTime}
                                  timeZone={calendarEvent.timeZone}
                                  options={calendarEvent.options}
                                  buttonStyle="text"
                                  hideTextLabelButton
                                  size="2"
                                  className="!p-0"
                                />
                                <button 
                                  onClick={() => setUpdateStatusInfo({
                                    eventId: event.id,
                                    token: registration.token,
                                    currentStatus: registration.status
                                  })}
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                  Modifier mon statut
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(registration.status)}`}>
                            {getStatusText(registration.status)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'settings' && <Settings />}
      </div>

      {updateStatusInfo && (
        <UpdateStatusModal
          eventId={updateStatusInfo.eventId}
          token={updateStatusInfo.token}
          currentStatus={updateStatusInfo.currentStatus}
          onClose={() => setUpdateStatusInfo(null)}
          onUpdate={fetchUserEvents}
        />
      )}
    </div>
  );
};
