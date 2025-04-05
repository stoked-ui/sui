/**
 * React component for a controlled select input field.
 * 
 * @param {object} props - The props object.
 * @property {object} control - The control object from react-hook-form.
 * @property {string} name - The name of the select input field.
 * @property {string} label - The label for the select input field.
 * @property {array} options - The array of options for the select input field.
 * @property {string} defaultValue - The default value for the select input field.
 * @property {object} rules - The validation rules for the select input field.
 * @property {function} onClick - The click event handler for the select input field.
 * @property {boolean} disabled - Indicates if the select input field is disabled.
 * @property {string} className - The CSS class name for styling purposes.
 * 
 * @returns {JSX.Element} The controlled select input field component.
 * 
 * @example
 * <ControlledSelect
 *   control={control}
 *   name="selectField"
 *   label="Select Field"
 *   options={[{ value: "1", label: "Option 1" }, { value: "2", label: "Option 2" }]}
 *   defaultValue=""
 *   rules={{ required: "This field is required" }}
 *   onClick={handleClick}
 *   disabled={false}
 *   className="select-field"
 * />
 */
export default function ControlledSelect({
  control,
  name,
  label,
  options,
  defaultValue = "",
  rules = { required: "This field is required" },
  onClick,
  disabled = false,
  className,
}: any) {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    rules,
    defaultValue,
  });

  return (
    <FormControl fullWidth className={className} error={!!error} disabled={disabled}>
      <InputLabel id={`${name}-label`}>{label}</InputLabel>
      <Select
        {...field}
        labelId={`${name}-label`}
        id={name}
        value={field.value || ""}
        label={label}
        onClick={onClick}
      >
        {options.map((option: any) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {error && <FormHelperText>{error.message}</FormHelperText>}
    </FormControl>
  );
}