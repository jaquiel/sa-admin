import { defineBoot } from '#q-app/wrappers';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

/**
 * Google Analytics 4 (gtag.js). Só carrega se GA_MEASUREMENT_ID estiver definido.
 * Envia page_view a cada navegação do Vue Router (SPA).
 */
export default defineBoot(({ router }) => {
  const id = process.env.GA_MEASUREMENT_ID;
  if (!id || typeof window === 'undefined') return;

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', id, { send_page_view: false });

  router.afterEach((to) => {
    window.gtag('event', 'page_view', {
      page_title: (to.meta.title as string) ?? document.title,
      page_location: window.location.href,
      page_path: to.fullPath,
    });
  });
});

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
}
