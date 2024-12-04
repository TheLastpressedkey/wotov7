import React from 'react';
import { AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className }) => {
  return (
    <div className={clsx(
      "bg-red-50 border border-red-200 rounded-lg p-4",
      className
    )}>
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Une erreur est survenue
          </h3>
          <div className="mt-1 text-sm text-red-700">
            {message}
          </div>
        </div>
      </div>
    </div>
  );
};