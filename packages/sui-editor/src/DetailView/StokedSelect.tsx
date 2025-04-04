import * as React from "react";
import Box from "@mui/material/Box";
import {
  FormControlPropsSizeOverrides,
  InputLabelPropsSizeOverrides,
  Tooltip
} from "@mui/material";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";
import { SxProps, } from "@mui/system";
import { OverridableStringUnion } from '@mui/types';
import OutlinedStyle from "./OutlinedStyle";

/**
 * A custom Select component with additional functionality and accessibility features.
 *
 * @interface StokedSelectProps
 */
export interface StokedSelectProps {
  /**
   * The name of the select field, used for form submission or other purposes.
   */
  name?: string,
  /**
   * The unique key of the select field, used for accessibility purposes.
   */
  key?: string,
  /**
   * The current value of the select field, can be an array if multiple selection is enabled.
   */
  value?: any,
  /**
   * The width of the select field, in pixels.
   */
  width?: number,
  /**
   * Custom styles for the select component, using MUI's SxProps type.
   */
  sx?: SxProps,
  /**
   * The size of the select field, either 'small' or 'medium'.
   */
  size?: OverridableStringUnion<"small" | "medium", FormControlPropsSizeOverrides>,
  /**
   * The placeholder text to display in the select field when no value is selected.
   */
  placeholder?: string,
  /**
   * The label text to display above the select field, optional.
   */
  label?: string,
  /**
   * An error message to display below the select field if there's an issue with the input.
   */
  error?: Error,
  /**
   * Whether multiple values can be selected in this select field.
   */
  multiple?: boolean,
  /**
   * Whether the select field is disabled, preventing user interaction.
   */
  disabled?: boolean,
  /**
   * An array of options to display in the select field, each with a value and label.
   */
  options?: { value: any, label: string }[],
  /**
   * A callback function to call when the user selects a new value from the list.
   */
  onChange: (event: SelectChangeEvent, child?: object) => void,
  /**
   * A callback function to call when the user clicks outside the select field or on a specific element.
   */
  onClick: (event: MouseEvent) => void,
}

/**
 * The StokedSelect component, which wraps a standard MUI Select with additional functionality and accessibility features.
 *
 * @param {StokedSelectProps} inProps - The props passed to the component.
 * @returns {JSX.Element}
 */
export default function StokedSelect(inProps: StokedSelectProps) {
  const { name, width, sx, size, placeholder, label, error, multiple, disabled, options, onChange, onClick} = inProps;
  const inputSize: OverridableStringUnion<"small" | "normal", InputLabelPropsSizeOverrides> | undefined = size === 'medium' ? 'normal' : size;

  return <Box sx={[{ minWidth: width !== undefined ? `${width}px` : `${120}px` }, ...(Array.isArray(sx) ? sx : [sx]),]}>
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
        {(label || placeholder) && <InputLabel id="label-id" size={inputSize}>{placeholder || label}</InputLabel>}
        <DesSelectType
          name={name}
          multiple={multiple}
          labelId="label-id"
          label={label}
          onClick={onClick}
          disabled={disabled}
          onChange={(event: SelectChangeEvent, child?: object) => {
            onChange(event, child);
          }}
        >
          {options && options?.map((option, index) => {
            return <MenuItem key={index} value={option.value}>{option.label}</MenuItem>
          })}
        </DesSelectType>
        <FormHelperText/>
      </FormControl>
    </Tooltip>
  </Box>
}