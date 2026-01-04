import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import ShopContextProvider from './Context/ShopContext';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Dispara PageView a cada mudança de rota (SPA)
function PixelRouteTracker() {
  const location = useLocation();
  const lastPathRef = useRef<string>('');

  useEffect(() => {
    const path = location.pathname + location.search + location.hash;

    // evita disparos duplicados imediatos em dev (ex.: StrictMode)
    if (lastPathRef.current === path) return;
    lastPathRef.current = path;

    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
  }, [location]);

  return null;
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <BrowserRouter>
    <ShopContextProvider>
      <PixelRouteTracker />
      <App />
      <Analytics />
      <SpeedInsights />
    </ShopContextProvider>
  </BrowserRouter>
);
