import { createLogger, initializeInfrastructure } from '@maison/shared';

const logger = createLogger('boot');

/**
 * Boots the web application by initializing essential infrastructure.
 * This is safe to call multiple times as the providers handle singleton logic.
 */
export function boot() {
  if (typeof window !== 'undefined') {
    logger.info('Initializing client infrastructure');
  } else {
    logger.info('Initializing server infrastructure');
  }

  initializeInfrastructure();
}

// Auto-boot if this file is imported
boot();

