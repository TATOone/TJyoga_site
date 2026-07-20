import { useEffect } from 'react';
import { PAGE_META, SITE_URL } from '../config/pageMeta';
import type { PageMetaKey } from '../config/pageMeta';

const upsertMetaByName = (name: string, content: string): void => {
  let element = document.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

const upsertMetaByProperty = (property: string, content: string): void => {
  let element = document.querySelector(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('property', property);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

const upsertCanonical = (href: string): void => {
  let element = document.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
};

export const usePageMeta = (pageKey: PageMetaKey): void => {
  useEffect(() => {
    const meta = PAGE_META[pageKey];
    const canonicalUrl = `${SITE_URL}${meta.path}`;

    document.title = meta.title;

    upsertMetaByName('title', meta.title);
    upsertMetaByName('description', meta.description);
    upsertMetaByName('robots', meta.robots);
    if (meta.keywords) {
      upsertMetaByName('keywords', meta.keywords);
    }

    upsertMetaByProperty('og:type', meta.ogType ?? 'website');
    upsertMetaByProperty('og:title', meta.title);
    upsertMetaByProperty('og:description', meta.description);
    upsertMetaByProperty('og:url', canonicalUrl);

    upsertMetaByName('twitter:title', meta.title);
    upsertMetaByName('twitter:description', meta.description);
    upsertMetaByName('twitter:url', canonicalUrl);

    upsertCanonical(canonicalUrl);
  }, [pageKey]);
};
