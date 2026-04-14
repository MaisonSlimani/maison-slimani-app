import DOMPurify from 'isomorphic-dompurify';
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
    return DOMPurify.sanitize(html, DomPurifySanitizer.DEFAULT_CONFIG);
  }
}
