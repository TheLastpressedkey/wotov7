import React from 'react';

export const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Paramètres</h2>
        
        {/* Paramètres généraux */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Paramètres généraux</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">Notifications par email</label>
                <p className="text-sm text-gray-500">Recevoir des notifications pour les nouvelles inscriptions</p>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input type="checkbox" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
              </div>
            </div>
          </div>
        </div>

        {/* Paramètres de sécurité */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Sécurité</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
              <button className="mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Changer le mot de passe
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Double authentification</label>
              <button className="mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Configurer la 2FA
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            Sauvegarder les modifications
          </button>
        </div>
      </div>
    </div>
  );
};