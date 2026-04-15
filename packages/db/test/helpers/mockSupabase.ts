import type { AppSupabaseClient } from '../../src/client.types';

/**
 * A type-safe mock response builder for Supabase/Postgrest.
 */
class MockResponseBuilder {
  public data: unknown = null;
  public error: unknown = null;
  public lastPayload: unknown = null;
  public lastFilters: Record<string, unknown> = {};
  public lastRpcArgs: unknown = null;

  setResponse(data: unknown, error: unknown = null) {
    this.data = data;
    this.error = error;
    return this;
  }

  select(_columns?: string) { return this; }
  
  insert(payload: unknown) { 
    this.lastPayload = payload;
    return this; 
  }
  
  update(payload: unknown) { 
    this.lastPayload = payload;
    return this; 
  }
  
  delete() { return this; }
  
  eq(field: string, val: unknown) { 
    this.lastFilters[field] = val;
    return this; 
  }
  
  in(field: string, vals: unknown[]) { 
    this.lastFilters[field] = vals;
    return this; 
  }
  
  order(_field: string, _opts?: unknown) { return this; }
  single() { return this; }
  maybeSingle() { return this; }
  limit(_n: number) { return this; }
  offset(_n: number) { return this; }
  
  rpc(name: string, args: unknown) { 
    this.lastRpcArgs = args;
    return this; 
  }

  then(resolve: (value: { data: unknown, error: unknown }) => void) {
    resolve({ data: this.data, error: this.error });
  }
}

export function createMockSupabaseClient() {
  const builder = new MockResponseBuilder();

  // Using a typed proxy to satisfy the Postgrest interface without 'any'
  const proxyBuilder = new Proxy(builder, {
    get(target, prop) {
      if (prop in target) {
        return (target as unknown as Record<string, unknown>)[prop as string];
      }
      return () => target; 
    }
  });

  const client = {
    from: (_table: string) => proxyBuilder,
    rpc: (_name: string, _args: unknown) => {
      builder.lastRpcArgs = _args;
      return proxyBuilder;
    },
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
    }
  };

  return {
    client: client as unknown as AppSupabaseClient,
    builder
  };
}

export function createFailingSupabaseClient(errorCode: string, errorMessage: string = 'DB Error') {
  const { client, builder } = createMockSupabaseClient();
  builder.setResponse(null, { code: errorCode, message: errorMessage });
  return client;
}
