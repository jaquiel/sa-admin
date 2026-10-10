/** Envelope padrão da Strategy Analytics API: toda resposta vem em { data, success, errors }. */
export interface ApiErrorItem {
  code: string;
  message: string;
  field: string | null;
}

export interface ApiResponse<T> {
  data: T | null;
  success: boolean;
  requestId: string;
  errors: ApiErrorItem[];
}

export interface PagedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

export class ApiError extends Error {
  constructor(public readonly errors: ApiErrorItem[]) {
    super(errors[0]?.message ?? 'Erro na API');
  }
}

/** Mensagem legível de um erro da API (envelope de erro do axios ou ApiError). */
export function apiErrorMessage(e: unknown, fallback: string): string {
  const body = (e as { response?: { data?: Partial<ApiResponse<unknown>> } })?.response?.data;
  const errors = body?.errors ?? (e instanceof ApiError ? e.errors : []);
  const msgs = errors.map((x) => (x.field ? `${x.field}: ${x.message}` : x.message)).filter(Boolean);
  return msgs.length ? `${fallback} ${msgs.slice(0, 3).join(' · ')}` : fallback;
}

export function unwrap<T>(res: ApiResponse<T>): T {
  if (!res.success || res.data == null) throw new ApiError(res.errors ?? []);
  return res.data;
}
