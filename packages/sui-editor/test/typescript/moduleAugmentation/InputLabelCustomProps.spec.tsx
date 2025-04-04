/**
 * Module imports.
 */
import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';

/**
 * Interface declaration for MUI Input Label Props Size Overrides.
 *
 * This interface extends the existing InputLabelProps and adds a new property,
 * customSize, which overrides the size of the input label.
 */
declare module '@mui/material/InputLabel' {
  /**
   * Props overrides for InputLabel component.
   */
  interface InputLabelPropsSizeOverrides {
    /**
     * Custom size override for the input label.
     *
     * This prop can be used to customize the size of the input label,
     * allowing for more flexible layout options in your application.
     */
    customSize: boolean;
  }
}

/**
 * Renders an Input Label component with a custom size.
 *
 * @see InputLabelPropsSizeOverrides
 */
<InputLabel size="customSize" />;

/**
 * Throws an error when the size prop is set to "foo", which is not a valid size.
 */
// @ts-expect-error unknown size
<InputLabel size="foo" />;
});