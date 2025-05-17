import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Waves, LogOut, UserCircle, Menu } from 'lucide-react';
import { pb, isAdmin } from '../lib/pocketbase';

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = pb.authStore.isValid;
  const user = pb.authStore.model;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    pb.authStore.clear();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Waves className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-semibold hidden md:inline">Wings of the Ocean</span>
            <span className="text-xl font-semibold md:hidden">WOTO</span>
          </Link>

          {/* Menu mobile */}
          <div className="flex md:hidden items-center space-x-4">
            <Link
              to="/"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Événements
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              {isAuthenticated ? (
                <UserCircle className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Menu desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Événements
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Dashboard
                </Link>
                {isAdmin() && (
                  <Link
                    to="/admin/create-event"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Créer un événement
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-1" />
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Connexion
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Menu mobile déroulant */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-2">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {isAdmin() && (
                  <Link
                    to="/admin/create-event"
                    className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Créer un événement
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Connexion
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};