import { z } from 'zod';

export interface PersistentStoreOptions<T> {
  key: string;
  version: number;
  schema: z.ZodType<T>;
  migrate?: (old: unknown, fromVersion: number) => T;
  fallback: T;
}

export function createPersistentStore<T>(options: PersistentStoreOptions<T>) {
  type Listener = (val: T) => void;
  const listeners: Set<Listener> = new Set();
  
  const getStorageKey = () => `${options.key}_v${options.version}`;
  const __isBrowser = typeof window !== 'undefined';

  const migrateIfNeeded = (): T => {
    if (!__isBrowser) return options.fallback;

    // Check if current version exists
    const raw = localStorage.getItem(getStorageKey());
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const validated = options.schema.safeParse(parsed);
        if (validated.success) return validated.data;
      } catch (e) {
        console.error(`[Store] Failed to parse ${options.key}`, e);
      }
    }

    // Attempt migration from previous versions if no valid current version found
    if (options.migrate) {
      for (let v = options.version - 1; v >= 1; v--) {
        const oldKey = `${options.key}_v${v}`;
        const oldRaw = localStorage.getItem(oldKey);
        // Also check unversioned legacy key matching exactly `options.key`
        const legacyRaw = v === 1 ? localStorage.getItem(options.key) : null;
        
        const sourceData = oldRaw || legacyRaw;

        if (sourceData) {
          try {
             // For legacy unstructured stores, they were version 1 equivalent
            const parsed = JSON.parse(sourceData);
            const migrated = options.migrate(parsed, v);
            
            // Validate the migrated data matches current schema
            const validated = options.schema.safeParse(migrated);
            if (validated.success) {
              // Save migrated version and cleanup old
              localStorage.setItem(getStorageKey(), JSON.stringify(validated.data));
              if (oldRaw) localStorage.removeItem(oldKey);
              if (legacyRaw) localStorage.removeItem(options.key);
              return validated.data;
            }
          } catch (e) {
             console.error(`[Store] Failed to migrate ${options.key} from v${v}`, e);
          }
        }
      }
    }
    
    return options.fallback;
  };

  const get = (): T => {
    return migrateIfNeeded();
  };

  const set = (value: T) => {
    if (!__isBrowser) return;
    const validated = options.schema.safeParse(value);
    if (!validated.success) {
      console.error(`[Store] Discarding invalid write to ${options.key}`, validated.error);
      return;
    }
    localStorage.setItem(getStorageKey(), JSON.stringify(validated.data));
    notify(validated.data);
  };

  const notify = (value: T) => {
    listeners.forEach(l => l(value));
  };

  const subscribe = (listener: Listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const clear = () => {
    if (__isBrowser) localStorage.removeItem(getStorageKey());
    notify(options.fallback);
  };
  
  // Custom sync for multi-tab
  if (__isBrowser) {
    window.addEventListener('storage', (e) => {
      if (e.key === getStorageKey()) {
        try {
          if (e.newValue) {
             const parsed = JSON.parse(e.newValue);
             const validated = options.schema.safeParse(parsed);
             if (validated.success) notify(validated.data);
          } else {
             notify(options.fallback);
          }
        } catch {
           notify(options.fallback);
        }
      }
    });

    // Provide legacy custom event adapter during transition
    window.addEventListener(`${options.key}Updated`, () => {
       const val = get();
       notify(val);
    });
  }

  return { get, set, subscribe, clear };
}
