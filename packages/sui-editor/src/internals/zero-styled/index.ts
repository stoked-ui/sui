/**
 * Function that creates a custom hook for accessing theme props in Material-UI
 * @param {string} name - The name of the custom hook
 * @returns {Function} - The custom hook function
 */
export function createUseThemeProps(name: string) {
  return useThemeProps;
}