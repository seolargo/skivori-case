import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import ErrorFallback from './components/ErrorFallback/ErrorFallback';

// Lazy load the components
const Homepage = lazy(() => import('./pages/HomePage/HomePage'));
const GameList = lazy(() => import('./pages/GamesList/GamesList'));
const SlotMachine = lazy(() => import('./pages/SlotMachine/SlotMachine'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));

export function App() {
  return (
    <Router>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/games" element={<GameList />} />
            <Route path="/slot-machine" element={<SlotMachine />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Router>
  );
}

export default App;