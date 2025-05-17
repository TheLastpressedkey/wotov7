import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header can be added here if needed */}
      <main>{children}</main>
      {/* Footer can be added here if needed */}
    </div>
  );
};