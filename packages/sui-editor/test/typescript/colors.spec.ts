/**
 * Defines a list of Material-UI colors for easy access.
 */
import { colors, Color } from '@mui/material';

/**
 * Individual Material-UI colors for easy reference.
 */
const {
  amber,
  blue,
  blueGrey,
  brown,
  cyan,
  deepOrange,
  deepPurple,
  green,
  grey,
  indigo,
  lightBlue,
  lightGreen,
  lime,
  orange,
  pink,
  purple,
  red,
  teal,
  yellow,
  common,
} = colors;

/**
 * List of Material-UI colors.
 */
const colorList: Color[] = [
  amber,
  blue,
  blueGrey,
  brown,
  cyan,
  deepOrange,
  deepPurple,
  green,
  grey,
  indigo,
  lightBlue,
  lightGreen,
  lime,
  orange,
  pink,
  purple,
  red,
  teal,
  yellow,
];

/**
 * Common colors: black and white.
 */
const { black, white } = common;

/**
 * Iterates over the list of common colors.
 * @param {string} color - The current color being iterated over.
 * @returns {string} The current color.
 */
[black, white].forEach((color: string) => color);
