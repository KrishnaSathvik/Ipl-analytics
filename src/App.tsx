import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import Nav from './components/Nav';
import InstallPrompt from './components/InstallPrompt';
import ErrorBoundary from './components/ErrorBoundary';

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
  return (
    <HelmetProvider>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
          <Nav />
          <ErrorBoundary>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/teams" element={<Teams />} />
                <Route path="/players" element={<Players />} />
                <Route path="/seasons" element={<Seasons />} />
                <Route path="/records" element={<Records />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/deep-dives" element={<DeepDives />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
          <InstallPrompt />
          <VercelAnalytics />
        </div>
      </BrowserRouter>
    </HelmetProvider>
  );
}
