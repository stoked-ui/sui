/**
 * Represents a controlled checkbox component with custom styling.
 * @param {object} props - The props for the ControlledCheckbox component.
 * @property {object} control - The control object for form management.
 * @property {string} name - The name of the checkbox.
 * @property {string} label - The label for the checkbox.
 * @property {boolean} disabled - Flag to disable the checkbox.
 * @property {string} className - Additional CSS class for styling.
 * @property {object} rules - Validation rules for the checkbox.
 * @property {function} onClickLabel - Click event handler for the label.
 * @property {function} onFocus - Focus event handler.
 * @property {function} onBlur - Blur event handler.
 * @property {boolean} multiline - Flag to enable multiline input.
 * @property {number} rows - Number of rows for multiline input.
 * @property {function} onClick - Click event handler.
 * @property {string} format - Format type for the checkbox.
 * @property {string} type - Type of the checkbox.
 * @returns {JSX.Element} - The rendered ControlledCheckbox component.
 */
export default function ControlledCheckbox({ control, name, label, disabled, className, rules, onClickLabel, onFocus, onBlur, multiline, rows, onClick, format, type }: any) {

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
      <FormControlLabel
        onClick={onClickLabel}
        control={
          <OutlinedCheckbox
            {...field}
            id={namedId(field.name)}
            defaultChecked={field.value}
            inputRef={field.ref}
            variant={'outlined'}
            disabled={disabled}
            className={className}
            onClick={onClick}
          />
        }
        label={label}
      />
    </Tooltip>
  );
}