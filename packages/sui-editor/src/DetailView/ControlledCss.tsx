/**
 * @fileoverview React Hook Form controlled CSS form field component.
 * @description Provides a controlled text field for entering and editing CSS properties.
 *
 * @param {Object} props - Component props.
 * @param {string} props.name - Name of the form field.
 * @param {string} props.label - Label for the form field.
 * @param {Control<T>} props.control - React Hook Form control instance.
 * @param {React.CSSProperties | undefined} [props.defaultValue] - Default value of the form field.
 * @param {string | undefined} [props.className] - Custom CSS class name.
 *
 * @returns {JSX.Element} Controlled text field component.
 */

import { Control, FieldValues, Path, PathValue, useController } from 'react-hook-form';
import { TextField, TextFieldProps } from '@mui/material';

type CSSPropertiesFormFieldProps<T extends FieldValues> = {
  /**
   * Name of the form field.
   */
  name: Path<T>;
  /**
   * Label for the form field.
   */
  label: string;
  /**
   * React Hook Form control instance.
   */
  control: Control<T>;
  /**
   * Default value of the form field (optional).
   */
  defaultValue?: React.CSSProperties;
} & Omit<TextFieldProps, 'name' | 'label' | 'defaultValue' | 'onChange'>;

function ControlledCss<CSSPropertiesFormFieldProps<T extends FieldValues>>({
  name,
  label,
  control,
  defaultValue = {},
  className,
  ...textFieldProps
}: CSSPropertiesFormFieldProps<T>) {
  const {
    field: { onChange, onBlur, value },
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: JSON.stringify(defaultValue) as PathValue<T, Path<T>>,
  });

  /**
   * Handles form field change event.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event - Form field change event.
   */
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;

    try {
      // Parse the input as JSON for valid CSSProperties structure
      const parsedValue = JSON.parse(inputValue);
      if (typeof parsedValue === 'object' && parsedValue !== null) {
        onChange(inputValue); // Pass JSON string to `react-hook-form`
      }
    } catch (e) {
      // Ignore JSON parsing errors, keep existing value
      console.error("Invalid CSSProperties JSON format.");
    }
  };

  return (
    <TextField
      {...textFieldProps}
      label={label}
      value={value}
      onChange={handleChange}
      onBlur={onBlur}
      error={!!error}
      helperText={error ? error.message : 'Enter a valid CSSProperties object'}
      multiline
      className={className}
      fullWidth
    />
  );
};

export default ControlledCss;