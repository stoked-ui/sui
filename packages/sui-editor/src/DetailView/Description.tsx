import * as React from 'react';
import TextField from "@mui/material/TextField";
import {Tooltip} from "@mui/material";
import {useController} from "react-hook-form";
import OutlinedStyle from "./OutlinedStyle";


const TextFieldStyle = OutlinedStyle(TextField);

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
  console.log('touchedFields', touchedFields);
  console.log('dirtyFields', dirtyFields);

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
