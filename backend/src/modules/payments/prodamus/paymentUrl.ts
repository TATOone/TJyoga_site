const firstLine = (body: string): string => body.trim().split(/\r?\n/, 1)[0]?.trim() ?? '';

const collectCandidates = (location: string | null, body: string): string[] => {
  const candidates: string[] = [];
  if (location?.trim()) {
    candidates.push(location.trim());
  }

  const trimmed = body.trim();
  if (trimmed && !trimmed.startsWith('<')) {
    const line = firstLine(trimmed);
    if (line) {
      candidates.push(line);
    }
  }

  const refresh = trimmed.match(/url=(https?:[^"'\s>]+)/i);
  if (refresh?.[1]) {
    candidates.push(refresh[1].replace(/&amp;/g, '&'));
  }

  const href = trimmed.match(/href="(https?:[^"]+)"/i);
  if (href?.[1]) {
    candidates.push(href[1].replace(/&amp;/g, '&'));
  }

  return candidates;
};

/** Prodamus `do=link` may return a raw URL, or 302/HTML refresh onto the invoice page. */
export const extractProdamusPaymentUrl = (
  response: { location: string | null; body: string },
  requestUrl: string,
): string | null => {
  for (const candidate of collectCandidates(response.location, response.body)) {
    try {
      const resolved = new URL(candidate, requestUrl);
      if (resolved.protocol === 'https:' || resolved.protocol === 'http:') {
        return resolved.toString();
      }
    } catch {
      continue;
    }
  }
  return null;
};
