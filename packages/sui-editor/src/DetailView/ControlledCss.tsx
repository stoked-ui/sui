import { Control, FieldValues, Path, PathValue, useController } from 'react-hook-form';
import { TextField, TextFieldProps } from '@mui/material';

type CSSPropertiesFormFieldProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  control: Control<T>;
  defaultValue?: React.CSSProperties;
} & Omit<TextFieldProps, 'name' | 'label' | 'defaultValue' | 'onChange'>;

function ControlledCss <T extends FieldValues>({
                                                         name,
                                                         label,
                                                         control,
                                                         defaultValue = {},
                                                 className,
                                                 ...textFieldProps
                                                       }: CSSPropertiesFormFieldProps<T>) {
  const {
    field: { onChange, onBlur, value },
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: JSON.stringify(defaultValue) as PathValue<T, Path<T>>
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;

    try {
      // Parse the input as JSON for valid CSSProperties structure
      const parsedValue = JSON.parse(inputValue);
      if (typeof parsedValue === 'object' && parsedValue !== null) {
        onChange(inputValue); // Pass JSON string to `react-hook-form`
      }
    } catch (e) {
      // Ignore JSON parsing errors, keep existing value
      console.error("Invalid CSSProperties JSON format.");
    }
  };

  return (
    <TextField
      {...textFieldProps}
      label={label}
      value={value}
      onChange={handleChange}
      onBlur={onBlur}
      error={!!error}
      helperText={error ? error.message : 'Enter a valid CSSProperties object'}
      multiline
      className={className}
      fullWidth
    />
  );
};

export default ControlledCss;

