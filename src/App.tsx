import { useState } from 'react';
import Nav from './components/Nav';
import Home from './pages/Home';
import Teams from './pages/Teams';
import Players from './pages/Players';
import Seasons from './pages/Seasons';
import Records from './pages/Records';
import Analytics from './pages/Analytics';
import DeepDives from './pages/DeepDives';
import InstallPrompt from './components/InstallPrompt';
import type { Page } from './types';

export default function App() {
  const [page, setPage] = useState<Page>('home');

  const renderPage = () => {
    switch (page) {
      case 'home':      return <Home />;
      case 'teams':     return <Teams />;
      case 'players':   return <Players />;
      case 'seasons':   return <Seasons />;
      case 'records':   return <Records />;
      case 'analytics': return <Analytics />;
      case 'deepdives': return <DeepDives />;
      default:          return <Home />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Nav current={page} onChange={setPage} />
      {renderPage()}
      <InstallPrompt />
    </div>
  );
}
