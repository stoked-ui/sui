/**
 * Function to get the active element within a given document or shadow root.
 * @param {Document | ShadowRoot} root - The document or shadow root to search within. Defaults to the document.
 * @returns {Element | null} The active element within the provided root, or null if not found.
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
 * Function to escape special characters in an operand used in attribute selectors.
 * @param {string} operand - The operand to escape special characters in.
 * @returns {string} The escaped operand string.
 */
export function escapeOperandAttributeSelector(operand: string): string {
  return operand.replace(/["\\]/g, '\\$&');
}