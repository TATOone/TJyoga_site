import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PublicPageLayout from '../../components/PublicPageLayout';
import { Button, FormCard, TextField } from '../../components/ui';
import { apiClient, ApiClientError } from '../../lib/apiClient';
import { isRememberMeEnabled, saveAuthSession } from '../../lib/authStorage';
import { analyticsEvents } from '../../utils/analytics';
import { usePageMeta } from '../../utils/usePageMeta';

const Login: React.FC = () => {
  usePageMeta('accountLogin');
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/account';

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
      navigate(from, { replace: true });
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : 'Не удалось войти. Проверьте данные.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicPageLayout title="Вход" subtitle="Быстрый доступ к кабинету, Zoom и клубным материалам.">
      <FormCard
        title="С возвращением"
        subtitle="Войдите по email и паролю. Можно сохранить сессию на этом устройстве."
        footer={
          <p className="text-center text-sm text-gray-brown">
            Нет аккаунта?{' '}
            <Link to="/account/register" className="font-medium text-terracotta hover:underline">
              Зарегистрироваться
            </Link>
          </p>
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
            Войти
          </Button>
          <p className="text-center text-xs text-gray-brown">
            <Link to="/blog" className="text-olive-green hover:underline">
              Читать блог без входа
            </Link>
          </p>
        </form>
      </FormCard>
    </PublicPageLayout>
  );
};

export default Login;
