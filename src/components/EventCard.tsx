import React, { useState } from 'react';
import { Calendar, MapPin, Users, Clock, Info } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Event } from '../types/event';
import { useVolunteerStore } from '../store/volunteerStore';
import { TokenManagement } from './volunteer/TokenManagement';
import clsx from 'clsx';

interface EventCardProps {
  event: Event;
  onRegister: () => void;
  isPast?: boolean;
}

const DEFAULT_IMAGE = "https://plus.unsplash.com/premium_photo-1663039947303-0fad26f737b8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export const EventCard: React.FC<EventCardProps> = ({ event, onRegister, isPast = false }) => {
  const [showTokenManagement, setShowTokenManagement] = useState(false);
  const getVolunteerStats = useVolunteerStore((state) => state.getVolunteerStats);
  const stats = getVolunteerStats(event.id!);
  const presentParticipants = stats.present;

  const handleTokenManagementSuccess = () => {
    setShowTokenManagement(false);
  };

  return (
    <>
      <div className={clsx(
        "bg-white rounded-lg shadow-md overflow-hidden",
        isPast && "opacity-75"
      )}>
        <div className={clsx(
          "relative",
          isPast && "grayscale"
        )}>
          <img
            src={event.imageUrl || DEFAULT_IMAGE}
            alt={event.title}
            className="w-full h-48 object-cover"
          />
        </div>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-5 h-5 mr-2" />
              <span>{format(new Date(event.date), 'PPP', { locale: fr })}</span>
            </div>
            {(event.startTime || event.endTime) && (
              <div className="flex items-center text-gray-600">
                <Clock className="w-5 h-5 mr-2" />
                <span>
                  {event.startTime && event.endTime
                    ? `${event.startTime} - ${event.endTime}`
                    : event.startTime || event.endTime}
                </span>
              </div>
            )}
            <div className="flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-2" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="w-5 h-5 mr-2" />
              <span>{presentParticipants}/{event.maxParticipants} participants</span>
            </div>
          </div>
          {event.description && (
            <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>
          )}
          {!isPast && (
            <div className="space-y-2">
              <button
                onClick={onRegister}
                disabled={presentParticipants >= event.maxParticipants}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 
                         disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {presentParticipants >= event.maxParticipants
                  ? 'Complet'
                  : "S'inscrire"}
              </button>
              <button
                onClick={() => setShowTokenManagement(true)}
                className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Info className="w-4 h-4" />
                <span>Déjà inscrit ? Gérer votre inscription</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {showTokenManagement && (
        <TokenManagement onClose={handleTokenManagementSuccess} />
      )}
    </>
  );
};

