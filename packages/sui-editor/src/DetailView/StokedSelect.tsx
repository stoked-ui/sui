import * as React from "react";
import Box from "@mui/material/Box";
import {FormControlPropsSizeOverrides, InputLabelPropsSizeOverrides, Tooltip} from "@mui/material";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, {SelectChangeEvent} from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";
import {SxProps, } from "@mui/system";
import { OverridableStringUnion } from '@mui/types';
import OutlinedStyle from "./OutlinedStyle";

const DesSelectType = OutlinedStyle(Select);

export interface StokedSelectProps {
  name?: string,
  key?: string,
  value?: any,
  width?: number,
  sx?: SxProps,
  size?: OverridableStringUnion<"small" | "medium", FormControlPropsSizeOverrides>,
  placeholder?: string,
  label?: string,
  error?: Error,
  multiple?: boolean,
  disabled?: boolean,
  options?: { value: any, label: string }[],
  onChange: (event: SelectChangeEvent, child?: object) => void,
  onClick: (event: MouseEvent) => void,
}

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
            console.log('option', option);
            return <MenuItem key={index} value={option.value}>{option.label}</MenuItem>
          })}
        </DesSelectType>
        <FormHelperText/>
      </FormControl>
    </Tooltip>
  </Box>
}
