/**
 * Returns the active element from a given document or shadow root.
 *
 * @param {Document | ShadowRoot} [root=document] The document or shadow root to search for an active element. Defaults to the current document.
 * @returns {Element | null} The active element if found, otherwise null.
 */
export const getActiveElement = (root: Document | ShadowRoot = document): Element | null => {
  const activeEl = root.activeElement;

  if (!activeEl) {
    return null;
  }

  if (activeEl.shadowRoot) {
    return getActiveElement(activeEl.shadowRoot);
  }

  return activeEl;
};

/**
 * Escapes a string for use as an attribute value.
 *
 * @param {string} operand The input string to escape.
 * @returns {string} The escaped string.
 */
export function escapeOperandAttributeSelector(operand: string): string {
  return operand.replace(/["\\]/g, '\\$&');
}