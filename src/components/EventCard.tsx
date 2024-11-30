import React, { useState } from 'react';
import { Calendar, MapPin, Users, Info } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Event } from '../types/event';
import { useVolunteerStore } from '../store/volunteerStore';
import { TokenUpdateForm } from './volunteer/TokenUpdateForm';

interface EventCardProps {
  event: Event;
  onRegister: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onRegister }) => {
  const [showTokenForm, setShowTokenForm] = useState(false);
  const getVolunteerStats = useVolunteerStore((state) => state.getVolunteerStats);
  const stats = getVolunteerStats(event.id!);
  const presentParticipants = stats.present;

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-48 object-cover"
        />
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold">{event.title}</h3>
            <button
              onClick={() => setShowTokenForm(true)}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Mettre à jour mon inscription"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-5 h-5 mr-2" />
              <span>{format(event.date, 'EEEE d MMMM yyyy', { locale: fr })}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-2" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="w-5 h-5 mr-2" />
              <span>{presentParticipants}/{event.maxParticipants} participants</span>
            </div>
          </div>
          <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>
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
        </div>
      </div>

      {showTokenForm && (
        <TokenUpdateForm onClose={() => setShowTokenForm(false)} />
      )}
    </>
  );
};