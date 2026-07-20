import React from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, SectionHeader, StatusBadge } from '../../components/ui';
import { apiClient, ApiClientError, type ArticleListItem, type MeResponse } from '../../lib/apiClient';
import { loadAuthSession } from '../../lib/authStorage';
import { analyticsEvents } from '../../utils/analytics';

const Knowledge: React.FC = () => {
  const [articles, setArticles] = React.useState<ArticleListItem[]>([]);
  const [me, setMe] = React.useState<MeResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      const session = loadAuthSession();
      if (!session) {
        setError('Требуется вход');
        setLoading(false);
        return;
      }

      try {
        const [meData, articlesData] = await Promise.all([
          apiClient.getMe(session.accessToken),
          apiClient.listArticles(session.accessToken),
        ]);
        setMe(meData);
        const hasSub =
          meData.subscription?.status === 'active' || meData.subscription?.status === 'grace';
        if (!hasSub) {
          setArticles([]);
          analyticsEvents.ctaClick('knowledge_denied', 'account_knowledge');
        } else {
          setArticles(articlesData.articles.filter((item) => item.access === 'club'));
          analyticsEvents.ctaClick('knowledge_open', 'account_knowledge');
        }
      } catch (err) {
        setError(err instanceof ApiClientError ? err.message : 'Не удалось загрузить Знания');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const hasSub = me?.subscription?.status === 'active' || me?.subscription?.status === 'grace';

  if (loading) {
    return <p className="text-gray-brown">Загрузка Знаний...</p>;
  }

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  if (!hasSub) {
    return (
      <div className="space-y-6">
        <SectionHeader
          eyebrow="Клуб"
          title="Знания"
          subtitle="Углублённые материалы для участников TJ club."
        />
        <EmptyState
          title="Доступ только по подписке"
          description="Знания — закрытый раздел клуба. Оформите тариф, чтобы читать материалы как в канале TJ club."
          actionLabel="Выбрать тариф"
          actionTo="/club/rates"
        />
        <p className="text-sm text-gray-brown">
          Открытые заметки доступны всем в{' '}
          <Link to="/blog" className="text-terracotta hover:underline">
            блоге
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Клуб"
        title="Знания"
        subtitle="Углублённые материалы о практике — только для участников клуба."
      />

      {articles.length === 0 ? (
        <EmptyState
          title="Пока пусто"
          description="Скоро здесь появятся клубные статьи."
        />
      ) : (
        <ul className="space-y-4">
          {articles.map((article) => (
            <li
              key={article.id}
              className="rounded-card border border-light-sandy bg-light-text p-5 shadow-soft"
            >
              <div className="mb-2 flex items-center gap-2">
                <StatusBadge label="Знания" tone="success" />
                <span className="text-xs text-gray-brown">{article.category}</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-dark-brown">{article.title}</h3>
              <p className="mt-2 text-sm text-gray-brown">{article.excerpt}</p>
              <Link
                to={`/account/knowledge/${article.slug}`}
                className="mt-3 inline-flex min-h-touch items-center text-terracotta hover:underline"
                onClick={() => analyticsEvents.ctaClick('knowledge_article_open', 'account_knowledge')}
              >
                Читать
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Knowledge;
