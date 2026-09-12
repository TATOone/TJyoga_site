import { useLayoutEffect } from 'react';
import {
  OG_IMAGE_ALT,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_TYPE,
  OG_IMAGE_URL,
  OG_IMAGE_WIDTH,
  PAGE_META,
  SITE_LOCALE,
  SITE_NAME,
  SITE_URL,
  TWITTER_CARD,
} from '../config/pageMeta';
import type { PageMetaKey, PageMetaOverrides, ResolvedPageMeta } from '../config/pageMeta';
import { resolvePageMeta } from '../config/pageMeta';

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

const removeMetaByName = (name: string): void => {
  const element = document.querySelector(`meta[name="${name}"]`);
  if (element) {
    element.remove();
  }
};

export const applyPageMeta = (meta: ResolvedPageMeta): void => {
  const canonicalUrl = meta.canonicalUrl;

  document.title = meta.title;

  upsertMetaByName('title', meta.title);
  upsertMetaByName('description', meta.description);
  upsertMetaByName('robots', meta.robots);
  if (meta.keywords) {
    upsertMetaByName('keywords', meta.keywords);
  } else {
    removeMetaByName('keywords');
  }

  upsertMetaByProperty('og:type', meta.ogType);
  upsertMetaByProperty('og:title', meta.title);
  upsertMetaByProperty('og:description', meta.description);
  upsertMetaByProperty('og:url', canonicalUrl);
  upsertMetaByProperty('og:site_name', SITE_NAME);
  upsertMetaByProperty('og:locale', SITE_LOCALE);
  upsertMetaByProperty('og:image', OG_IMAGE_URL);
  upsertMetaByProperty('og:image:secure_url', OG_IMAGE_URL);
  upsertMetaByProperty('og:image:type', OG_IMAGE_TYPE);
  upsertMetaByProperty('og:image:width', OG_IMAGE_WIDTH);
  upsertMetaByProperty('og:image:height', OG_IMAGE_HEIGHT);
  upsertMetaByProperty('og:image:alt', OG_IMAGE_ALT);

  upsertMetaByName('twitter:card', TWITTER_CARD);
  upsertMetaByName('twitter:title', meta.title);
  upsertMetaByName('twitter:description', meta.description);
  upsertMetaByName('twitter:url', canonicalUrl);
  upsertMetaByName('twitter:image', OG_IMAGE_URL);
  upsertMetaByName('twitter:image:alt', OG_IMAGE_ALT);

  upsertCanonical(canonicalUrl);
};

export const useResolvedPageMeta = (pathname: string, overrides?: PageMetaOverrides): void => {
  const overrideTitle = overrides?.title;
  const overrideDescription = overrides?.description;
  const overridePath = overrides?.path;
  const overrideRobots = overrides?.robots;
  const overrideKeywords = overrides?.keywords;
  const overrideOgType = overrides?.ogType;

  useLayoutEffect(() => {
    applyPageMeta(
      resolvePageMeta(pathname, {
        title: overrideTitle,
        description: overrideDescription,
        path: overridePath,
        robots: overrideRobots,
        keywords: overrideKeywords,
        ogType: overrideOgType,
      }),
    );
  }, [
    pathname,
    overrideTitle,
    overrideDescription,
    overridePath,
    overrideRobots,
    overrideKeywords,
    overrideOgType,
  ]);
};

export const usePageMeta = (pageKey: PageMetaKey, overrides?: PageMetaOverrides): void => {
  const overrideTitle = overrides?.title;
  const overrideDescription = overrides?.description;
  const overridePath = overrides?.path;
  const overrideRobots = overrides?.robots;
  const overrideKeywords = overrides?.keywords;
  const overrideOgType = overrides?.ogType;

  useLayoutEffect(() => {
    const base = PAGE_META[pageKey];
    applyPageMeta({
      ...base,
      title: overrideTitle ?? base.title,
      description: overrideDescription ?? base.description,
      path: overridePath ?? base.path,
      robots: overrideRobots ?? base.robots,
      keywords: overrideKeywords ?? base.keywords,
      ogType: overrideOgType ?? base.ogType ?? 'website',
      canonicalUrl: `${SITE_URL}${overridePath ?? base.path}`,
    });
  }, [
    pageKey,
    overrideTitle,
    overrideDescription,
    overridePath,
    overrideRobots,
    overrideKeywords,
    overrideOgType,
  ]);
};
