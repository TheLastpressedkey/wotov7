import React from 'react';
import { MessageSquarePlus, MessageSquare } from 'lucide-react';
import { Volunteer } from '../../types/volunteer';

interface CommentCellProps {
  volunteer: Volunteer;
  onEdit: () => void;
}

export const CommentCell: React.FC<CommentCellProps> = ({ volunteer, onEdit }) => {
  if (!volunteer.comments?.length) {
    return (
      <button
        onClick={onEdit}
        className="flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-colors group-hover:text-gray-600"
        title="Ajouter un commentaire"
      >
        <MessageSquarePlus className="w-5 h-5" />
        <span className="text-sm">Ajouter un commentaire</span>
      </button>
    );
  }

  const latestComment = volunteer.comments[volunteer.comments.length - 1];

  return (
    <button
      onClick={onEdit}
      className="flex items-start gap-2 text-gray-600 hover:text-blue-600 transition-colors w-full group"
    >
      <MessageSquare className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm line-clamp-2 text-left group-hover:text-blue-600">
          {latestComment.content}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {volunteer.comments.length} commentaire{volunteer.comments.length > 1 ? 's' : ''}
        </p>
      </div>
    </button>
  );
};