export type ArticleInlinePart =
  | { type: 'text'; value: string }
  | { type: 'link'; text: string; href: string };

/**
 * Один ведущий «/», без «//», схем (javascript:, http:) и управляющих символов.
 * Повторная проверка после decodeURIComponent отсекает %2F%2F и %3A.
 */
const INTERNAL_PATH = /^\/[\p{L}\p{N}\-._~%/?#&=+]*$/u;

const isSingleSlashPath = (value: string): boolean =>
  INTERNAL_PATH.test(value) && !value.includes('//');

export const isSafeInternalPath = (href: string): boolean => {
  if (!isSingleSlashPath(href)) {
    return false;
  }

  try {
    const decoded = decodeURIComponent(href);
    if (decoded !== href && !isSingleSlashPath(decoded)) {
      return false;
    }
  } catch {
    return false;
  }

  return true;
};

export const parseArticleInlineLinks = (body: string): ArticleInlinePart[] => {
  const parts: ArticleInlinePart[] = [];
  const pattern = /\[([^\]\r\n]+)\]\(([^)\s]+)\)/g;
  let cursor = 0;

  for (const match of body.matchAll(pattern)) {
    const full = match[0];
    const text = match[1];
    const href = match[2];
    const index = match.index;
    if (text === undefined || href === undefined || index === undefined) {
      continue;
    }
    if (text.trim() === '' || !isSafeInternalPath(href)) {
      continue;
    }
    if (index > cursor) {
      parts.push({ type: 'text', value: body.slice(cursor, index) });
    }
    parts.push({ type: 'link', text, href });
    cursor = index + full.length;
  }

  if (cursor < body.length || parts.length === 0) {
    parts.push({ type: 'text', value: body.slice(cursor) });
  }

  return parts;
};
