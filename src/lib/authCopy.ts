import { ApiClientError } from './apiClient';

type AuthCopyKind = 'login' | 'register';

export const friendlyAuthError = (err: unknown, kind: AuthCopyKind): string => {
  if (!(err instanceof ApiClientError)) {
    return kind === 'login'
      ? 'Не удалось войти. Проверьте email и пароль или напишите в поддержку.'
      : 'Не удалось создать аккаунт. Попробуйте ещё раз или напишите в поддержку.';
  }

  switch (err.code) {
    case 'UNAUTHORIZED':
      return 'Неверный email или пароль.';
    case 'CONFLICT':
      return 'Этот email уже зарегистрирован. Войдите в кабинет.';
    case 'VALIDATION_ERROR':
      return kind === 'register'
        ? 'Проверьте email и пароль: пароль не короче 8 символов.'
        : 'Проверьте email и пароль.';
    case 'RATE_LIMITED':
    case 'TOO_MANY_REQUESTS':
      return 'Слишком много попыток. Подождите минуту и попробуйте снова.';
    default:
      return err.message;
  }
};
