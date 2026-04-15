export type ApiResult<T> = 
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: ApiErrorDetail };

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: unknown;
}

export class DomainError extends Error {
  constructor(public message: string, public code: string = 'DOMAIN_ERROR') {
    super(message);
    this.name = 'DomainError';
  }
}
