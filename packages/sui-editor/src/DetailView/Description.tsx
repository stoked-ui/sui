/**
 * Description component for form input fields.
 *
 * This component uses the `react-hook-form` library to manage form state and validation.
 * It wraps a Material-UI `TextField` with a tooltip that displays error messages when the field is invalid.
 *
 * Props:
 *   className: CSS class name for the component
 *   control: React Hook Form control object
 *   name: Name of the form field
 *   label: Label text for the field
 *   disabled: Whether the field is disabled or not
 */
export default function Description({
  className,
  control,
  name,
  label,
  disabled,
}: any) {

  /**
   * Use React Hook Form's `useController` hook to get the field state and form state.
   * The `rules` option specifies that the field is required.
   */
  const {
    field,
    fieldState: { error },
    formState: { touchedFields, dirtyFields }
  } = useController({
    name,
    control,
    rules: { required: true },
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
      <TextFieldStyle
        {...field}
        multiline
        className={className}
        rows={4}
        label={label}
        sx={{
          '& fieldset': {
            display: disabled ? 'none' : ''
          }
        }}
        fullWidth
        variant={'outlined'}
        disabled={disabled}
      />
    </Tooltip>
  );
}