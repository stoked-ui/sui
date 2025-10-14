/**
 * Retrieves the currently active element within a given Document or ShadowRoot.
 * If the active element is within a ShadowRoot, recursively searches for the active element within that ShadowRoot.
 * @param {Document | ShadowRoot} root - The root Document or ShadowRoot to search for the active element.
 * @returns {Element | null} The active Element, or null if no active element is found.
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
 * Replaces characters in a string that have special meaning in CSS attribute selectors with their escaped counterparts.
 * This function is intended to be temporary until CSS.escape becomes available in jsdom.
 * @param {string} operand - The string to escape for use as a CSS attribute selector operand.
 * @returns {string} The escaped string suitable for use in a CSS attribute selector.
 */
export function escapeOperandAttributeSelector(operand: string): string {
  return operand.replace(/["\\]/g, '\\$&');
}
