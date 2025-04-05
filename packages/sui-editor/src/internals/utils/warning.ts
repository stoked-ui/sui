/**
 * Function to build a warning message and return a function to trigger the warning
 * @param {string | string[]} message - The warning message to display
 * @param {'warning' | 'error'} gravity - The severity of the warning (default: 'warning')
 * @returns {Function} A function that triggers the warning message
 */
export const buildWarning = (
  message: string | string[],
  gravity: 'warning' | 'error' = 'warning',
) => {
  let alreadyWarned = false;

  const cleanMessage = Array.isArray(message) ? message.join('\n') : message;

  return () => {
    if (!alreadyWarned) {
      alreadyWarned = true;
      if (gravity === 'error') {
        console.error(cleanMessage);
      } else {
        console.warn(cleanMessage);
      }
    }
  };
};