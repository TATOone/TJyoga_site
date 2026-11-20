import React from 'react';
import { Link } from 'react-router-dom';
import { parseArticleInlineLinks, type ArticleInlinePart } from '../lib/articleInlineLinks';

const INLINE_LINK_CLASS = 'text-terracotta-ink hover:underline';

type ArticleBodyProps = {
  body: string;
  className?: string;
};

const renderPart = (part: ArticleInlinePart, index: number): React.ReactNode => {
  switch (part.type) {
    case 'text':
      return <span key={index}>{part.value}</span>;
    case 'link':
      return (
        <Link key={index} to={part.href} className={INLINE_LINK_CLASS}>
          {part.text}
        </Link>
      );
    default: {
      const unreachable: never = part;
      return unreachable;
    }
  }
};

const ArticleBody: React.FC<ArticleBodyProps> = ({ body, className }) => {
  const parts = parseArticleInlineLinks(body);
  const first = parts[0];
  if (parts.length === 1 && first?.type === 'text') {
    return <div className={className}>{first.value}</div>;
  }

  return <div className={className}>{parts.map(renderPart)}</div>;
};

export default ArticleBody;
