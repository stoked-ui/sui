import { colors, Color } from '@mui/material';

/**
 * Exports a list of predefined colors and shades.
 *
 * @example
 * const { amber, blue, lightBlue } = colors;
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
 * A list of predefined color options.
 *
 * @example
 * const colorList: Color[] = [...colors];
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
 * Exports common colors used throughout the theme.
 *
 * @example
 * const { black, white } = common;
 */
const { black, white } = common;

[black, white].forEach((color: string) => color);