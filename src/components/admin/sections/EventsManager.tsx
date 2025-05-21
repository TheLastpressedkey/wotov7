import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Styles for responsive table
const tableStyles = `
  .responsive-table {
    @apply w-full;
  }
  
  @media (max-width: 768px) {
    .responsive-table thead {
      @apply hidden;
    }
    
    .responsive-table tr {
      @apply block border-b border-gray-200 py-4;
    }
    
    .responsive-table td {
      @apply block px-4 py-2 text-sm;
      @apply before:content-[attr(data-label)] before:font-medium before:text-gray-700 before:block md:before:hidden;
    }
    
    .responsive-table td:last-child {
      @apply border-b-0;
    }
  }
`;

export const EventsManager: React.FC = () => {
  return (
    <div className="p-6">
      <style>{tableStyles}</style>
      
      <h2 className="text-2xl font-bold mb-6">Gestion des événements</h2>
      
      <div className="bg-white rounded-lg shadow">
        <table className="responsive-table">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Example row - replace with actual event data mapping */}
            <tr>
              <td data-label="Date" className="px-6 py-4 whitespace-nowrap">
                {format(new Date(), 'Pp', { locale: fr })}
              </td>
              <td data-label="Titre" className="px-6 py-4">
                Exemple d'événement
              </td>
              <td data-label="Statut" className="px-6 py-4">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Actif
                </span>
              </td>
              <td data-label="Actions" className="px-6 py-4">
                <button className="text-indigo-600 hover:text-indigo-900">
                  Modifier
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
