import type { QueryResult, QueryResultRow } from 'pg';

export interface SqlExecutor {
  query<T extends QueryResultRow = QueryResultRow>(
    queryText: string,
    values?: unknown[],
  ): Promise<QueryResult<T>>;
}

export const toInet = (ip: string | null): string | null => {
  if (!ip || ip.trim().length === 0) {
    return null;
  }
  return ip;
};
