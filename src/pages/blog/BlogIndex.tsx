import React from 'react';
import { Link } from 'react-router-dom';
import PublicPageLayout from '../../components/PublicPageLayout';
import { EmptyState, SectionHeader, StatusBadge } from '../../components/ui';
import { apiClient, ApiClientError, type ArticleListItem } from '../../lib/apiClient';
import { analyticsEvents } from '../../utils/analytics';
import { usePageMeta } from '../../utils/usePageMeta';

const BlogIndex: React.FC = () => {
  usePageMeta('blog');
  const [articles, setArticles] = React.useState<ArticleListItem[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      try {
        const data = await apiClient.listArticles(null);
        setArticles(data.articles.filter((item) => item.access === 'public'));
        analyticsEvents.ctaClick('blog_open', 'blog_index');
      } catch (err) {
        setError(err instanceof ApiClientError ? err.message : 'Не удалось загрузить блог');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <PublicPageLayout
      title="Блог TJ Yoga"
      subtitle="Открытые заметки о практике — как в канале yogaTJ. Для клубных материалов зайдите в Знания."
    >
      <div className="mx-auto max-w-3xl">
        <SectionHeader
          eyebrow="Публично"
          title="Свежие записи"
          subtitle="Читайте без регистрации. Углублённые материалы клуба — в кабинете."
        />

        {loading ? <p className="text-gray-brown">Загрузка...</p> : null}
        {error ? <p className="text-danger">{error}</p> : null}

        {!loading && !error && articles.length === 0 ? (
          <EmptyState
            title="Пока нет записей"
            description="Скоро здесь появятся открытые посты о йоге и практике."
          />
        ) : null}

        <ul className="space-y-4">
          {articles.map((article) => (
            <li
              key={article.id}
              className="rounded-card border border-light-sandy bg-light-text p-5 shadow-soft"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <StatusBadge label="Блог" tone="neutral" />
                <span className="text-xs text-gray-brown">
                  {new Date(article.published_at).toLocaleDateString('ru-RU')}
                </span>
              </div>
              <h2 className="font-display text-xl font-semibold text-dark-brown">{article.title}</h2>
              <p className="mt-2 text-sm text-gray-brown">{article.excerpt}</p>
              <Link
                to={`/blog/${article.slug}`}
                className="mt-4 inline-flex min-h-touch items-center font-medium text-terracotta hover:underline"
                onClick={() => analyticsEvents.ctaClick('blog_post_open', 'blog_index')}
              >
                Читать
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10 rounded-card border border-light-olive bg-light-olive/50 p-5 text-sm text-dark-brown">
          Хотите материалы TJ club?{' '}
          <Link to="/account/knowledge" className="font-medium text-terracotta hover:underline">
            Открыть Знания
          </Link>{' '}
          в кабинете (нужна подписка).
        </p>
      </div>
    </PublicPageLayout>
  );
};

export default BlogIndex;
