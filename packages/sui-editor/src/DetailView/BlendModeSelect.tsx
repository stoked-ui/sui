/**
 * React component for selecting blend modes.
 * 
 * @param {object} props - The props object.
 * @param {any} props.control - The control object for form control.
 * @param {boolean} props.disabled - Indicates if the select is disabled.
 * @param {function} props.onClick - The onClick function for the select.
 * @param {object} props.rules - The rules object for validation.
 * 
 * @returns {JSX.Element} React component for BlendModeSelect.
 * 
 * @example
 * <BlendModeSelect control={control} disabled={false} onClick={handleClick} rules={{ required: "This field is required" }} />
 * 
 * @fires None
 * 
 * @see ControlledSelect, formatTitle
 */
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