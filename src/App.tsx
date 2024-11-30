import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { EventBoard } from './components/EventBoard';
import { Navigation } from './components/Navigation';
import { LoginForm } from './components/auth/LoginForm';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CreateEventForm } from './components/admin/CreateEventForm';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<EventBoard />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="create-event" element={<CreateEventForm />} />
            </Route>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;