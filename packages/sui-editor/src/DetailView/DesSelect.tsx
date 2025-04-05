/**
 * Custom select component with tooltip error display.
 *
 * @param {boolean} multiple - Indicates if multiple items can be selected.
 * @param {any} control - Control object from react-hook-form.
 * @param {string} name - Name of the select input.
 * @param {boolean} disabled - Indicates if the select input is disabled.
 * @param {string} label - Label for the select input.
 * @param {Array} options - Array of options for the select input.
 * @param {number} width - Width of the select input.
 * @param {string} key - Key property for options.
 * @param {string} value - Value property for options.
 * @param {Function} format - Format function for options.
 * @param {Function} onClick - Click event handler.
 * @param {Function} onChange - Change event handler.
 * @param {string} size - Size of the select input.
 * @param {string} placeholder - Placeholder text for the select input.
 * @param {any} sx - Additional styles for the select input.
 * 
 * @returns {JSX.Element} JSX element representing the custom select component.
 *
 * @example
 * <DesSelect
 *   multiple={true}
 *   control={control}
 *   name="selectInput"
 *   disabled={false}
 *   label="Select an option"
 *   options={[{ key: 1, value: 'value1', label: 'Option 1' }]}
 *   width={200}
 *   key="key"
 *   value="value"
 *   format={(opt) => opt.label.toUpperCase()}
 *   onClick={handleClick}
 *   onChange={handleChange}
 *   size="small"
 *   placeholder="Select"
 *   sx={{ marginTop: 10 }}
 * />
 *
 * @fires DesSelect#onChange
 * @see Tooltip
 * @see OutlinedStyle
 */
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
 * HOC function to apply outlined style to Select component.
 */
const DesSelectType = OutlinedStyle(Select);

/**
 * Custom select component with error tooltip.
 * 
 * @param {Object} props - Component props.
 */
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
            label: format ? format(opt) : opt
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