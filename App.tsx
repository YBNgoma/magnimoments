import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { MemorialPage } from './pages/Memorial';
import { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'memorial'>('dashboard');
  const [selectedMemorialId, setSelectedMemorialId] = useState<string | null>(null);

  // Simple session persistence
  useEffect(() => {
    const savedUser = localStorage.getItem('magnimoments_user_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('magnimoments_user_session', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('magnimoments_user_session');
    setCurrentView('dashboard');
    setSelectedMemorialId(null);
  };

  const handleSelectMemorial = (id: string) => {
    setSelectedMemorialId(id);
    setCurrentView('memorial');
    window.scrollTo(0, 0);
  };

  const handleBackToDashboard = () => {
    setSelectedMemorialId(null);
    setCurrentView('dashboard');
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <Layout user={user} onLogout={handleLogout} showNav={currentView === 'dashboard'}>
      {currentView === 'dashboard' && (
        <Dashboard user={user} onSelectMemorial={handleSelectMemorial} />
      )}
      
      {currentView === 'memorial' && selectedMemorialId && (
        <MemorialPage 
          user={user} 
          memorialId={selectedMemorialId} 
          onBack={handleBackToDashboard} 
        />
      )}
    </Layout>
  );
}

export default App;