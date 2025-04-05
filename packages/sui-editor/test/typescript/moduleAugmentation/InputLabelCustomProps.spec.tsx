/**
 * Extends the InputLabel component from Material-UI to include a custom size option.
 */
declare module '@mui/material/InputLabel' {
  interface InputLabelPropsSizeOverrides {
    customSize: true;
  }
}

/**
 * Renders an InputLabel component with a custom size option.
 * @param {InputLabelPropsSizeOverrides} props - The props for the InputLabel component.
 * @returns {JSX.Element} InputLabel component with custom size option.
 * @example
 * <CustomLabel size="customSize" />
 */
<InputLabel size="customSize" />;

// @ts-expect-error unknown size
<InputLabel size="foo" />;
