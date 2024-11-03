
import * as React from 'react';
import { useController } from "react-hook-form";
import TextField from "@mui/material/TextField";
import {Checkbox, FormControlLabel, Tooltip} from "@mui/material";
import { namedId } from '@stoked-ui/media-selector';
import OutlinedStyle from "./OutlinedStyle";

const OutlinedCheckbox = OutlinedStyle(Checkbox);

export default function ControlledCheckbox({ control, name, label, disabled, className, rules, onClickLabel, onFocus, onBlur, multiline, rows, onClick, format, type }: any) {

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
      <FormControlLabel
        onClick={onClickLabel}
        control={
          <OutlinedCheckbox
            {...field}
            id={namedId(field.name)}
            defaultChecked={field.value}
            inputRef={field.ref}
            variant={'outlined'}
            disabled={disabled}
            className={className}
            onClick={onClick}
            error={!!error}
          />
        }
        label={label}
      />
    </Tooltip>
  );
}
