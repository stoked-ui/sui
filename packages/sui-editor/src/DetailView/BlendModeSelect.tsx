/**
 * BlendModeSelect component
 *
 * A controlled select component for choosing the blend mode.
 *
 * @param {Object} props - Component properties
 * @param {any} props.control - The control object from react-hook-form
 * @param {boolean} props.disabled - Whether the component is disabled
 * @param {function} props.onClick - The click event handler
 * @param {Object} [props.rules] - Validation rules for the select field
 */
export default function BlendModeSelect({control, disabled, onClick, rules = undefined }) {
  return (
    <ControlledSelect
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
      ].map((option) => ({ value: option, label: formatTitle(option) }))
}
  });
}