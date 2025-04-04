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

/**
 * A customizable dropdown select component.
 *
 * @param {Object} props
 * @param {Boolean} props.multiple Whether the dropdown can be used with multiple selection.
 * @param {React.FormEvent<HTMLElement>} props.control The React Hook Form control instance.
 * @param {String} props.name The name of the form field.
 * @param {Boolean} props.disabled Whether the dropdown is disabled.
 * @param {String|Object} props.label The label for the dropdown.
 * @param {Array<Object>} props.options The options to display in the dropdown.
 * @param {Number} props.width The minimum width of the dropdown component.
 * @param {String} props.key The key to use when generating unique keys for options.
 * @param {String} props.value The value to use as a default option.
 * @param {Function|String} props.format A function or string used to format the option text.
 * @param {Function} props.onClick The click event handler for the dropdown.
 * @param {Function} props.onChange The change event handler for the dropdown.
 * @param {String} props.size The size of the dropdown component.
 * @param {Object} props.sx Additional styles to apply to the dropdown component.
 */
function DesSelect({ multiple, control, name, disabled, label, options, width, key, value, format, onClick, onChange, size, placeholder, sx}: any) {
  /**
   * Generate a default name for the form field based on the label if no explicit name is provided.
   */
  if (!name && label) {
    name = label.split(' ').map((optionNamePart: string) => {
      return optionNamePart.charAt(0).toLowerCase() + optionNamePart.slice(1)
    }).join('.')
  }

  /**
   * Get the form field instance from the React Hook Form control.
   */
  const {
    field,
    fieldState: { invalid, isTouched, isDirty, error },
    formState: { touchedFields, dirtyFields }
  } = useController({
    name,
    control
  });

  /**
   * Set default width and size for the dropdown component if not explicitly provided.
   */
  if (!width) {
    width = 120;
  }

  if (!size) {
    size = 'medium';
  }

  /**
   * Check if the field value is not empty but does not match any option in the dropdown.
   * If so, generate a new options array by mapping over the field value and creating new options with unique keys.
   */
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

  /**
   * Render the dropdown component.
   */
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