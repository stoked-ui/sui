/**
 * ControlledColor component
 * 
 * A reusable color input field with label and validation functionality.
 * 
 * @param {object} props - Component props
 * @param {boolean} props.darkLabel - Whether to use dark label color
 * @param {boolean} props.lightLabel - Whether to use light label color
 * @param {object} props.control - React Hook Form control object
 * @param {string} props.name - Name of the input field (optional)
 * @param {string} props.label - Label text for the input field (optional)
 * @param {boolean} props.disabled - Whether the input field is disabled
 * @param {object} props.className - Additional CSS class name
 * @param {array} props.rules - Validation rules for the input field (default: required)
 * @param {function} props.onFocus - Function to call when the input field gains focus
 * @param {function} props onBlur - Function to call when the input field loses focus
 * @param {boolean} props.multiline - Whether to display a multi-line input field
 * @param {number} props.rows - Number of rows for the input field
 * @param {string} props.format - Format string for the color value (optional)
 * @param {string} props.type - Type of the input field (default: text)
 */
export default function ControlledColor({
  darkLabel,
  lightLabel,
  control,
  name,
  label,
  disabled,
  className,
  rules,
  onFocus,
  onBlur,
  multiline,
  rows,
  onClick,
  format,
  type,
}) {
  // Add validation rules if not provided
  if (!rules) {
    rules = {
      required: true,
    };
  }

  // Format label text if it's provided
  if (!name && label) {
    name = label.split(' ').map((optionNamePart: string) => {
      return optionNamePart.charAt(0).toLowerCase() + optionNamePart.slice(1)
    }).join('.');
  }

  const {
    field,
    fieldState: { invalid, isTouched, isDirty, error },
    formState: { touchedFields, dirtyFields }
  } = useController({
    name,
    control,
    rules
  });

  // Set default type if not provided
  if (!type) {
    type = 'text';
  }

  /**
   * Returns the label color based on the theme mode.
   */
  const labelColor = (theme) => theme.palette.mode === 'dark' ? darkLabel : lightLabel;

  return (
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
      <TextFieldStyle
        {...field}
        id={namedId(field.name)}
        onClick={(ev) => {
          onClick?.(ev);
        }}
        inputRef={field.ref}
        multiline={multiline}
        rows={rows}
        label={label}
        fullWidth
        type={'color'}
        variant={'outlined'}
        disabled={disabled}
        className={className}
        error={!!error}
        sx={(theme) => ({
          '& input': { blockSize: '56px', padding: 0 },
          '& fieldset': {
            color: theme.palette.text.primary,
            padding: '3px 8px',
            borderRadius: '4px',
            outlineOffset: 0,

            // backgroundImage: `linear-gradient(90deg, ${theme.palette.background.default}, 
            // ${theme.palette.background.default}), linear-gradient(90deg, ${theme.palette.background.default}, ${theme.palette.background.default})`,
            backgroundSize: '100% 12px, 100% 17px',
            backgroundPosition: '0 0, 0 100%',
            backgroundRepeat: 'no-repeat, no-repeat'
          },
          '& label': {
            backgroundImage: `linear-gradient(90deg, ${labelColor(theme)}, ${labelColor(theme)}), linear-gradient(90deg, ${labelColor(theme)}, ${labelColor(theme)})`,
            backgroundSize: '100% 12px, 100% 17px',
            backgroundPosition: '0 0, 0 100%',
            backgroundRepeat: 'no-repeat, no-repeat',
            padding: '0px 6px',
            borderRadius: '4px',
            transform: 'translate(9px, -9px) scale(0.75)',
          },
          '& ::-webkit-color-swatch-wrapper': {
            padding: '0px',
            borderRadius: '6px'
          },
        })}
      />
    </Tooltip>
  );
}