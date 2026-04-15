import type { AppSupabaseClient } from '../../src/client.types';

export function createMockSupabaseClient() {
  const mockBuilders = {
    select() { return this; },
    insert() { return this; },
    update() { return this; },
    delete() { return this; },
    eq() { return this; },
    in() { return this; },
    or() { return this; },
    ilike() { return this; },
    textSearch() { return this; },
    contains() { return this; },
    order() { return this; },
    range() { return this; },
    single() { return this; },
    returns() { return this; },
    rpc() { return this; },
    then: (resolve: (value: unknown) => void) => {
      resolve({ data: null, error: null });
    }
  };

  const mockFrom = Object.assign(
    () => mockBuilders,
    mockBuilders
  );

  return {
    from: mockFrom as unknown,
    rpc: () => mockBuilders as unknown,
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
    }
  } as unknown as AppSupabaseClient;
}

export function createFailingSupabaseClient(errorCode: string, errorMessage: string = 'DB Error') {
   const failingBuilders = {
    ...createMockSupabaseClient().from('produits'),
    then(resolve: (value: unknown) => void) {
      resolve({ data: null, error: { code: errorCode, message: errorMessage } });
    }
  };

  return {
    from: (() => failingBuilders) as unknown,
    rpc: () => failingBuilders as unknown,
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
    }
  } as unknown as AppSupabaseClient;
}
