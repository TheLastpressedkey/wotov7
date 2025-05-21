import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { EventBoard } from './components/EventBoard';
import { Navigation } from './components/Navigation';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { Dashboard } from './components/Dashboard';
import { CreateEventForm } from './components/admin/CreateEventForm';
import { EventDetail } from './components/EventDetail';
import { Footer } from './components/Footer';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<EventBoard />} />
            <Route path="/event/:id" element={<EventDetail />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/create-event" element={<CreateEventForm />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
