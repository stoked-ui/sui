/**
 * Import necessary functions and classes for theme management.
 */
import {useThemeProps} from '@mui/material/styles';
import {styled} from '@mui/material/styles';

/**
 * Function to create a new hook for theme props management.
 *
 * @param name - The name of the hook.
 * @returns The created hook function.
 */
export function createUseThemeProps(name: string) {
  /**
   * Use the existing `useThemeProps` hook and return it.
   *
   * This is done to maintain backwards compatibility and allow for future changes in the original hook.
   *
   * @see useThemeProps
   */
  return useThemeProps;
}