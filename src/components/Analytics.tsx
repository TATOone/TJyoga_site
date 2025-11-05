import { useEffect } from 'react';

// Компонент для загрузки скриптов аналитики
const Analytics: React.FC = () => {
  useEffect(() => {
    // Google Analytics 4
    const ga4Id = (import.meta as any).env?.VITE_GA4_ID;
    if (ga4Id && typeof window !== 'undefined') {
      // Загружаем скрипт GA4
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
      document.head.appendChild(script1);

      // Инициализируем gtag
      (window as any).dataLayer = (window as any).dataLayer || [];
      function gtag(...args: any[]) {
        (window as any).dataLayer.push(args);
      }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', ga4Id, {
        send_page_view: true,
      });
    }

    // Яндекс.Метрика
    const yandexId = (import.meta as any).env?.VITE_YANDEX_METRICA_ID;
    if (yandexId && typeof window !== 'undefined') {
      (function (m: any, e: any, t: string, r: string, i: string, k: any, a: any) {
        m[i] =
          m[i] ||
          function (...args: any[]) {
            (m[i].a = m[i].a || []).push(args);
          };
        m[i].l = 1 * Number(new Date());
        for (let j = 0; j < document.scripts.length; j++) {
          if (document.scripts[j].src === r) {
            return;
          }
        }
        k = e.createElement(t) as HTMLScriptElement;
        a = e.getElementsByTagName(t)[0];
        k.async = 1;
        k.src = r;
        a.parentNode?.insertBefore(k, a);
      })(
        window,
        document,
        'script',
        'https://mc.yandex.ru/metrika/tag.js',
        'ym',
        yandexId,
        'init'
      );

      const ymFunc = function (counterId: number, method: string, target: string, params?: any) {
        const ymWindow = window as any;
        if (ymWindow.ym && ymWindow.ym.a) {
          ymWindow.ym.a.push([counterId, method, target, params]);
        }
      };
      (window as any).ym = ymFunc;
      (window as any).ym.a = (window as any).ym.a || [];
      (window as any).ym(parseInt(String(yandexId), 10), 'init', {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true,
      });
    }
  }, []);

  return null; // Компонент не рендерит ничего
};

export default Analytics;

