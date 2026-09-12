import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PublicPageLayout from '../../components/PublicPageLayout';
import { Button, FormCard, TextField } from '../../components/ui';
import { CLUB_SUPPORT } from '../../config/clubContent';
import { apiClient } from '../../lib/apiClient';
import { friendlyAuthError } from '../../lib/authCopy';
import { resolvePostAuthPath } from '../../lib/authRedirect';
import { saveAuthSession } from '../../lib/authStorage';
import { analyticsEvents } from '../../utils/analytics';
import { usePageMeta } from '../../utils/usePageMeta';

const Register: React.FC = () => {
  usePageMeta('accountRegister');
  const navigate = useNavigate();
  const location = useLocation();
  const nextPath = resolvePostAuthPath({ search: location.search, state: location.state });

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [firstName, setFirstName] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiClient.register({
        email,
        password,
        first_name: firstName || undefined,
      });
      const session = await apiClient.login({ email, password });
      saveAuthSession(session, rememberMe);
      analyticsEvents.ctaClick('register_success', 'account_register');
      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(friendlyAuthError(err, 'register'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicPageLayout
      title="Регистрация"
      subtitle="После регистрации вы сразу попадёте в кабинет."
    >
      <FormCard
        title="Создать аккаунт"
        subtitle="Дальше можно выбрать тариф или, если оплата уже прошла, открыть практику."
        footer={
          <div className="space-y-2 text-center text-sm text-gray-brown">
            <p>
              Уже есть аккаунт?{' '}
              <Link
                to={`/account/login?next=${encodeURIComponent(nextPath)}`}
                className="font-medium text-terracotta hover:underline"
              >
                Войти
              </Link>
            </p>
            <p>
              Нужна помощь?{' '}
              <a
                href={CLUB_SUPPORT.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-olive-green hover:underline"
              >
                Telegram поддержки
              </a>
            </p>
          </div>
        }
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <TextField
            label="Имя"
            type="text"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
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
              autoComplete="new-password"
              hint="Не менее 8 символов"
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
            Оставаться в системе на этом устройстве
          </label>
          {error ? (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" fullWidth loading={loading}>
            Создать аккаунт
          </Button>
        </form>
      </FormCard>
    </PublicPageLayout>
  );
};

export default Register;
