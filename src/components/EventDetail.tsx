import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, MapPin, Users, Clock, ArrowLeft, Loader2, Copy, Share2 } from 'lucide-react';
import { pb } from '../lib/pocketbase';
import type { EventRecord } from '../types/pocketbase';
import { RegistrationForm } from './volunteer/RegistrationForm';
import { TokenConfirmation } from './ui/TokenConfirmation';
import { 
  FacebookShareButton, 
  FacebookMessengerShareButton, 
  WhatsappShareButton,
  FacebookIcon,
  WhatsappIcon,
  FacebookMessengerIcon
} from 'react-share';

const DEFAULT_IMAGE = "https://plus.unsplash.com/premium_photo-1663039947303-0fad26f737b8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [confirmationToken, setConfirmationToken] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const user = pb.authStore.model;

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        setError('Événement non trouvé');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        const record = await pb.collection('events').getOne(id);
        setEvent(record);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Une erreur est survenue lors du chargement de l\'événement');
        navigate('/', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, navigate]);

  const handleRegistrationSuccess = (token: string) => {
    setShowRegistrationForm(false);
    setConfirmationToken(token);
  };

  const handleShare = async () => {
    if (!event) return;

    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const handleRegistrationClick = () => {
    if (!pb.authStore.isValid) {
      navigate('/login');
      return;
    }
    
    if (userRegistration) {
      navigate('/dashboard');
    } else {
      setShowRegistrationForm(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || "Événement non trouvé"}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const presentParticipants = event.registrations?.filter(reg => reg.status === 'present') || [];
  const isEventFull = presentParticipants.length >= event.maxParticipants;
  const userRegistration = event.registrations?.find(reg => reg.userId === user?.id);
  const shareUrl = window.location.href;
  const shareTitle = `${event.title} - Wings of the Ocean`;

  const formattedDescription = event.description?.split('\n').map((paragraph, index) => (
    <p key={index} className="mb-4 last:mb-0 leading-relaxed text-gray-600">
      {paragraph}
    </p>
  ));

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-blue-600"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour aux événements
          </button>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 bg-white rounded-md shadow-sm border border-gray-200 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span className="hidden sm:inline">Partager</span>
              </button>

              {showShareMenu && (
                <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="px-4 py-2 space-y-2">
                    <FacebookShareButton url={shareUrl} quote={shareTitle} className="w-full">
                      <div className="flex items-center gap-2 text-gray-700 hover:text-blue-600 py-1">
                        <FacebookIcon size={24} round />
                        <span className="text-sm">Facebook</span>
                      </div>
                    </FacebookShareButton>

                    <FacebookMessengerShareButton url={shareUrl} appId="your-app-id" className="w-full">
                      <div className="flex items-center gap-2 text-gray-700 hover:text-blue-600 py-1">
                        <FacebookMessengerIcon size={24} round />
                        <span className="text-sm">Messenger</span>
                      </div>
                    </FacebookMessengerShareButton>

                    <WhatsappShareButton url={shareUrl} title={shareTitle} className="w-full">
                      <div className="flex items-center gap-2 text-gray-700 hover:text-green-600 py-1">
                        <WhatsappIcon size={24} round />
                        <span className="text-sm">WhatsApp</span>
                      </div>
                    </WhatsappShareButton>

                    <button
                      onClick={handleShare}
                      className="w-full flex items-center gap-2 text-gray-700 hover:text-blue-600 py-1"
                    >
                      <Copy className="w-6 h-6" />
                      <span className="text-sm">
                        {linkCopied ? 'Lien copié !' : 'Copier le lien'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Image de couverture */}
        <div className={`relative h-64 md:h-96 rounded-lg overflow-hidden mb-8 ${isEventFull ? 'grayscale' : ''}`}>
          <img
            src={event.imageUrl || DEFAULT_IMAGE}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Informations de l'événement */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-5 h-5 mr-3 flex-shrink-0" />
              <span>{format(new Date(event.date), 'PPP', { locale: fr })}</span>
            </div>
            
            {(event.startTime || event.endTime) && (
              <div className="flex items-center text-gray-600">
                <Clock className="w-5 h-5 mr-3 flex-shrink-0" />
                <span>
                  {event.startTime && event.endTime
                    ? `${event.startTime} - ${event.endTime}`
                    : event.startTime || event.endTime}
                </span>
              </div>
            )}
            
            <div className="flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-3 flex-shrink-0" />
              <span>{event.location}</span>
            </div>
            
            <div className="flex items-center text-gray-600">
              <Users className="w-5 h-5 mr-3 flex-shrink-0" />
              <span>{presentParticipants.length}/{event.maxParticipants} participants</span>
            </div>
          </div>

          {event.description && (
            <div className="prose max-w-none border-t border-gray-100 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">À propos de l'événement</h2>
              <div className="space-y-4 text-base sm:text-lg">
                {formattedDescription}
              </div>
            </div>
          )}

          {/* Bouton d'inscription */}
          {new Date(event.date) > new Date() && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={handleRegistrationClick}
                disabled={!userRegistration && isEventFull}
                className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                         disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isEventFull && !userRegistration
                  ? "Évènement complet"
                  : !pb.authStore.isValid 
                  ? "Se connecter pour s'inscrire"
                  : userRegistration
                  ? "Gérer mon inscription"
                  : "S'inscrire à l'événement"}
              </button>
            </div>
          )}
        </div>

        {/* Liste des participants */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Liste des participants</h2>
          
          {presentParticipants.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Aucun participant inscrit pour le moment
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date d'inscription
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {presentParticipants.map((participant, index) => (
                    <tr key={participant.token} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {participant.userName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(participant.registrationDate), 'Pp', { locale: fr })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showRegistrationForm && (
        <RegistrationForm
          eventId={event.id}
          onSuccess={handleRegistrationSuccess}
          onCancel={() => setShowRegistrationForm(false)}
        />
      )}

      {confirmationToken && (
        <TokenConfirmation
          token={confirmationToken}
          onClose={() => setConfirmationToken(null)}
        />
      )}
    </div>
  );
};
