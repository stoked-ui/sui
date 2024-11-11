import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormHelperText from "@mui/material/FormHelperText";
import { Tooltip } from "@mui/material";
import { useController } from "react-hook-form";
import OutlinedStyle from "./OutlinedStyle";

const DesSelectType = OutlinedStyle(Select);
function DesSelect({ multiple, control, name, disabled, label, options, width, key, value, format, onClick, onChange, size, placeholder, sx}: any) {
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
    control
  });

  if (!width) {
    width = 120;
  }

  if (!size) {
    size = 'medium';
  }

  if (field.value !== '' && !options?.includes(field.value)) {
    if (!options) {
      if (Array.isArray(field.value)) {
        options = field.value.map((opt) => {
          return {
            key: key ? opt[key] : opt,
            value: value ? opt[value] : opt,
            text: format ? format(opt) : opt
          }
        });
      }
    }
  }

  return (
    <Box sx={[{ minWidth: width }, ...(Array.isArray(sx) ? sx : [sx]),]}>
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
        <FormControl className="flex w-full" variant="outlined" size={size}>
          {(label || placeholder) && <InputLabel id="label-id" size={size}>{placeholder || label}</InputLabel>}
          <DesSelectType
            multiple={multiple}
            labelId="label-id"
            label={label}
            onClick={onClick}
            inputRef={field.ref} // send input ref, so we can focus on input when error appear
            disabled={disabled}
            {...field}
            onChange={(event: SelectChangeEvent, child?: object) => {
              onChange(event, field.onChange, child);
            }}
          >
            {options && options.map((option, index) => {
              return <MenuItem key={index} value={option.value}>{option.label}</MenuItem>
            })}
          </DesSelectType>
          <FormHelperText/>
        </FormControl>
      </Tooltip>
    </Box>
  );
}
DesSelect.muiSkipListHighlight = false;
export default DesSelect;
