import * as React from 'react';
import TextField from "@mui/material/TextField";
import { Tooltip } from "@mui/material";
import { useController } from "react-hook-form";
import OutlinedStyle from "./OutlinedStyle";

/**
 * Component for rendering a text field with error tooltip.
 * @param {Object} props - The component props.
 * @param {string} props.className - The class name for styling.
 * @param {any} props.control - The control object from react-hook-form.
 * @param {string} props.name - The name of the field.
 * @param {string} props.label - The label for the text field.
 * @param {boolean} props.disabled - Indicates if the field is disabled.
 * @returns {JSX.Element} React component.
 */
export default function Description({ className, control, name, label, disabled }: any) {

  const {
    field,
    fieldState: {  error },
    formState: { touchedFields, dirtyFields }
  } = useController({
    name,
    control,
    rules: { required: true },
  });

  return (
    <Tooltip
      PopperProps={{
        disablePortal: true,
      }}
      open={!!error}
      className={'tooltip-error'}
      disableFocusListener
      disableHoverListener
      disableTouchListener
      title={error?.message}
    >
      <TextFieldStyle
        {...field}
        multiline
        className={className}
        rows={4}
        label={label}
        sx={{
          '& fieldset': {
            display: disabled ? 'none' : ''
          }
        }}
        fullWidth
        variant={'outlined'}
        disabled={disabled}
      />
    </Tooltip>
  );
}