import React from 'react';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { pb } from '../lib/pocketbase';

interface EventCardProps {
  event: EventRecord;
  onRegister: () => void;
  isPast?: boolean;
}

const DEFAULT_IMAGE = "https://plus.unsplash.com/premium_photo-1663039947303-0fad26f737b8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export const EventCard: React.FC<EventCardProps> = ({ event, onRegister, isPast = false }) => {
  const navigate = useNavigate();
  const user = pb.authStore.model;

  const presentParticipants = event.registrations?.filter(reg => reg.status === 'present').length || 0;
  const isEventFull = presentParticipants >= event.maxParticipants;

  const userRegistration = event.registrations?.find(
    reg => reg.userId === user?.id
  );

  const handleAction = () => {
    if (!pb.authStore.isValid) {
      navigate('/login');
      return;
    }
    
    if (userRegistration) {
      navigate('/dashboard');
    } else {
      onRegister();
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden flex flex-col ${isPast ? 'opacity-75' : ''} cursor-pointer transform transition-transform hover:scale-[1.02]`}
      onClick={() => navigate(`/event/${event.id}`)}
    >
      <div className={`relative ${isPast || isEventFull ? 'grayscale' : ''}`}>
        <img
          src={event.imageUrl || DEFAULT_IMAGE}
          alt={event.title}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-4 md:p-6 flex-1 flex flex-col">
        <h3 className="text-lg md:text-xl font-semibold mb-2">{event.title}</h3>
        <div className="space-y-2 mb-4 flex-1">
          <div className="flex items-center text-gray-600 text-sm">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{format(new Date(event.date), 'PPP', { locale: fr })}</span>
          </div>
          {(event.startTime || event.endTime) && (
            <div className="flex items-center text-gray-600 text-sm">
              <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>
                {event.startTime && event.endTime
                  ? `${event.startTime} - ${event.endTime}`
                  : event.startTime || event.endTime}
              </span>
            </div>
          )}
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <Users className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{presentParticipants}/{event.maxParticipants} participants</span>
          </div>
        </div>
        {event.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">{event.description}</p>
        )}
        {!isPast && (
          <div className="space-y-2 mt-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction();
              }}
              disabled={isEventFull && !userRegistration}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 
                       disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {isEventFull && !userRegistration
                ? "Évènement complet"
                : !pb.authStore.isValid
                ? "Se connecter pour s'inscrire"
                : userRegistration
                ? "Gérer mon inscription"
                : "S'inscrire"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
