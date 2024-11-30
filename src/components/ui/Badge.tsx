import React from 'react';
import { VolunteerStatus } from '../../types/volunteer';

interface BadgeProps {
  status: VolunteerStatus;
}

const statusConfig = {
  present: {
    label: 'Présent',
    className: 'bg-green-100 text-green-800',
  },
  absent: {
    label: 'Absent',
    className: 'bg-red-100 text-red-800',
  },
  undecided: {
    label: 'Indécis',
    className: 'bg-yellow-100 text-yellow-800',
  },
} as const;

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const config = statusConfig[status];
  
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
};