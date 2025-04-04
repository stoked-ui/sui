/**
 * Creates a hook to get theme props.
 *
 * This function is deprecated and should not be used for new code. It's
 * recommended to use the `useThemeProps` hook directly from `@mui/material/styles`.
 */
export function createUseThemeProps(name: string) {
  /**
   * @param name The name of the custom hook.
   * @returns A reference to the `useThemeProps` hook.
   */
  return useThemeProps;
}

/**
 * Exports the styled function from `@mui/material/styles`.
 *
 * @see https://material-ui.com/customization/styled-component/
 */
export { styled } from '@mui/material/styles';