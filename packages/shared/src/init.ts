import { SanitizerProvider } from '@maison/domain';
import { DomPurifySanitizer } from './infrastructure/DomPurifySanitizer';

/**
 * Initializes all shared infrastructure services and registers them with the Domain layer.
 * This should be called once during application startup (server-side and client-side).
 */
export function initializeInfrastructure() {
  // Register HTML Sanitizer
  SanitizerProvider.set(new DomPurifySanitizer());
  
  // Potential for other service registrations:
  // LoggerProvider.set(new SharedLogger());
  // CacheProvider.set(new RedisCache());
}
