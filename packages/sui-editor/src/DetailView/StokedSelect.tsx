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
import { SxProps } from "@mui/system";
import { OverridableStringUnion } from '@mui/types';
import OutlinedStyle from "./OutlinedStyle";

/**
 * @typedef {import("@mui/material/Select").SelectProps} DesSelectTypeProps
 */

const DesSelectType = OutlinedStyle(Select);

/**
 * @typedef {Object} StokedSelectProps
 * @property {string} [name] - The name attribute of the select element.
 * @property {string} [key] - The key attribute for React elements.
 * @property {any} [value] - The value of the select element.
 * @property {number} [width] - The width of the select element.
 * @property {SxProps} [sx] - The style object for the select element.
 * @property {OverridableStringUnion<"small" | "medium", FormControlPropsSizeOverrides>} [size] - The size of the select element.
 * @property {string} [placeholder] - The placeholder text for the select element.
 * @property {string} [label] - The label text for the select element.
 * @property {Error} [error] - The error object for displaying errors.
 * @property {boolean} [multiple] - Whether multiple options can be selected.
 * @property {boolean} [disabled] - Whether the select element is disabled.
 * @property {{ value: any, label: string }[]} [options] - The array of options for the select element.
 * @property {(event: SelectChangeEvent, child?: object) => void} onChange - The function to handle onChange event.
 * @property {(event: MouseEvent) => void} onClick - The function to handle onClick event.
 */

/**
 * StokedSelect component displays a custom select element.
 * @param {StokedSelectProps} inProps - The props for the StokedSelect component.
 * @returns {JSX.Element}
 */
export default function StokedSelect(inProps) {
  const { name, width, sx, size, placeholder, label, error, multiple, disabled, options, onChange, onClick } = inProps;
  const inputSize = size === 'medium' ? 'normal' : size;

  return (
    <Box sx={[{ minWidth: width !== undefined ? `${width}px` : `${120}px` }, ...(Array.isArray(sx) ? sx : [sx])]}>
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
            onChange={(event, child) => {
              onChange(event, child);
            }}
          >
            {options && options?.map((option, index) => {
              return <MenuItem key={index} value={option.value}>{option.label}</MenuItem>;
            })}
          </DesSelectType>
          <FormHelperText />
        </FormControl>
      </Tooltip>
    </Box>
  );
}