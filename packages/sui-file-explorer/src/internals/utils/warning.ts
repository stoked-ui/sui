/**
 * Function to build a warning message and handle its display based on gravity
 * @param {string | string[]} message - The warning message to display
 * @param {'warning' | 'error'} gravity - The severity level of the warning (default: 'warning')
 * @returns {Function} - A function that displays the warning message
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