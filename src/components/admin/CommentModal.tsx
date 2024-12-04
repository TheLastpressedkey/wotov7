import React, { useState } from 'react';
import { X, Loader2, Send } from 'lucide-react';
import { useVolunteerStore } from '../../store/volunteerStore';
import { Volunteer, VolunteerComment } from '../../types/volunteer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CommentModalProps {
  volunteer: Volunteer;
  onClose: () => void;
}

export const CommentModal: React.FC<CommentModalProps> = ({ volunteer, onClose }) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addVolunteerComment = useVolunteerStore((state) => state.addVolunteerComment);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await addVolunteerComment(volunteer.token, newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-2">
          Commentaires - {volunteer.firstName} {volunteer.lastName}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Historique des commentaires et suivi du bénévole
        </p>

        <div className="flex-1 overflow-y-auto mb-6">
          {volunteer.comments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Aucun commentaire pour ce bénévole
            </p>
          ) : (
            <div className="space-y-4">
              {[...volunteer.comments].reverse().map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {format(new Date(comment.createdAt), 'PPp', { locale: fr })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full h-32 px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Ajouter un nouveau commentaire..."
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Fermer
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={isSubmitting || !newComment.trim()}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Ajouter
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
