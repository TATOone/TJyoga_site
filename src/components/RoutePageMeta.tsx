import React from 'react';
import { useLocation } from 'react-router-dom';
import { useResolvedPageMeta } from '../utils/usePageMeta';

/**
 * Ставит уникальные title/description/canonical по текущему URL,
 * даже пока lazy-страница ещё грузится.
 */
const RoutePageMeta: React.FC = () => {
  const { pathname } = useLocation();
  useResolvedPageMeta(pathname);
  return null;
};

export default RoutePageMeta;
