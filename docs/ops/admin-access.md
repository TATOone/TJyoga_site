# Доступ в админку

В `/admin` и к admin API допускаются только два email (без учёта регистра):

- `tim.ohana@yandex.ru`
- `evgeniawoita@gmail.com`

Роль `admin` / `editor` / `support` сама по себе не даёт вход. Меняйте список только в:

- `src/config/adminAccess.ts`
- `backend/src/config/adminAccess.ts`

Регистрация всегда создаёт `student`. Пароли здесь не задаются.
