import React from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, SectionHeader, StatusBadge } from '../../components/ui';
import { FUNNEL_RATES_PATH } from '../../config/funnel';
import { apiClient, ApiClientError, type ArticleListItem, type MeResponse } from '../../lib/apiClient';
import { loadAuthSession } from '../../lib/authStorage';
import { hasPracticeAccess } from '../../lib/subscriptionDisplay';
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
        setError('Чтобы читать Знания, войдите в кабинет.');
        setLoading(false);
        return;
      }

      try {
        const [meData, articlesData] = await Promise.all([
          apiClient.getMe(session.accessToken),
          apiClient.listArticles(session.accessToken),
        ]);
        setMe(meData);
        const hasSub = hasPracticeAccess(meData.subscription);
        if (!hasSub) {
          setArticles([]);
          analyticsEvents.ctaClick('knowledge_denied', 'account_knowledge');
        } else {
          setArticles(articlesData.articles.filter((item) => item.access === 'club'));
          analyticsEvents.ctaClick('knowledge_open', 'account_knowledge');
        }
      } catch (err) {
        setError(
          err instanceof ApiClientError
            ? err.message
            : 'Не удалось загрузить Знания. Обновите страницу или напишите в поддержку.',
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const hasSub = hasPracticeAccess(me?.subscription);

  if (loading) {
    return <p className="text-gray-brown">Загрузка Знаний...</p>;
  }

  if (error) {
    return (
      <EmptyState
        title="Знания сейчас недоступны"
        description={error}
        actionLabel="В поддержку"
        actionTo="/account/support"
      />
    );
  }

  if (!hasSub) {
    return (
      <div className="space-y-6">
        <SectionHeader
          eyebrow="Клуб"
          title="Знания"
          subtitle="Углублённые материалы для участников клуба."
        />
        <EmptyState
          title="Раздел откроется после оплаты"
          description="Знания доступны при активной подписке. Открытые заметки можно читать в блоге без входа."
          actionLabel="Выбрать тариф"
          actionTo={FUNNEL_RATES_PATH}
          onActionClick={() => analyticsEvents.ctaClick('renew', 'account_knowledge')}
        />
        <p className="text-sm text-gray-brown">
          Открытые заметки — в{' '}
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
          description="Клубные статьи появятся здесь. Пока можно открыть ближайшую практику или записи."
          actionLabel="К обзору"
          actionTo="/account"
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
