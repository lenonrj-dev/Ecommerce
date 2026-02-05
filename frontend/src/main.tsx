import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import ShopContextProvider from './Context/ShopContext';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

const SITE_URL = 'https://usemarima.com.br';

const DEFAULT_DESCRIPTION =
  'Marima — Moda fitness e casual com peças selecionadas, caimento premium e envio para todo o Brasil. Confira lançamentos, básicos e outlet.';

const ROUTE_DESCRIPTIONS: Record<string, string> = {
  '/outlet':
    'Outlet Marima: ofertas em moda fitness e casual por tempo limitado. Aproveite descontos, últimas unidades e novidades toda semana.',
  '/casual':
    'Casual Marima: peças versáteis e confortáveis para o dia a dia. Estilo minimalista, acabamento premium e caimento impecável.',
  '/fitness':
    'Fitness Marima: leggings, tops e conjuntos com alta sustentação. Conforto, performance e estilo para treinar com confiança.',
  '/sobre':
    'Sobre a Marima: conheça nossa história, propósito e padrões de qualidade. Moda que inspira com atenção aos detalhes.',
  '/contato':
    'Contato Marima: suporte, dúvidas sobre pedidos, trocas e parcerias. Fale com a gente e receba atendimento rápido.',
};

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

      const description =
        ROUTE_DESCRIPTIONS[location.pathname] ?? DEFAULT_DESCRIPTION;

      let metaDescription = document.querySelector(
        'meta[name="description"]'
      ) as HTMLMetaElement | null;

      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }

      metaDescription.setAttribute('content', description);

      let ogDescription = document.querySelector(
        'meta[property="og:description"]'
      ) as HTMLMetaElement | null;

      if (!ogDescription) {
        ogDescription = document.createElement('meta');
        ogDescription.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescription);
      }

      ogDescription.setAttribute('content', description);

      let twitterDescription = document.querySelector(
        'meta[name="twitter:description"]'
      ) as HTMLMetaElement | null;

      if (!twitterDescription) {
        twitterDescription = document.createElement('meta');
        twitterDescription.setAttribute('name', 'twitter:description');
        document.head.appendChild(twitterDescription);
      }

      twitterDescription.setAttribute('content', description);

      let ogUrl = document.querySelector(
        'meta[property="og:url"]'
      ) as HTMLMetaElement | null;

      if (!ogUrl) {
        ogUrl = document.createElement('meta');
        ogUrl.setAttribute('property', 'og:url');
        document.head.appendChild(ogUrl);
      }

      ogUrl.setAttribute('content', canonicalHref);
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
