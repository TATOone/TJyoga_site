import React from 'react';
import { useLocation } from 'react-router-dom';
import { getPageMetaKeyForPath } from '../config/pageMeta';
import { usePageMeta } from '../utils/usePageMeta';

/**
 * Ставит уникальные title/description по текущему URL,
 * даже пока lazy-страница ещё грузится.
 */
const RoutePageMeta: React.FC = () => {
  const { pathname } = useLocation();
  usePageMeta(getPageMetaKeyForPath(pathname));
  return null;
};

export default RoutePageMeta;
