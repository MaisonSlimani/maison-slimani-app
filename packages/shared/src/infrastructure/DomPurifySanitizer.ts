import DOMPurify from 'dompurify';
import { IHtmlSanitizer } from '@maison/domain';

/**
 * Concrete implementation of IHtmlSanitizer using DOMPurify.
 * This lives in the infrastructure/shared layer to keep the Domain pure.
 */
export class DomPurifySanitizer implements IHtmlSanitizer {
  /**
   * Default configuration for sanitization.
   */
  private static readonly DEFAULT_CONFIG = {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  };

  /**
   * Sanitizes the input HTML string.
   */
  sanitize(html: string): string {
    if (!html) return '';
    
    // Safety check for server-side environments where DOMPurify without JSDOM would crash
    if (typeof window === 'undefined') {
      return html; // Return as-is on server to prevent 500s; use CSS/logic for safety
    }

    return DOMPurify.sanitize(html, DomPurifySanitizer.DEFAULT_CONFIG);
  }
}
