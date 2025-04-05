/**
 * @typedef {object} CSSPropertiesFormFieldProps
 * @property {Path<T>} name - The name/path for the field value
 * @property {string} label - The label for the field
 * @property {Control<T>} control - The react-hook-form control object
 * @property {React.CSSProperties} [defaultValue] - The default CSSProperties value
 * @property {TextFieldProps} textFieldProps - Additional TextField props
 */

/**
 * A controlled input field for CSSProperties values.
 * @param {CSSPropertiesFormFieldProps<T>} props - The component props
 * @returns {JSX.Element} A TextField component for CSSProperties input
 * @example
 * <ControlledCss
 *   name="example"
 *   label="Example"
 *   control={control}
 *   defaultValue={{}}
 *   className="custom-class"
 *   // additional TextField props
 *   multiline
 *   fullWidth
 * />
 */
function ControlledCss <T extends FieldValues>({
                                                         name,
                                                         label,
                                                         control,
                                                         defaultValue = {},
                                                 className,
                                                 ...textFieldProps
                                                       }: CSSPropertiesFormFieldProps<T>) {
  /**
   * Handles the change event for the input field.
   * Parses the input as JSON for valid CSSProperties structure.
   * @param {React.ChangeEvent<HTMLInputElement>} event - The change event object
   */
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;

    try {
      const parsedValue = JSON.parse(inputValue);
      if (typeof parsedValue === 'object' && parsedValue !== null) {
        onChange(inputValue);
      }
    } catch (e) {
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
