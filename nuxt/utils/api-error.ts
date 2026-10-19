import type { ApiError } from '~/types/api';

// $fetch errors carry the API's JSON body in `data`. Network failures have none.
export function apiError(error: unknown): ApiError | null {
  const data = (error as { data?: unknown })?.data;
  return data && typeof data === 'object' && 'code' in data
    ? (data as ApiError)
    : null;
}
