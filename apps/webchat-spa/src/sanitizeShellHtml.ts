import DOMPurify from 'dompurify';

const MISSING_TEMPLATE_FALLBACK = '<p>Missing full-page template.</p>';
const ALLOWED_TAGS = ['div', 'span', 'p', 'a', 'ul', 'li', 'strong', 'em', 'br'];
const ALLOWED_ATTR = ['href', 'title', 'target', 'rel'];
const ALLOWED_URI_REGEXP = /^(?:(?:https?|mailto|tel):|\/|\.{1,2}\/)/i;

function escapeUserText(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Sanitizes server-controlled shell HTML. If you need to include user-provided
 * fragments, escape them with escapeUserText before composing the HTML.
 */
export function sanitizeShellHtml(html: string | undefined): string {
  const source = typeof html === 'string' && html.trim() ? html : MISSING_TEMPLATE_FALLBACK;
  const clean = DOMPurify.sanitize(source, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP
  });
  return clean || MISSING_TEMPLATE_FALLBACK;
}

export { escapeUserText };
