/**
 * Finds the active element in a given root.
 *
 * @param {Document|ShadowRoot} [root=document] The root to search for the active element. Defaults to the global document if not provided.
 * @returns {Element|null} The active element or null if none is found.
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
 * Escapes special characters in a given operand for use in an attribute selector.
 *
 * @param {string} operand The operand to escape.
 * @returns {string} The escaped operand.
 */
export function escapeOperandAttributeSelector(operand: string): string {
  return operand.replace(/["\\]/g, '\\$&');
}