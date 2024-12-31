import * as React from 'react';
import { useController } from "react-hook-form";
import TextField from "@mui/material/TextField";
import { Tooltip } from "@mui/material";
import { namedId} from '@stoked-ui/common';
import OutlinedStyle from "./OutlinedStyle";

const TextFieldStyle = OutlinedStyle(TextField);

export default function ControlledColor({ darkLabel, lightLabel, control, name, label, disabled, className, rules, onFocus, onBlur, multiline, rows, onClick, format, type }: any) {

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
  const labelColor = (theme) => theme.palette.mode === 'dark' ? darkLabel : lightLabel;
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
        onClick={(ev) => {
          onClick?.(ev);
        }}
        inputRef={field.ref}
        multiline={multiline}
        rows={rows}
        label={label}
        fullWidth
        type={'color'}
        variant={'outlined'}
        disabled={disabled}
        className={className}
        error={!!error}
        sx={(theme) => ({
          '& input': {blockSize: '56px', padding: 0},
          '& fieldset': {
            color: theme.palette.text.primary,
            padding: '3px 8px',
            borderRadius: '4px',
            outlineOffset: 0,

            // backgroundImage: `linear-gradient(90deg, ${theme.palette.background.default},
            // ${theme.palette.background.default}), linear-gradient(90deg, ${theme.palette.background.default}, ${theme.palette.background.default})`,
            // backgroundSize: '100% 12px, 100% 17px',
            // backgroundPosition: '0 0, 0 100%',
            // backgroundRepeat: 'no-repeat, no-repeat'
          },
          '& label': {
            backgroundImage: `linear-gradient(90deg, ${labelColor(theme)}, ${labelColor(theme)}), linear-gradient(90deg, ${labelColor(theme)}, ${labelColor(theme)})`,
            backgroundSize: '100% 12px, 100% 17px',
            backgroundPosition: '0 0, 0 100%',
            backgroundRepeat: 'no-repeat, no-repeat',
            padding: '0px 6px',
            borderRadius: '4px',
            transform: 'translate(9px, -9px) scale(0.75)',
          },
          '& ::-webkit-color-swatch-wrapper': {
            padding: '0px',
            borderRadius: '6px'
          },
        })}
      />
    </Tooltip>
  );
}
