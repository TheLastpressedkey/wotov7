import React, { useState } from 'react';
import { useVolunteerStore } from '../../store/volunteerStore';
import { VolunteerStatus } from '../../types/volunteer';
import { Loader2 } from 'lucide-react';

interface RegistrationFormProps {
  eventId: string;
  onSuccess: (token: string) => void;
  onCancel: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  eventId,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    status: 'present' as VolunteerStatus,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addVolunteer = useVolunteerStore((state) => state.addVolunteer);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const volunteer = await addVolunteer({
        eventId,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        status: formData.status,
      });

      onSuccess(volunteer.token);
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : "Une erreur est survenue lors de l'inscription"
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Inscription à l'événement</h2>
        
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Prénom
            </label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nom
            </label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Numéro de téléphone
            </label>
            <input
              type="tel"
              required
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={isSubmitting}
              pattern="[0-9]{10}"
              title="Veuillez entrer un numéro de téléphone valide (10 chiffres)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Statut de présence
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as VolunteerStatus,
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              <option value="present">Présent</option>
              <option value="absent">Absent</option>
              <option value="undecided">Indécis</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "S'inscrire"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};