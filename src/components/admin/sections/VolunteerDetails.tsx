import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeft, Mail, Phone, Calendar, Award, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { Badge } from '../../ui/Badge';

interface Event {
  id: string;
  title: string;
  date: string;
  status: 'present' | 'absent' | 'undecided';
  registrationDate: string;
}

interface VolunteerDetails {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  stats: {
    totalEvents: number;
    presentEvents: number;
    absentEvents: number;
    undecidedEvents: number;
    firstEventDate: Date;
  };
  events: Event[];
}

interface VolunteerDetailsProps {
  volunteer: VolunteerDetails;
  onBack: () => void;
}

export const VolunteerDetails: React.FC<VolunteerDetailsProps> = ({ volunteer, onBack }) => {
  const participationRate = Math.round((volunteer.stats.presentEvents / volunteer.stats.totalEvents) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-blue-600 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour à la liste
        </button>
        <h2 className="text-2xl font-bold text-gray-900">{volunteer.userName}</h2>
      </div>

      {/* Informations de contact */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Informations de contact</h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <Mail className="w-5 h-5 text-gray-400 mr-3" />
            <a 
              href={`mailto:${volunteer.userEmail}`}
              className="text-gray-600 hover:text-blue-600"
            >
              {volunteer.userEmail}
            </a>
          </div>
          {volunteer.userPhone && (
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-gray-400 mr-3" />
              <a 
                href={`tel:${volunteer.userPhone}`}
                className="text-gray-600 hover:text-blue-600"
              >
                {volunteer.userPhone}
              </a>
            </div>
          )}
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-gray-400 mr-3" />
            <span className="text-gray-600">
              Inscrit depuis le {format(volunteer.stats.firstEventDate, 'PPP', { locale: fr })}
            </span>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total événements</p>
              <p className="text-2xl font-bold">{volunteer.stats.totalEvents}</p>
            </div>
            <Award className="w-8 h-8 text-blue-100" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Présences</p>
              <p className="text-2xl font-bold text-green-600">{volunteer.stats.presentEvents}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-100" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Absences</p>
              <p className="text-2xl font-bold text-red-600">{volunteer.stats.absentEvents}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-100" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Taux de participation</p>
              <p className="text-2xl font-bold text-purple-600">{participationRate}%</p>
            </div>
            <HelpCircle className="w-8 h-8 text-purple-100" />
          </div>
        </div>
      </div>

      {/* Historique des événements */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Historique des événements</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Événement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inscription
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {volunteer.events.map((event, index) => (
                  <tr key={event.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {event.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(event.date), 'PPP', { locale: fr })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge status={event.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(event.registrationDate), 'Pp', { locale: fr })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};