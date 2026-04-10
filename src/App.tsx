import { useState, lazy, Suspense } from 'react';
import Nav from './components/Nav';
import InstallPrompt from './components/InstallPrompt';
import ErrorBoundary from './components/ErrorBoundary';
import type { Page } from './types';

const Home = lazy(() => import('./pages/Home'));
const Teams = lazy(() => import('./pages/Teams'));
const Players = lazy(() => import('./pages/Players'));
const Seasons = lazy(() => import('./pages/Seasons'));
const Records = lazy(() => import('./pages/Records'));
const Analytics = lazy(() => import('./pages/Analytics'));
const DeepDives = lazy(() => import('./pages/DeepDives'));

function Loading() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ fontSize: 13, color: 'var(--text-4)', fontWeight: 500 }}>Loading…</div>
    </div>
  );
}

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
      <ErrorBoundary>
        <Suspense fallback={<Loading />}>
          {renderPage()}
        </Suspense>
      </ErrorBoundary>
      <InstallPrompt />
    </div>
  );
}
