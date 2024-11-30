import React, { useState } from 'react';
import { useVolunteerStore } from '../../store/volunteerStore';
import { VolunteerStatus } from '../../types/volunteer';

interface VolunteerListProps {
  eventId: string;
}

export const VolunteerList: React.FC<VolunteerListProps> = ({ eventId }) => {
  const [statusFilter, setStatusFilter] = useState<VolunteerStatus | 'all'>('all');
  const getVolunteersByEvent = useVolunteerStore((state) => state.getVolunteersByEvent);
  const getVolunteerStats = useVolunteerStore((state) => state.getVolunteerStats);

  const volunteers = getVolunteersByEvent(eventId);
  const stats = getVolunteerStats(eventId);
  
  const filteredVolunteers = statusFilter === 'all'
    ? volunteers
    : volunteers.filter((v) => v.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Statistiques</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-md">
            <p className="text-sm text-green-600">Présents</p>
            <p className="text-2xl font-bold text-green-600">{stats.present}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-md">
            <p className="text-sm text-red-600">Absents</p>
            <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-md">
            <p className="text-sm text-yellow-600">Indécis</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.undecided}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Liste des bénévoles</h3>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as VolunteerStatus | 'all')}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">Tous</option>
            <option value="present">Présents</option>
            <option value="absent">Absents</option>
            <option value="undecided">Indécis</option>
          </select>
        </div>

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
                  Token
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVolunteers.map((volunteer) => (
                <tr key={volunteer.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {volunteer.firstName} {volunteer.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {volunteer.phoneNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        volunteer.status === 'present'
                          ? 'bg-green-100 text-green-800'
                          : volunteer.status === 'absent'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {volunteer.status === 'present'
                        ? 'Présent'
                        : volunteer.status === 'absent'
                        ? 'Absent'
                        : 'Indécis'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                    {volunteer.token}
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