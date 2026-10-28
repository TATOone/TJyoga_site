interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

export const trackGA4Event = (eventName: string, params?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};

export const trackYandexEvent = (target: string, params?: Record<string, unknown>) => {
  if (typeof window === 'undefined' || !window.ym) {
    return;
  }

  const counterId = import.meta.env.VITE_YANDEX_METRICA_ID
    ? parseInt(import.meta.env.VITE_YANDEX_METRICA_ID)
    : null;

  if (counterId) {
    window.ym(counterId, 'reachGoal', target, params);
  }
};

export const trackEvent = (event: AnalyticsEvent) => {
  const { action, category, label, value } = event;

  trackGA4Event(action, {
    event_category: category,
    event_label: label,
    value: value,
  });

  trackYandexEvent(`${category}_${action}`, {
    label,
    value,
  });
};

export const analyticsEvents = {
  ctaClick: (buttonName: string, location: string) => {
    trackEvent({
      action: 'cta_click',
      category: 'engagement',
      label: `${buttonName}_${location}`,
    });
  },

  telegramClick: (channel: string, source: string) => {
    trackEvent({
      action: 'telegram_click',
      category: 'conversion',
      label: `${channel}_${source}`,
    });
  },

  serviceClick: (serviceName: string) => {
    trackEvent({
      action: 'service_click',
      category: 'engagement',
      label: serviceName,
    });
  },

  checkoutStart: (productId: string, source: string) => {
    trackEvent({
      action: 'checkout_start',
      category: 'conversion',
      label: `${productId}_${source}`,
    });
  },

  formSubmit: (formName: string, source: string) => {
    trackEvent({
      action: 'form_submit',
      category: 'conversion',
      label: `${formName}_${source}`,
    });
  },
};
