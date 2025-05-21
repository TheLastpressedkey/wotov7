import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeft, Download, MapPin, Calendar, Clock, Users, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Badge } from '../../ui/Badge';
import { VolunteerStatusModal } from '../VolunteerStatusModal';
import { pb } from '../../../lib/pocketbase';

interface Participant {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  status: 'present' | 'absent' | 'undecided';
  token: string;
  registrationDate: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  startTime?: string;
  endTime?: string;
  maxParticipants: number;
  registrations?: Participant[];
}

interface EventParticipantsViewProps {
  event: Event;
  onBack: () => void;
}

export const EventParticipantsView: React.FC<EventParticipantsViewProps> = ({ event, onBack }) => {
  const [selectedVolunteer, setSelectedVolunteer] = useState<Participant | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const participants = event.registrations || [];
  const presentParticipants = participants.filter(p => p.status === 'present');
  const absentParticipants = participants.filter(p => p.status === 'absent');
  const undecidedParticipants = participants.filter(p => p.status === 'undecided');

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const downloadParticipantsList = () => {
    const csvContent = [
      ['Nom', 'Email', 'Téléphone', 'Statut', 'Date d\'inscription'].join(','),
      ...participants.map(p => [
        p.userName,
        p.userEmail,
        p.userPhone || 'Non renseigné',
        p.status === 'present' ? 'Présent' : p.status === 'absent' ? 'Absent' : 'Indécis',
        format(new Date(p.registrationDate), 'Pp', { locale: fr })
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `participants_${event.title}_${format(new Date(event.date), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const handleStatusUpdate = () => {
    showSuccessMessage('Le statut du bénévole a été mis à jour avec succès');
    setRefreshKey(prev => prev + 1);
  };

  const handleDeleteParticipant = async (token: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette inscription ?')) {
      return;
    }

    setIsDeleting(token);
    try {
      const updatedRegistrations = participants.filter(p => p.token !== token);
      await pb.collection('events').update(event.id, {
        registrations: updatedRegistrations
      });
      showSuccessMessage('L\'inscription a été supprimée avec succès');
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting participant:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-blue-600 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour aux événements
          </button>
          <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
        </div>
        <button
          onClick={downloadParticipantsList}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Download className="w-5 h-5 mr-2" />
          Exporter la liste
        </button>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
          {successMessage}
        </div>
      )}

      {/* Event Details */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{format(new Date(event.date), 'PPP', { locale: fr })}</p>
            </div>
          </div>
          {(event.startTime || event.endTime) && (
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Horaires</p>
                <p className="font-medium">
                  {event.startTime && event.endTime
                    ? `${event.startTime} - ${event.endTime}`
                    : event.startTime || event.endTime}
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center">
            <MapPin className="w-5 h-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Lieu</p>
              <p className="font-medium">{event.location}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Users className="w-5 h-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Participants</p>
              <p className="font-medium">{presentParticipants.length}/{event.maxParticipants}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Participants Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-green-600 mb-2">Présents</h3>
          <p className="text-3xl font-bold">{presentParticipants.length}</p>
          <p className="text-sm text-gray-500">participants</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Absents</h3>
          <p className="text-3xl font-bold">{absentParticipants.length}</p>
          <p className="text-sm text-gray-500">participants</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-yellow-600 mb-2">Indécis</h3>
          <p className="text-3xl font-bold">{undecidedParticipants.length}</p>
          <p className="text-sm text-gray-500">participants</p>
        </div>
      </div>

      {/* Participants List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Liste des participants</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Téléphone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {participants.map((participant, index) => (
                  <tr key={participant.token} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {participant.userName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a 
                        href={`mailto:${participant.userEmail}`}
                        className="text-sm text-gray-600 hover:text-blue-600"
                      >
                        {participant.userEmail}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {participant.userPhone ? (
                        <a 
                          href={`tel:${participant.userPhone}`}
                          className="text-sm text-gray-600 hover:text-blue-600"
                        >
                          {participant.userPhone}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">Non renseigné</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge status={participant.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(participant.registrationDate), 'Pp', { locale: fr })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setSelectedVolunteer(participant)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Modifier le statut"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteParticipant(participant.token)}
                          disabled={isDeleting === participant.token}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50"
                          title="Supprimer l'inscription"
                        >
                          {isDeleting === participant.token ? (
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
        </div>
      </div>

      {selectedVolunteer && (
        <VolunteerStatusModal
          eventId={event.id}
          volunteer={selectedVolunteer}
          onClose={() => setSelectedVolunteer(null)}
          onUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};
