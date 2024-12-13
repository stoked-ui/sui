import * as React from 'react';
import { useController } from "react-hook-form";
import TextField from "@mui/material/TextField";
import { Tooltip } from "@mui/material";
import { namedId} from '@stoked-ui/common';
import { ErrorMessage } from '@hookform/error-message';

// const TextFieldStyle = OutlinedStyle(TextField);

export default function ControlledText({ ref, prefix, value, control, name, label, disabled, className, rules, onFocus, onBlur, multiline, rows, onClick, format, type, errors }: any) {

  if (!rules) {
    rules = {
      required: true
    };
  }

  if (!name && label) {
    name = label.split(' ').map((optionNamePart: string) => {
      return `${optionNamePart.charAt(0).toLowerCase()}${optionNamePart.slice(1)}`
    }).join('.')
  }

  if (prefix) {
    name = `${prefix}.${name}`;
  }

  /*
  if (disabled && value) {
    return <TextFieldStyle
      id={name}
      onClick={onClick}
      value={format ? format(value) : value} // input value
      inputRef={ref}
      multiline={multiline}
      rows={rows}
      label={label}
      fullWidth
      type={type}
      variant={'outlined'}
      disabled={disabled}
      className={className}
    />
  } */

  const {
    field,
    fieldState: { invalid, isTouched, isDirty, error },
    formState: { touchedFields, dirtyFields }
  } = useController({
    name,
    control,
    rules,
  });

  if (!type) {
    type = 'text';
  }
  return (
    <React.Fragment>

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

        <TextField
          {...field}
          sx={{ whiteSpace: 'nowrap', flexGrow: 1, display: 'flex', width: '100%'}}
          disabled={disabled}
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
          className={className}
          error={!!error}
        />
      </Tooltip>
    </React.Fragment>
  );
}

export function UncontrolledText(props: any) {
  const { label, onClick, format, value, multiline, control, ref, rows, type, className, disabled } = props;
  let { name } = props;
  if (!name && label) {
    name = label.split(' ').map((optionNamePart: string) => {
      return optionNamePart.charAt(0).toLowerCase() + optionNamePart.slice(1)
    }).join('.')
  }

    return <TextField
      id={name}
      onClick={onClick}
      value={format ? format(value) : value} // input value
      inputRef={ref}
      multiline={multiline}
      rows={rows}
      label={label}
      fullWidth
      type={type}
      variant={'outlined'}
      className={className}
      disabled={disabled}
    />
}
