import { Database } from '../../src/database.types';

/**
 * Industry-Grade Strictly Typed Supabase Mock Client
 */

type Tables = Database['public']['Tables'];
type Functions = Database['public']['Functions'];

export interface MockResponse<T> {
  data: T | null;
  error: Error | { message: string } | null;
  count?: number;
}

export class MockSupabaseClient {
  private mockData: unknown = null;
  private mockError: Error | { message: string } | null = null;
  private mockCount: number = 0;

  setResponse<T>(data: T, error: Error | { message: string } | null = null, count: number = 0): this {
    this.mockData = data;
    this.mockError = error;
    this.mockCount = count;
    return this;
  }

  from<T extends keyof Tables>(_table: T) {
    return this;
  }

  select(_columns?: string) {
    return this;
  }

  insert<T>(_val: T) {
    return this;
  }

  update<T>(_val: T) {
    return this;
  }

  upsert<T>(_val: T) {
    return this;
  }

  delete() {
    return this;
  }

  eq(_col: string, _val: unknown) {
    return this;
  }

  in(_col: string, _vals: unknown[]) {
    return this;
  }

  order(_col: string, _opts?: { ascending?: boolean }) {
    return this;
  }

  limit(_n: number) {
    return this;
  }

  offset(_n: number) {
    return this;
  }

  single<T>(): Promise<MockResponse<T>> {
    return Promise.resolve({ 
      data: this.mockData as T, 
      error: this.mockError 
    });
  }

  maybeSingle<T>(): Promise<MockResponse<T>> {
    return Promise.resolve({ 
      data: this.mockData as T, 
      error: this.mockError 
    });
  }

  then<T>(resolve: (value: MockResponse<T>) => void) {
    resolve({ 
      data: this.mockData as T, 
      error: this.mockError,
      count: this.mockCount 
    });
  }

  async rpc<T extends keyof Functions>(
    _name: T, 
    _args?: Functions[T]['Args']
  ): Promise<MockResponse<Functions[T]['Returns']>> {
    return { 
      data: this.mockData as Functions[T]['Returns'], 
      error: this.mockError 
    };
  }

  get storage() {
    return {
      from: (_bucket: string) => ({
        download: async (_path: string) => ({ 
          data: this.mockData as Blob, 
          error: this.mockError 
        }),
        upload: async (_path: string, _body: unknown) => ({ 
          data: this.mockData, 
          error: this.mockError 
        }),
        list: async (_path: string, _opts?: unknown) => ({ 
          data: this.mockData as unknown[], 
          error: this.mockError 
        }),
        getPublicUrl: (_path: string) => ({ 
          data: { publicUrl: String(this.mockData) } 
        })
      })
    };
  }
}

export function createMockClient(): MockSupabaseClient {
  return new MockSupabaseClient();
}
