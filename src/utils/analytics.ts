// Утилиты для аналитики
// Можно включить/выключить через environment variables

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

// Google Analytics 4
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    ym?: (counterId: number, method: string, target: string, params?: any) => void;
  }
}

// Функция для отправки события в GA4
export const trackGA4Event = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};

// Функция для отправки события в Яндекс.Метрику
export const trackYandexEvent = (target: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).ym) {
    // ID счётчика нужно будет указать в переменных окружения
    const counterId = (import.meta as any).env?.VITE_YANDEX_METRICA_ID
      ? parseInt((import.meta as any).env.VITE_YANDEX_METRICA_ID)
      : null;
    
    if (counterId) {
      (window as any).ym(counterId, 'reachGoal', target, params);
    }
  }
};

// Универсальная функция для отслеживания событий
export const trackEvent = (event: AnalyticsEvent) => {
  const { action, category, label, value } = event;
  
  // Отправляем в GA4
  trackGA4Event(action, {
    event_category: category,
    event_label: label,
    value: value,
  });
  
  // Отправляем в Яндекс.Метрику
  trackYandexEvent(`${category}_${action}`, {
    label,
    value,
  });
};

// Предопределённые события для отслеживания конверсий
export const analyticsEvents = {
  // Клики на кнопки CTA
  ctaClick: (buttonName: string, location: string) => {
    trackEvent({
      action: 'cta_click',
      category: 'engagement',
      label: `${buttonName}_${location}`,
    });
  },
  
  // Переходы в Telegram
  telegramClick: (channel: string, source: string) => {
    trackEvent({
      action: 'telegram_click',
      category: 'conversion',
      label: `${channel}_${source}`,
    });
  },
  
  // Просмотры секций
  sectionView: (sectionName: string) => {
    trackEvent({
      action: 'section_view',
      category: 'engagement',
      label: sectionName,
    });
  },
  
  // Клики на услуги
  serviceClick: (serviceName: string) => {
    trackEvent({
      action: 'service_click',
      category: 'engagement',
      label: serviceName,
    });
  },
  
  // Просмотр отзывов
  testimonialView: () => {
    trackEvent({
      action: 'testimonial_view',
      category: 'engagement',
    });
  },

  // Старт checkout по продукту
  checkoutStart: (productId: string, source: string) => {
    trackEvent({
      action: 'checkout_start',
      category: 'conversion',
      label: `${productId}_${source}`,
    });
  },

  // Отправка форм
  formSubmit: (formName: string, source: string) => {
    trackEvent({
      action: 'form_submit',
      category: 'conversion',
      label: `${formName}_${source}`,
    });
  },
};

