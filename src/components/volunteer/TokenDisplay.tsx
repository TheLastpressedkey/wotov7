import React, { useRef } from 'react';
import { Check, Copy } from 'lucide-react';

interface TokenDisplayProps {
  token: string;
  onClose: () => void;
}

export const TokenDisplay: React.FC<TokenDisplayProps> = ({ token, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  const tokenRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    if (tokenRef.current) {
      tokenRef.current.select();
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Inscription réussie !</h2>
        <p className="text-gray-600 mb-4">
          Conservez précieusement ce token, il vous permettra de modifier votre inscription ultérieurement.
        </p>
        
        <div className="flex items-center space-x-2 mb-6">
          <input
            ref={tokenRef}
            type="text"
            value={token}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono"
          />
          <button
            onClick={handleCopy}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Copier le token"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};