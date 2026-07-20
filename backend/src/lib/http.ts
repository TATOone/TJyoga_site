import { randomUUID } from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'IDEMPOTENCY_CONFLICT'
  | 'RATE_LIMITED'
  | 'PROVIDER_UNAVAILABLE'
  | 'INTERNAL_ERROR'
  | 'SUBSCRIPTION_REQUIRED'
  | 'SIGNATURE_INVALID';

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  IDEMPOTENCY_CONFLICT: 409,
  RATE_LIMITED: 429,
  PROVIDER_UNAVAILABLE: 502,
  INTERNAL_ERROR: 500,
  SUBSCRIPTION_REQUIRED: 403,
  SIGNATURE_INVALID: 401,
};

export class ApiError extends Error {
  public readonly code: ApiErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: ApiErrorCode,
    message: string,
    details?: Record<string, unknown>,
    statusCode: number = STATUS_BY_CODE[code],
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export interface ApiSuccessResponse<TData> {
  data: TData;
  meta: {
    request_id: string;
  };
}

export const success = <TData>(request: FastifyRequest, data: TData): ApiSuccessResponse<TData> => ({
  data,
  meta: {
    request_id: request.id,
  },
});

export const toErrorResponse = (
  request: FastifyRequest,
  error: ApiError,
): {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
  meta: { request_id: string };
} => ({
  error: {
    code: error.code,
    message: error.message,
    details: error.details,
  },
  meta: {
    request_id: request.id,
  },
});

export const sendApiError = (reply: FastifyReply, request: FastifyRequest, error: ApiError): void => {
  reply.status(error.statusCode).send(toErrorResponse(request, error));
};

export const mapUnknownError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof ZodError) {
    return new ApiError('VALIDATION_ERROR', 'Некорректные входные данные', {
      issues: error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  return new ApiError('INTERNAL_ERROR', 'Внутренняя ошибка сервиса');
};

export const ensureRequestId = (requestIdFromHeader?: string): string => {
  if (requestIdFromHeader && requestIdFromHeader.trim().length > 0) {
    return requestIdFromHeader;
  }
  return randomUUID();
};
