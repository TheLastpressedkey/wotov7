import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Calendar, MapPin, Clock, Users, Image, FileText, AlertCircle } from 'lucide-react';
import { pb } from '../../lib/pocketbase';

export const CreateEventForm: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    startTime: '',
    endTime: '',
    imageUrl: '',
    maxParticipants: 1,
    currentParticipants: 0,
    archived: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Ensure all required fields are filled
      if (!formData.date) {
        throw new Error('La date est obligatoire');
      }

      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        location: formData.location.trim(),
        date: new Date(formData.date).toISOString(),
        startTime: formData.startTime || undefined,
        endTime: formData.endTime || undefined,
        imageUrl: formData.imageUrl.trim() || undefined,
        maxParticipants: Number(formData.maxParticipants),
        currentParticipants: 0,
        archived: false
      };

      await pb.collection('events').create(eventData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating event:', error);
      setError(
        error instanceof Error 
          ? error.message 
          : "Une erreur est survenue lors de la création de l'événement"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Créer un événement</h2>
          
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Titre
                </span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="Nom de l'événement"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Description (facultative)
                </span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                rows={4}
                placeholder="Description détaillée de l'événement"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Date
                  </span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Lieu
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  placeholder="Adresse de l'événement"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Heure de début (facultative)
                  </span>
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Heure de fin (facultative)
                  </span>
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  <Image className="w-4 h-4 mr-2" />
                  URL de l'image (facultative)
                </span>
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="https://example.com/image.jpg"
                disabled={isSubmitting}
              />
              <p className="mt-2 text-sm text-gray-500">
                L'image sera utilisée comme bannière de l'événement
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Nombre maximum de participants
                </span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[120px]"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Créer l'événement"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
