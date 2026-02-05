import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import ShopContextProvider from './Context/ShopContext';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

const SITE_URL = 'https://usemarima.com.br';

function PixelRouteTracker() {
  const location = useLocation();
  const lastPathRef = useRef<string>('');

  useEffect(() => {
    const path = location.pathname + location.search + location.hash;

    if (lastPathRef.current === path) return;
    lastPathRef.current = path;

    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }

    if (typeof document !== 'undefined') {
      const canonicalHref =
        SITE_URL + (location.pathname === '/' ? '/' : location.pathname);

      let canonicalLink = document.querySelector(
        'link[rel="canonical"]'
      ) as HTMLLinkElement | null;

      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }

      canonicalLink.setAttribute('href', canonicalHref);
    }
  }, [location]);

  return null;
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
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
