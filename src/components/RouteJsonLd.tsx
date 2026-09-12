import React, { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getRouteJsonLdGraph, ROUTE_JSON_LD_SCRIPT_ID } from '../config/jsonLd';

const upsertRouteJsonLd = (pathname: string): void => {
  const graph = getRouteJsonLdGraph(pathname);
  let element = document.getElementById(ROUTE_JSON_LD_SCRIPT_ID) as HTMLScriptElement | null;

  if (graph.length === 0) {
    element?.remove();
    return;
  }

  if (!element) {
    element = document.createElement('script');
    element.id = ROUTE_JSON_LD_SCRIPT_ID;
    element.type = 'application/ld+json';
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': graph,
  });
};

const RouteJsonLd: React.FC = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    upsertRouteJsonLd(pathname);
  }, [pathname]);

  return null;
};

export default RouteJsonLd;
