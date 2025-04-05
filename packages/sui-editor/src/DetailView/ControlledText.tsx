/**
 * React component for a controlled text field with validation.
 * @param {Object} props - Component props
 * @property {React.RefObject} ref - Reference to the input element
 * @property {string} prefix - Prefix for the input name
 * @property {any} value - Current value of the input
 * @property {Object} control - Form control object
 * @property {string} name - Name of the input field
 * @property {string} label - Label for the input field
 * @property {boolean} disabled - Indicates if the input is disabled
 * @property {string} className - CSS class for styling
 * @property {Object} rules - Validation rules for the input
 * @property {Function} onFocus - Event handler for focus
 * @property {Function} onBlur - Event handler for blur
 * @property {boolean} multiline - Indicates if the input is multiline
 * @property {number} rows - Number of rows for multiline input
 * @property {Function} onClick - Event handler for click
 * @property {Function} format - Function to format input value
 * @property {string} type - Type of the input field
 * @property {any} errors - Error object for validation
 * @returns {JSX.Element} - Rendered controlled text field component
 */
export default function ControlledText({ ref, prefix, value, control, name, label, disabled, className, rules, onFocus, onBlur, multiline, rows, onClick, format, type, errors }: any) {

  if (!rules) {
    rules = {
      required: true
    };
  }

  if (!name && label) {
    name = label.split(' ').map((optionNamePart: string) => {
      return `${optionNamePart.charAt(0).toLowerCase()}${optionNamePart.slice(1)}`
    }).join('.')
  }

  if (prefix) {
    name = `${prefix}.${name}`;
  }

  /**
   * Validates the input and returns the controlled text field component.
   * @returns {JSX.Element} - Rendered controlled text field component
   */
  const {
    field,
    fieldState: { invalid, isTouched, isDirty, error },
    formState: { touchedFields, dirtyFields }
  } = useController({
    name,
    control,
    rules,
  });

  if (!type) {
    type = 'text';
  }
  return (
    <React.Fragment>

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

        <TextField
          {...field}
          sx={{ whiteSpace: 'nowrap', flexGrow: 1, display: 'flex', width: '100%'}}
          disabled={disabled}
          id={namedId(field.name)}
          onClick={onClick}
          value={format ? format(field.value) : field.value} // input value
          inputRef={field.ref}
          multiline={multiline}
          rows={rows}
          label={label}
          fullWidth
          type={type}
          variant={'outlined'}
          className={className}
          error={!!error}
        />
      </Tooltip>
    </React.Fragment>
  );
}

/**
 * React component for an uncontrolled text field.
 * @param {Object} props - Component props
 * @property {string} label - Label for the input field
 * @property {Function} onClick - Event handler for click
 * @property {Function} format - Function to format input value
 * @property {any} value - Current value of the input
 * @property {boolean} multiline - Indicates if the input is multiline
 * @property {Object} control - Form control object
 * @property {React.RefObject} ref - Reference to the input element
 * @property {number} rows - Number of rows for multiline input
 * @property {string} type - Type of the input field
 * @property {string} className - CSS class for styling
 * @property {boolean} disabled - Indicates if the input is disabled
 * @returns {JSX.Element} - Rendered uncontrolled text field component
 */
export function UncontrolledText(props: any) {
  const { label, onClick, format, value, multiline, control, ref, rows, type, className, disabled } = props;
  let { name } = props;
  if (!name && label) {
    name = label.split(' ').map((optionNamePart: string) => {
      return optionNamePart.charAt(0).toLowerCase() + optionNamePart.slice(1)
    }).join('.')
  }

    return <TextField
      id={name}
      onClick={onClick}
      value={format ? format(value) : value} // input value
      inputRef={ref}
      multiline={multiline}
      rows={rows}
      label={label}
      fullWidth
      type={type}
      variant={'outlined'}
      className={className}
      disabled={disabled}
    />
}