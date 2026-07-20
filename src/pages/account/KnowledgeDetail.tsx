import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { EmptyState, StatusBadge } from '../../components/ui';
import { apiClient, ApiClientError, type ArticleDetail } from '../../lib/apiClient';
import { loadAuthSession } from '../../lib/authStorage';

const KnowledgeDetail: React.FC = () => {
  const { slug = '' } = useParams();
  const [article, setArticle] = React.useState<ArticleDetail | null>(null);
  const [errorCode, setErrorCode] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const load = async () => {
      const session = loadAuthSession();
      if (!session) {
        setError('Требуется вход');
        return;
      }
      try {
        const data = await apiClient.getArticle(slug, session.accessToken);
        setArticle(data);
      } catch (err) {
        if (err instanceof ApiClientError) {
          setErrorCode(err.code);
          setError(err.message);
          return;
        }
        setError('Статья недоступна');
      }
    };
    void load();
  }, [slug]);

  if (errorCode === 'SUBSCRIPTION_REQUIRED') {
    return (
      <EmptyState
        title="Нужна активная подписка"
        description="Эта статья из раздела Знания доступна участникам клуба."
        actionLabel="Выбрать тариф"
        actionTo="/club/rates"
      />
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-danger">{error}</p>
        <Link to="/account/knowledge" className="text-terracotta hover:underline">
          Назад к Знаниям
        </Link>
      </div>
    );
  }

  if (!article) {
    return <p className="text-gray-brown">Загрузка...</p>;
  }

  return (
    <article className="space-y-4 rounded-card border border-light-sandy bg-light-text p-6 shadow-soft">
      <Link to="/account/knowledge" className="text-sm text-terracotta hover:underline">
        ← К Знаниям
      </Link>
      <div className="flex items-center gap-2">
        <StatusBadge label="Знания" tone="success" />
        <span className="text-xs text-gray-brown">
          {new Date(article.published_at).toLocaleDateString('ru-RU')}
        </span>
      </div>
      <h1 className="font-display text-3xl font-semibold text-dark-brown">{article.title}</h1>
      <div className="whitespace-pre-wrap leading-relaxed text-dark-brown">{article.body}</div>
    </article>
  );
};

export default KnowledgeDetail;
