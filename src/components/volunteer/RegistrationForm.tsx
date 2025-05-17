import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { registerForEvent } from '../../lib/pocketbase';

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
  const [status, setStatus] = useState<'present' | 'absent' | 'undecided'>('present');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = await registerForEvent(eventId, status);
      onSuccess(token);
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
              Statut de présence
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'present' | 'absent' | 'undecided')}
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