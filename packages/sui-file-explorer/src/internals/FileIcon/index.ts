/**
 * Exports all components and functions from the current file.
 */
export * from './FileIcon';

/**
 * Exports types for use in other files.
 *
 * @typedef {Object} FileIconProps
 *   Properties:
 *     - `icon`: The icon to display (required)
 *     - `size`: The size of the icon (optional, default: 24)
 *     - `color`: The color of the icon (optional, default: '#000')
 *
 * @typedef {Object} FileIconSlots
 *   Properties:
 *     - `defaultIcon`: The default icon to display
 *     - `icon1`: An alternative icon to display on hover
 *     - `icon2`: Another alternative icon to display on hover
 *
 * @typedef {Object} FileIconSlotProps
 *   Properties:
 *     - `slot`: The slot to use (required)
 *     - `iconSize`: The size of the icon in the slot (optional, default: 24)
 */

export type {
  FileIconProps,
  FileIconSlots,
  FileIconSlotProps,
} from './FileIcon.types';