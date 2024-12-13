import React from "react";
import { useController } from "react-hook-form";
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from "@mui/material";

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
