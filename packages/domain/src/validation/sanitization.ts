import { z } from 'zod';
import { SanitizerProvider } from '../interfaces/IHtmlSanitizer';

/**
 * Sanitizes an HTML string using the injected sanitizer implementation.
 * Decoupled from DOMPurify.
 */
export function sanitizeHtmlText(html: string): string {
  if (!html) return '';
  return SanitizerProvider.get().sanitize(html);
}

/**
 * A reusable Zod transformer that strips dangerous HTML attributes and script tags.
 */
export const htmlSanitizedString = z.string().transform((val) => sanitizeHtmlText(val));

/**
 * Validatable schema for Admin Product inserts.
 */
export const adminProductInsertSchema = z.object({
  name: z.string().min(1),
  // Description may contain rich HTML from the admin wysiwyg editor
  description: htmlSanitizedString,
  price: z.number().nonnegative(),
  category: z.string().nullable(),
  isFeatured: z.boolean().default(false),
});
