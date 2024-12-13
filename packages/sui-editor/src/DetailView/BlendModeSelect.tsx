import * as React from "react";
import Select from "@mui/material/Select";
import {FormControl, SxProps} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import {useController} from "react-hook-form";
import {formatTitle} from "./Detail";
import ControlledSelect from "./ControlledSelect";

export default function BlendModeSelect({control, disabled, onClick, rules = undefined }) {
  return <ControlledSelect
    className={'whitespace-nowrap flex-grow flex'}
    control={control}
    label={'Blend Mode'}
    name={'blendMode'}
    disabled={disabled}
    onClick={onClick}
    options={[
      'normal',
      'multiply',
      'screen',
      'overlay',
      'darken',
      'lighten',
      'color-dodge',
      'color-burn',
      'hard-light',
      'soft-light',
      'difference',
      'exclusion',
      'hue',
      'saturation',
      'color',
      'luminosity',
      'plus-darker',
      'plus-lighter',
    ].map((option) => { return { value: option, label: formatTitle(option) }})}
    rules={{ required: "This field is required" }}
  />
}
