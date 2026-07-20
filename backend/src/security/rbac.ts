import type { preHandlerHookHandler } from 'fastify';
import { ApiError } from '../lib/http.js';
import type { UserRole } from '../types/domain.js';

const ROLE_WEIGHT: Record<UserRole, number> = {
  user: 10,
  student: 20,
  support: 30,
  editor: 40,
  admin: 50,
};

export const hasRoleAccess = (currentRole: UserRole, allowedRoles: readonly UserRole[]): boolean =>
  allowedRoles.some((allowedRole) => ROLE_WEIGHT[currentRole] >= ROLE_WEIGHT[allowedRole]);

export const requireRoles = (allowedRoles: readonly UserRole[]): preHandlerHookHandler => {
  const guard: preHandlerHookHandler = async (request) => {
    if (!request.auth) {
      throw new ApiError('UNAUTHORIZED', 'Требуется авторизация');
    }

    if (!hasRoleAccess(request.auth.role, allowedRoles)) {
      throw new ApiError('FORBIDDEN', 'Недостаточно прав для выполнения операции', {
        required_roles: allowedRoles,
        actual_role: request.auth.role,
      });
    }
  };

  return guard;
};
