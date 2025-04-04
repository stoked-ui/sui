import React from "react";
import { useController } from "react-hook-form";
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from "@mui/material";

/**
 * A controlled select component that integrates with react-hook-form.
 *
 * This component is designed to be used as a form field, and provides real-time validation
 * and error handling for the selected option. It also supports custom rules and default values.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Controller} props.control - The control object from react-hook-form.
 * @param {string} props.name - The name of the form field.
 * @param {string} props.label - The label for the select field.
 * @param {Array} props.options - An array of objects containing the option value and label.
 * @param {string} [props.defaultValue] - The default selected value.
 * @param {Object} [props.rules] - Custom validation rules for the form field.
 * @param {Function} [props.onClick] - A callback function to be executed when an option is changed.
 * @param {boolean} [props.disabled=false] - Whether the select field should be disabled.
 * @param {string} [props.className=""] - The CSS class name for the form control.
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
    <FormControl
      fullWidth
      className={className}
      error={!!error}
      disabled={disabled}
    >
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