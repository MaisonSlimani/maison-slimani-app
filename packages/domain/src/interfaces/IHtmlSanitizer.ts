/**
 * Interface for HTML sanitization to decouple Domain from external libraries like DOMPurify.
 */
export interface IHtmlSanitizer {
  /**
   * Sanitizes an HTML string based on a set of allowed tags and attributes.
   */
  sanitize(html: string): string;
}

/**
 * Registry to hold the active sanitizer implementation.
 * This allows injection at the application boundary (e.g., in apps/web or in tests).
 */
export class SanitizerProvider {
  private static instance: IHtmlSanitizer | null = null;

  static set(sanitizer: IHtmlSanitizer) {
    this.instance = sanitizer;
  }

  static get(): IHtmlSanitizer {
    if (!this.instance) {
      // Fallback/No-op sanitizer if none is provided to avoid crashing, 
      // but ideally we should throw or log in a production environment.
      return {
        sanitize: (html: string) => html
      };
    }
    return this.instance;
  }
}
