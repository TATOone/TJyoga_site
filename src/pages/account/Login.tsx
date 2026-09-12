import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PublicPageLayout from '../../components/PublicPageLayout';
import { Button, FormCard, TextField } from '../../components/ui';
import { CLUB_SUPPORT } from '../../config/clubContent';
import { apiClient } from '../../lib/apiClient';
import { friendlyAuthError } from '../../lib/authCopy';
import { ACCOUNT_HOME_PATH, resolvePostAuthPath } from '../../lib/authRedirect';
import { isRememberMeEnabled, saveAuthSession } from '../../lib/authStorage';
import { analyticsEvents } from '../../utils/analytics';
import { usePageMeta } from '../../utils/usePageMeta';

const Login: React.FC = () => {
  usePageMeta('accountLogin');
  const navigate = useNavigate();
  const location = useLocation();
  const nextPath = resolvePostAuthPath({ search: location.search, state: location.state });
  const fromPayment = new URLSearchParams(location.search).get('from') === 'payment';

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(isRememberMeEnabled());
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const session = await apiClient.login({ email, password });
      saveAuthSession(session, rememberMe);
      analyticsEvents.ctaClick(
        rememberMe ? 'login_success_remember' : 'login_success',
        'account_login',
      );
      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(friendlyAuthError(err, 'login'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicPageLayout
      title="Вход"
      subtitle={
        fromPayment
          ? 'Оплата принята. Войдите — и кабинет сразу откроет практику.'
          : 'После входа откроется кабинет: Zoom, записи и статус подписки.'
      }
    >
      <FormCard
        title="С возвращением"
        subtitle="Войдите по email и паролю. Сессию можно сохранить на этом устройстве."
        footer={
          <div className="space-y-2 text-center text-sm text-gray-brown">
            <p>
              Нет аккаунта?{' '}
              <Link
                to={`/account/register?next=${encodeURIComponent(nextPath)}`}
                className="font-medium text-terracotta hover:underline"
              >
                Зарегистрироваться
              </Link>
            </p>
            <p>
              Не получается войти?{' '}
              <a
                href={CLUB_SUPPORT.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-olive-green hover:underline"
              >
                Напишите в Telegram
              </a>
            </p>
          </div>
        }
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <TextField
            label="Email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="space-y-1.5">
            <TextField
              label="Пароль"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="text-xs text-olive-green hover:underline"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? 'Скрыть пароль' : 'Показать пароль'}
            </button>
          </div>
          <label className="flex min-h-touch items-center gap-3 text-sm text-dark-brown">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-5 w-5 rounded border-light-sandy text-terracotta"
            />
            Запомнить меня на этом устройстве
          </label>
          {error ? (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" fullWidth loading={loading}>
            Войти в кабинет
          </Button>
          <p className="text-center text-xs text-gray-brown">
            <Link to="/blog" className="text-olive-green hover:underline">
              Читать блог без входа
            </Link>
            {nextPath !== ACCOUNT_HOME_PATH ? (
              <>
                {' · '}
                после входа вернём на нужную страницу кабинета
              </>
            ) : null}
          </p>
        </form>
      </FormCard>
    </PublicPageLayout>
  );
};

export default Login;
