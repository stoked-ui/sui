
import * as React from 'react';
import { useController } from "react-hook-form";
import TextField from "@mui/material/TextField";
import {Tooltip} from "@mui/material";
import { namedId } from '@stoked-ui/media-selector';
import OutlinedStyle from "./OutlinedStyle";

const TextFieldStyle = OutlinedStyle(TextField);

export default function ControlledText({ control, name, label, disabled, className, rules, onFocus, onBlur, multiline, rows, onClick, format, type }: any) {

  if (!rules) {
    rules = {
      required: true
    };
  }

  if (!name && label) {
    name = label.split(' ').map((optionNamePart: string) => {
      return optionNamePart.charAt(0).toLowerCase() + optionNamePart.slice(1)
    }).join('.')
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

  if (!type) {
    type = 'text';
  }
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
        id={namedId(field.name)}
        onClick={onClick}
        value={format ? format(field.value) : field.value} // input value
        inputRef={field.ref}
        multiline={multiline}
        rows={rows}
        label={label}
        fullWidth
        type={type}
        variant={'outlined'}
        disabled={disabled}
        className={className}
        error={!!error}
      />
    </Tooltip>
  );
}
