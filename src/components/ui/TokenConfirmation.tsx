import React, { useState } from 'react';
import { Copy, CheckCircle } from 'lucide-react';

interface TokenConfirmationProps {
  token: string;
  onClose: () => void;
}

export const TokenConfirmation: React.FC<TokenConfirmationProps> = ({ token, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Inscription réussie !</h2>
        <p className="text-gray-600 mb-6">
          Conservez précieusement votre token pour modifier votre inscription ultérieurement.
        </p>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between bg-white border rounded-lg p-3">
            <code className="font-mono text-lg">{token}</code>
            <button
              onClick={copyToClipboard}
              className="ml-2 p-2 text-gray-500 hover:text-blue-600 transition-colors"
              title="Copier le token"
            >
              {copied ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
          {copied && (
            <p className="text-green-600 text-sm mt-2">Token copié !</p>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};