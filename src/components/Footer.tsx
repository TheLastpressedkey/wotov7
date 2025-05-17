import React from 'react';
import { Facebook, Instagram, MessageCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Suivez-nous</h3>
          <div className="flex space-x-6">
            <a
              href="https://www.facebook.com/profile.php?id=100095230734358"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600 transition-colors"
              title="Facebook"
            >
              <Facebook className="w-6 h-6" />
            </a>
            <a
              href="https://www.instagram.com/wingsoftheocean_lyon/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-pink-600 transition-colors"
              title="Instagram"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a
              href="https://chat.whatsapp.com/G1vDZLj2XuNHSIRC1EuxSN"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-green-600 transition-colors"
              title="WhatsApp"
            >
              <MessageCircle className="w-6 h-6" />
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            © {new Date().getFullYear()} Wings of the Ocean. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};