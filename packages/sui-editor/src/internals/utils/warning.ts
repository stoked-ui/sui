/**
 * A function that builds a warning message and returns a cleanup function.
 *
 * @param {string | string[]} message - The warning message to display. If an array, it will be joined with newline characters.
 * @param {'warning' | 'error'} gravity - The severity of the warning (default is 'warning').
 * @returns {() => void} A function that displays the warning and does not repeat if called multiple times.
 */
export const buildWarning = (
  message: string | string[],
  gravity: 'warning' | 'error' = 'warning',
) => {
  let alreadyWarned = false;

  /**
   * Cleans up the message by joining an array of strings into a single string with newline characters.
   *
   * @type {string}
   */
  const cleanMessage = Array.isArray(message) ? message.join('\n') : message;

  return () => {
    if (!alreadyWarned) {
      alreadyWarned = true;
      /**
       * Prints the warning message to the console based on the gravity level.
       *
       * @accessibility Note: This method does not handle any accessibility-related issues, such as providing a way for users to turn off warnings.
       */
      if (gravity === 'error') {
        console.error(cleanMessage);
      } else {
        console.warn(cleanMessage);
      }
    }
  };
};