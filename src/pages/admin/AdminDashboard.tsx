import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  apiClient,
  ApiClientError,
  type AdminOverview,
  type AdminUser,
  type ArticleListItem,
  type VideoListItem,
} from '../../lib/apiClient';
import { clearAuthSession, loadAuthSession } from '../../lib/authStorage';
import { usePageMeta } from '../../utils/usePageMeta';

const AdminDashboard: React.FC = () => {
  usePageMeta('admin');
  const navigate = useNavigate();
  const [overview, setOverview] = React.useState<AdminOverview | null>(null);
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [videos, setVideos] = React.useState<VideoListItem[]>([]);
  const [articles, setArticles] = React.useState<ArticleListItem[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [zoomUrl, setZoomUrl] = React.useState('');
  const [videoForm, setVideoForm] = React.useState({
    title: '',
    kinescope_id: '',
    category: 'practices',
  });
  const [articleForm, setArticleForm] = React.useState({
    title: '',
    slug: '',
    body: '',
    category: 'club-news',
    access: 'club',
  });
  const [extendForm, setExtendForm] = React.useState({ user_id: '', ends_at: '' });
  const [message, setMessage] = React.useState<string | null>(null);

  const token = loadAuthSession()?.accessToken;

  const reload = React.useCallback(async () => {
    if (!token) {
      setError('Нет сессии');
      return;
    }
    try {
      const [ov, us, vd, ar] = await Promise.all([
        apiClient.getAdminOverview(token),
        apiClient.listAdminUsers(token),
        apiClient.listAdminVideos(token),
        apiClient.listAdminArticles(token),
      ]);
      setOverview(ov);
      setUsers(us.users);
      setVideos(vd.videos as VideoListItem[]);
      setArticles(ar.articles);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Ошибка админки');
    }
  }, [token]);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  const withToken = async (fn: (accessToken: string) => Promise<void>) => {
    if (!token) {
      setError('Нет сессии');
      return;
    }
    try {
      await fn(token);
      setMessage('Сохранено');
      await reload();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Ошибка сохранения');
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-light-text border-b border-light-sandy">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-dark-brown">Админка TJ Yoga</h1>
          <div className="flex gap-3">
            <Link to="/account" className="text-terracotta hover:underline">
              Кабинет
            </Link>
            <button
              type="button"
              className="text-dark-brown"
              onClick={() => {
                clearAuthSession();
                navigate('/account/login');
              }}
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {error ? <p className="text-red-700">{error}</p> : null}
        {message ? <p className="text-olive-green">{message}</p> : null}

        {overview ? (
          <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              ['Пользователи', overview.users_count],
              ['Подписки', overview.subscriptions_count],
              ['Заказы', overview.orders_count],
              ['Платежи', overview.payments_count],
              ['Видео', overview.videos_count],
              ['Статьи', overview.articles_count],
            ].map(([label, value]) => (
              <div key={label as string} className="bg-light-text border border-light-sandy rounded-xl p-4">
                <p className="text-sm text-gray-brown">{label}</p>
                <p className="text-2xl font-bold text-dark-brown">{value}</p>
              </div>
            ))}
          </section>
        ) : null}

        <section className="bg-light-text border border-light-sandy rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-semibold">Zoom redirect</h2>
          <input
            type="url"
            placeholder="https://zoom.us/j/..."
            value={zoomUrl}
            onChange={(e) => setZoomUrl(e.target.value)}
            className="w-full min-h-[44px] border border-light-sandy rounded-lg px-3"
          />
          <button
            type="button"
            className="min-h-[44px] px-4 rounded-lg bg-terracotta text-light-text"
            onClick={() =>
              withToken(async (accessToken) => {
                await apiClient.updateZoomLink(accessToken, { target_url: zoomUrl, room: 'main' });
                setZoomUrl('');
              })
            }
          >
            Обновить Zoom URL
          </button>
        </section>

        <section className="bg-light-text border border-light-sandy rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-semibold">Добавить видео</h2>
          <input
            placeholder="Название"
            value={videoForm.title}
            onChange={(e) => setVideoForm((s) => ({ ...s, title: e.target.value }))}
            className="w-full min-h-[44px] border border-light-sandy rounded-lg px-3"
          />
          <input
            placeholder="Kinescope ID"
            value={videoForm.kinescope_id}
            onChange={(e) => setVideoForm((s) => ({ ...s, kinescope_id: e.target.value }))}
            className="w-full min-h-[44px] border border-light-sandy rounded-lg px-3"
          />
          <select
            value={videoForm.category}
            onChange={(e) => setVideoForm((s) => ({ ...s, category: e.target.value }))}
            className="w-full min-h-[44px] border border-light-sandy rounded-lg px-3"
          >
            <option value="practices">Практики</option>
            <option value="seminars">Семинары</option>
            <option value="philosophy">Философия</option>
            <option value="new">Новое</option>
          </select>
          <button
            type="button"
            className="min-h-[44px] px-4 rounded-lg bg-olive-green text-light-text"
            onClick={() =>
              withToken(async (accessToken) => {
                await apiClient.upsertAdminVideo(accessToken, videoForm);
                setVideoForm({ title: '', kinescope_id: '', category: 'practices' });
              })
            }
          >
            Сохранить видео
          </button>
          <p className="text-sm text-gray-brown">Сейчас в каталоге: {videos.length}</p>
        </section>

        <section className="bg-light-text border border-light-sandy rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-semibold">Добавить статью (Блог / Знания)</h2>
          <input
            placeholder="Заголовок"
            value={articleForm.title}
            onChange={(e) => setArticleForm((s) => ({ ...s, title: e.target.value }))}
            className="w-full min-h-[44px] border border-light-sandy rounded-lg px-3"
          />
          <input
            placeholder="slug"
            value={articleForm.slug}
            onChange={(e) => setArticleForm((s) => ({ ...s, slug: e.target.value }))}
            className="w-full min-h-[44px] border border-light-sandy rounded-lg px-3"
          />
          <textarea
            placeholder="Текст"
            value={articleForm.body}
            onChange={(e) => setArticleForm((s) => ({ ...s, body: e.target.value }))}
            className="w-full min-h-[120px] border border-light-sandy rounded-lg px-3 py-2"
          />
          <select
            value={articleForm.access}
            onChange={(e) => setArticleForm((s) => ({ ...s, access: e.target.value }))}
            className="w-full min-h-[44px] border border-light-sandy rounded-lg px-3"
          >
            <option value="public">Блог (публично)</option>
            <option value="club">Знания (только подписка)</option>
          </select>
          <button
            type="button"
            className="min-h-[44px] px-4 rounded-lg bg-olive-green text-light-text"
            onClick={() =>
              withToken(async (accessToken) => {
                await apiClient.upsertAdminArticle(accessToken, articleForm);
                setArticleForm({
                  title: '',
                  slug: '',
                  body: '',
                  category: 'club-news',
                  access: 'club',
                });
              })
            }
          >
            Сохранить статью
          </button>
          <p className="text-sm text-gray-brown">Сейчас статей: {articles.length}</p>
        </section>

        <section className="bg-light-text border border-light-sandy rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-semibold">Продлить подписку вручную</h2>
          <input
            placeholder="user_id (UUID)"
            value={extendForm.user_id}
            onChange={(e) => setExtendForm((s) => ({ ...s, user_id: e.target.value }))}
            className="w-full min-h-[44px] border border-light-sandy rounded-lg px-3"
          />
          <input
            type="datetime-local"
            value={extendForm.ends_at}
            onChange={(e) => setExtendForm((s) => ({ ...s, ends_at: e.target.value }))}
            className="w-full min-h-[44px] border border-light-sandy rounded-lg px-3"
          />
          <button
            type="button"
            className="min-h-[44px] px-4 rounded-lg bg-terracotta text-light-text"
            onClick={() =>
              withToken(async (accessToken) => {
                const endsAt = new Date(extendForm.ends_at).toISOString();
                await apiClient.extendSubscription(accessToken, {
                  user_id: extendForm.user_id,
                  ends_at: endsAt,
                });
              })
            }
          >
            Продлить
          </button>
        </section>

        <section className="bg-light-text border border-light-sandy rounded-2xl p-6 overflow-x-auto">
          <h2 className="text-lg font-semibold mb-3">Пользователи</h2>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-light-sandy">
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Роль</th>
                <th className="py-2 pr-3">Подписка</th>
                <th className="py-2">ID</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-light-sandy/60">
                  <td className="py-2 pr-3">{user.email}</td>
                  <td className="py-2 pr-3">{user.role}</td>
                  <td className="py-2 pr-3">{user.subscription?.status ?? '—'}</td>
                  <td className="py-2 font-mono text-xs">{user.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
