import { CLUB_SUPPORT } from './clubContent';
import { OPERATOR_INFO } from './legalDocuments';
import {
  OG_IMAGE_URL,
  SITE_NAME,
  SITE_URL,
  getPageMetaKeyForPath,
  resolvePageMeta,
} from './pageMeta';
import { CLUB_RATE_PRODUCT_IDS, PRODUCTS } from './products';
import { SEED_ARTICLES } from './seedContent';
import { TEACHERS } from './teachers';

type JsonLdNode = Record<string, unknown>;

const pageUrl = (path: string): string => `${SITE_URL}${path === '/' ? '/' : path}`;

export const organizationJsonLd = (): JsonLdNode => ({
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo/exports/tjyoga-logo-512.png`,
  image: OG_IMAGE_URL,
  description:
    'Классическая хатха-йога из первоисточников. Онлайн-клуб, ретриты и персональные занятия.',
  email: OPERATOR_INFO.supportEmail,
  sameAs: ['https://t.me/TJyoga', 'https://t.me/starovoitovae'],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: OPERATOR_INFO.supportEmail,
    availableLanguage: ['Russian'],
  },
  areaServed: {
    '@type': 'Country',
    name: 'Россия',
  },
  founder: TEACHERS.map((teacher) => ({
    '@type': 'Person',
    name: teacher.schemaName,
    jobTitle: teacher.role,
  })),
});

export const websiteJsonLd = (): JsonLdNode => ({
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: 'ru-RU',
  publisher: { '@id': `${SITE_URL}/#organization` },
});

const breadcrumbJsonLd = (pathname: string): JsonLdNode => {
  const meta = resolvePageMeta(pathname);
  const items: JsonLdNode[] = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Главная',
      item: pageUrl('/'),
    },
  ];

  if (meta.path !== '/') {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: meta.title,
      item: meta.canonicalUrl,
    });
  }

  return {
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
};

const clubOfferJsonLd = (): JsonLdNode => ({
  '@type': 'Product',
  '@id': `${SITE_URL}/club#product`,
  name: 'Онлайн Йога-Клуб TJ Yoga',
  description:
    'Подписка: живые практики хатха-йоги в Zoom, записи занятий, понятные уровни и чат с преподавателем.',
  image: OG_IMAGE_URL,
  brand: { '@id': `${SITE_URL}/#organization` },
  url: pageUrl('/club'),
  offers: CLUB_RATE_PRODUCT_IDS.flatMap((id) => {
    const product = PRODUCTS[id];
    if (product.priceAmount == null) {
      return [];
    }

    return [
      {
        '@type': 'Offer',
        name: product.shortTitle,
        price: String(product.priceAmount),
        priceCurrency: product.priceCurrency ?? 'RUB',
        url: pageUrl('/club/rates'),
        availability: 'https://schema.org/InStock',
      },
    ];
  }),
});

const clubFaqJsonLd = (): JsonLdNode => ({
  '@type': 'FAQPage',
  mainEntity: CLUB_SUPPORT.faq.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a,
    },
  })),
});

const blogArticleJsonLd = (slug: string): JsonLdNode | null => {
  const article = SEED_ARTICLES.find((item) => item.slug === slug && item.access === 'public');
  if (!article) {
    return null;
  }

  return {
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    inLanguage: 'ru-RU',
    author: TEACHERS.map((teacher) => ({
      '@type': 'Person',
      name: teacher.schemaName,
    })),
    publisher: { '@id': `${SITE_URL}/#organization` },
    mainEntityOfPage: pageUrl(`/blog/${article.slug}`),
  };
};

/**
 * Страничный @graph. Organization + WebSite уже есть в index.html —
 * здесь только сущности маршрута. Без aggregateRating и выдуманных отзывов.
 */
export const getRouteJsonLdGraph = (pathname: string): JsonLdNode[] => {
  const key = getPageMetaKeyForPath(pathname);
  const graph: JsonLdNode[] = [breadcrumbJsonLd(pathname)];

  switch (key) {
    case 'home':
      graph.push({
        '@type': 'WebPage',
        '@id': `${SITE_URL}/#webpage`,
        url: pageUrl('/'),
        name: resolvePageMeta('/').title,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#organization` },
      });
      break;
    case 'club':
      graph.push(clubOfferJsonLd(), clubFaqJsonLd());
      break;
    case 'clubRates':
      graph.push(clubOfferJsonLd());
      break;
    case 'blog': {
      const normalized = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
      if (normalized.startsWith('/blog/')) {
        const articleNode = blogArticleJsonLd(normalized.slice('/blog/'.length));
        if (articleNode) {
          graph.push(articleNode);
        }
      }
      break;
    }
    case 'free':
    case 'retreats':
    case 'personal':
    case 'about':
    case 'howToBuy':
    case 'checkout':
    case 'paymentSuccess':
    case 'paymentError':
    case 'offer':
    case 'policy':
    case 'refund':
    case 'medicalDisclaimer':
    case 'account':
    case 'accountLogin':
    case 'accountRegister':
    case 'admin':
    case 'notFound':
      break;
    default: {
      const exhaustive: never = key;
      return exhaustive;
    }
  }

  return graph;
};

export const ROUTE_JSON_LD_SCRIPT_ID = 'jsonld-route';
