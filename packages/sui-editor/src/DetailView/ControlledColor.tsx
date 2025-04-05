/**
 * Component for a controlled color input field with validation and error handling.
 * @description This component renders a color input field with customizable labels, validation rules, and error messages.
 * @param {string} darkLabel - The label color for dark mode.
 * @param {string} lightLabel - The label color for light mode.
 * @param {any} control - The control object from react-hook-form.
 * @param {string} name - The name of the input field.
 * @param {string} label - The label text for the input field.
 * @param {boolean} disabled - Indicates if the input field is disabled.
 * @param {string} className - Additional CSS class for styling.
 * @param {any} rules - The validation rules for the input field.
 * @param {Function} onFocus - Event handler for focus event.
 * @param {Function} onBlur - Event handler for blur event.
 * @param {boolean} multiline - Indicates if the input field is multiline.
 * @param {number} rows - The number of rows for multiline input.
 * @param {Function} onClick - Event handler for click event.
 * @param {string} format - The format of the input value.
 * @param {string} type - The type of the input field.
 * @returns {JSX.Element} The controlled color input field component.
 * @example
 * <ControlledColor darkLabel="dark" lightLabel="light" control={control} name="color" label="Color" disabled={false} className="color-input" rules={{ required: true }} onFocus={handleFocus} onBlur={handleBlur} multiline={false} rows={1} onClick={handleClick} format="hex" type="text" />
 */
export default function ControlledColor({ darkLabel, lightLabel, control, name, label, disabled, className, rules, onFocus, onBlur, multiline, rows, onClick, format, type }: any) {

  if (!rules) {
    rules = {
      required: true
    };
  }

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
    control,
    rules
  });

  if (!type) {
    type = 'text';
  }

  /**
   * Determines the label color based on the current theme.
   * @param {object} theme - The theme object from Material-UI.
   * @returns {string} The color value for the label.
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
          '& input': {blockSize: '56px', padding: 0},
          '& fieldset': {
            color: theme.palette.text.primary,
            padding: '3px 8px',
            borderRadius: '4px',
            outlineOffset: 0,
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