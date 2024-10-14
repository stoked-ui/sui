
import * as React from 'react';
import {Controller, useController} from "react-hook-form";
import TextField from "@mui/material/TextField";
import {Tooltip} from "@mui/material";
import OutlinedStyle from "./OutlinedStyle";



const TextFieldStyle = OutlinedStyle(TextField);

export default function ControlledText({ control, name, label, disabled, className, rules, onFocus, onBlur, multiline, rows }: any) {

  if (!rules) {
    rules = {
      required: true
    };
  }

  if (!name && label) {
    let optionName = label.replace(/ /g, '');
    name = optionName.charAt(0).toLowerCase() + optionName.slice(1);
  }

  const {
    field,
    fieldState: { invalid, isTouched, isDirty, error },
    formState: { touchedFields, dirtyFields }
  } = useController({
    name,
    control,
    rules
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
        onChange={field.onChange} // send value to hook form
        onBlur={onBlur || field.onBlur} // notify when input is touched/blur
        onFocus={onFocus}
        value={field.value} // input value
        name={field.name} // send down the input name
        inputRef={field.ref}
        multiline={multiline}
        rows={rows}
        label={label}
        fullWidth={true}
        variant={'outlined'}
        disabled={disabled}
        className={className}
        error={!!error}
      />
    </Tooltip>
  );
}
