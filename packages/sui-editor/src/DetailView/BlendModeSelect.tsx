import * as React from "react";
import {formatTitle} from "./Detail";
import ControlledSelect from "./ControlledSelect";

export default function BlendModeSelect({control, disabled, onClick, rules = undefined }: { control: any, disabled: any, onClick: any, rules?: any }) {
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
