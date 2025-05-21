import React, { useState } from 'react';
import { Layout } from './Layout';
import { Overview } from './sections/Overview';
import { EventsManager } from './sections/EventsManager';
import { VolunteersManager } from './sections/VolunteersManager';
import { Statistics } from './sections/Statistics';
import { Settings } from './sections/Settings';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  BarChart, 
  Settings as SettingsIcon,
  Plus,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Section = 'overview' | 'events' | 'volunteers' | 'statistics' | 'settings';

const sections = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
  { id: 'events', label: 'Événements', icon: Calendar },
  { id: 'volunteers', label: 'Bénévoles', icon: Users },
  { id: 'statistics', label: 'Statistiques', icon: BarChart },
  { id: 'settings', label: 'Paramètres', icon: SettingsIcon },
] as const;

export const AdminDashboard: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<Section>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const renderSection = () => {
    switch (currentSection) {
      case 'overview':
        return <Overview />;
      case 'events':
        return <EventsManager />;
      case 'volunteers':
        return <VolunteersManager />;
      case 'statistics':
        return <Statistics />;
      case 'settings':
        return <Settings />;
    }
  };

  return (
    <Layout>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar pour desktop */}
        <div className="hidden md:block w-64 bg-white shadow-md">
          <div className="p-4">
            <h2 className="text-xl font-bold text-gray-800">Administration</h2>
          </div>
          <nav className="mt-4">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentSection(id)}
                className={`w-full flex items-center px-4 py-3 text-left ${
                  currentSection === id
                    ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Header mobile */}
          <div className="md:hidden bg-white shadow-sm z-20">
            <div className="flex items-center justify-between p-4">
              <h2 className="text-lg font-bold text-gray-800">
                {sections.find(s => s.id === currentSection)?.label}
              </h2>
              <button
                onClick={() => navigate('/admin/create-event')}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                title="Créer un événement"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            {/* Barre de recherche mobile */}
            <div className="px-4 pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto bg-gray-50 pb-20 md:pb-0">
            <div className="p-4 md:p-8">
              {renderSection()}
            </div>
          </div>

          {/* Navigation mobile bottom */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center">
            {sections.map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentSection(id)}
                className={`flex-1 py-3 flex flex-col items-center justify-center ${
                  currentSection === id
                    ? 'text-blue-600'
                    : 'text-gray-600'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs mt-1">{id === 'overview' ? 'Accueil' : sections.find(s => s.id === id)?.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};
