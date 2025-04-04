/**
 * Creates a warning or error function that can be called multiple times.
 * The function will only output the message once, even on subsequent calls.
 *
 * @param {string | string[]} message - The message to display. Can be a single string or an array of strings.
 * @param {'warning' | 'error'} gravity - The severity of the warning. Defaults to 'warning'.
 * @returns {() => void} A function that displays the message.
 */
export const buildWarning = (
  message: string | string[],
  gravity: 'warning' | 'error' = 'warning',
) => {
  let alreadyWarned = false;

  /**
   * Cleans the message by joining an array of strings into a single string, separated by newline characters.
   *
   * @type {string}
   */
  const cleanMessage = Array.isArray(message) ? message.join('\n') : message;

  return () => {
    if (!alreadyWarned) {
      alreadyWarned = true;
      /**
       * If the gravity is set to 'error', logs the message using console.error.
       * Otherwise, logs the message using console.warn.
       */
      if (gravity === 'error') {
        console.error(cleanMessage);
      } else {
        console.warn(cleanMessage);
      }
    }
  };
};