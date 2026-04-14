import { initializeInfrastructure } from '@maison/shared';

/**
 * Boots the web application by initializing essential infrastructure.
 * This is safe to call multiple times as the providers handle singleton logic.
 */
export function boot() {
  if (typeof window !== 'undefined') {
    // Client-side specific boot
    console.debug('[Boot] Initializing client infrastructure');
  } else {
    // Server-side specific boot
    console.debug('[Boot] Initializing server infrastructure');
  }

  initializeInfrastructure();
}

// Auto-boot if this file is imported
boot();
