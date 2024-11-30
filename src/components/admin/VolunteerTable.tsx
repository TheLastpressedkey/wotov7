import React from 'react';
import { useVolunteerStore } from '../../store/volunteerStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '../ui/Badge';

interface VolunteerTableProps {
  eventId: string;
}

export const VolunteerTable: React.FC<VolunteerTableProps> = ({ eventId }) => {
  const volunteers = useVolunteerStore((state) => state.getVolunteersByEvent(eventId));

  if (volunteers.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">
        Aucun bénévole inscrit pour cet événement.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nom
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Téléphone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date d'inscription
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Token
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {volunteers.map((volunteer) => (
            <tr key={volunteer.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                {volunteer.firstName} {volunteer.lastName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {volunteer.phoneNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge status={volunteer.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(volunteer.registrationDate), 'Pp', { locale: fr })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-500">
                {volunteer.token}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};