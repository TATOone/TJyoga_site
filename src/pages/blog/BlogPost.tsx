import React from 'react';
import { Link, useParams } from 'react-router-dom';
import PublicPageLayout from '../../components/PublicPageLayout';
import { StatusBadge } from '../../components/ui';
import { apiClient, ApiClientError, type ArticleDetail } from '../../lib/apiClient';
import { usePageMeta } from '../../utils/usePageMeta';

const BlogPost: React.FC = () => {
  usePageMeta('blog');
  const { slug = '' } = useParams();
  const [article, setArticle] = React.useState<ArticleDetail | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const load = async () => {
      try {
        const data = await apiClient.getArticle(slug, null);
        if (data.access !== 'public') {
          setError('Эта запись доступна только участникам клуба.');
          return;
        }
        setArticle(data);
      } catch (err) {
        setError(err instanceof ApiClientError ? err.message : 'Статья недоступна');
      }
    };
    void load();
  }, [slug]);

  if (error) {
    return (
      <PublicPageLayout title="Блог" subtitle="Запись недоступна">
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <p className="text-danger">{error}</p>
          <Link to="/blog" className="text-terracotta hover:underline">
            ← Ко всем записям
          </Link>
        </div>
      </PublicPageLayout>
    );
  }

  if (!article) {
    return (
      <PublicPageLayout title="Блог" subtitle="Загрузка...">
        <p className="text-center text-gray-brown">Загрузка...</p>
      </PublicPageLayout>
    );
  }

  return (
    <PublicPageLayout title={article.title} subtitle={article.excerpt}>
      <article className="mx-auto max-w-2xl rounded-card border border-light-sandy bg-light-text p-6 shadow-soft md:p-8">
        <Link to="/blog" className="text-sm text-terracotta hover:underline">
          ← К блогу
        </Link>
        <div className="mt-4 mb-3 flex items-center gap-2">
          <StatusBadge label="Блог" />
          <span className="text-xs text-gray-brown">
            {new Date(article.published_at).toLocaleDateString('ru-RU')}
          </span>
        </div>
        <h1 className="font-display text-3xl font-semibold text-dark-brown">{article.title}</h1>
        <div className="mt-6 whitespace-pre-wrap text-dark-brown leading-relaxed">{article.body}</div>
      </article>
    </PublicPageLayout>
  );
};

export default BlogPost;
