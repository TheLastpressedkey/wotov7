import React from 'react';
import { Link } from 'react-router-dom';
import { Waves, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Navigation: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Waves className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-semibold">Wings of the Ocean</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Événements
            </Link>
            {user?.role === 'admin' ? (
              <>
                <Link
                  to="/admin"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/create-event"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Créer un événement
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-1" />
                  Déconnexion
                </button>
              </>
            ) : (

            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
