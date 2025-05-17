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
  Settings as SettingsIcon 
} from 'lucide-react';

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
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md">
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

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {renderSection()}
          </div>
        </div>
      </div>
    </Layout>
  );
};