import React, { useState } from 'react';
import { useVolunteerStore } from '../../store/volunteerStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '../ui/Badge';
import { ArrowUpDown, MessageSquarePlus, MessageSquare } from 'lucide-react';
import { Volunteer, VolunteerStatus } from '../../types/volunteer';
import { CommentModal } from './CommentModal';
import { CommentCell } from './CommentCell';

interface VolunteerTableProps {
  eventId: string;
}

type SortDirection = 'asc' | 'desc';
type SortField = 'name' | 'status';

const statusOrder: Record<VolunteerStatus, number> = {
  present: 1,
  undecided: 2,
  absent: 3,
};

export const VolunteerTable: React.FC<VolunteerTableProps> = ({ eventId }) => {
  const volunteers = useVolunteerStore((state) => state.getVolunteersByEvent(eventId));
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);

  if (volunteers.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">
        Aucun bénévole inscrit pour cet événement.
      </p>
    );
  }

  const sortedVolunteers = [...volunteers].sort((a, b) => {
    if (sortField === 'name') {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return sortDirection === 'asc' 
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    } else {
      const statusCompare = statusOrder[a.status] - statusOrder[b.status];
      return sortDirection === 'asc' ? statusCompare : -statusCompare;
    }
  });

  const toggleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(current => current === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return (
      <span className="text-xs font-normal text-gray-400 ml-1">
        {sortDirection === 'asc' ? '(A-Z)' : '(Z-A)'}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => toggleSort('name')}
            >
              <div className="flex items-center gap-2">
                Nom
                <ArrowUpDown className="w-4 h-4" />
                {getSortIndicator('name')}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Téléphone
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => toggleSort('status')}
            >
              <div className="flex items-center gap-2">
                Statut
                <ArrowUpDown className="w-4 h-4" />
                {getSortIndicator('status')}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date d'inscription
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Token
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Commentaires
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedVolunteers.map((volunteer) => (
            <tr key={volunteer.id} className="group hover:bg-gray-50">
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
              <td className="px-6 py-4">
                <CommentCell 
                  volunteer={volunteer}
                  onEdit={() => setSelectedVolunteer(volunteer)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedVolunteer && (
        <CommentModal
          volunteer={selectedVolunteer}
          onClose={() => setSelectedVolunteer(null)}
        />
      )}
    </div>
  );
};
