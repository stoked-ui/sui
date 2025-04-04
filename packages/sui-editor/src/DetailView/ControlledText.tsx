import * as React from 'react';
import { useController } from "react-hook-form";
import TextField from "@mui/material/TextField";
import { Tooltip } from "@mui/material";
import { namedId} from '@stoked-ui/common';
import { ErrorMessage } from '@hookform/error-message';

/**
 * A controlled text field component that integrates with React Hook Form.
 *
 * @param {Object} props - Component properties
 * @param {function} props.ref - Reference to the input element
 * @param {string} props.prefix - Optional prefix for the form name
 * @param {any} props.value - Initial value of the text field
 * @param {object} props.control - React Hook Form control object
 * @param {string} props.name - Unique identifier for the form field
 * @param {string} props.label - Label for the text field
 * @param {boolean} props.disabled - Whether the text field is disabled
 * @param {string} props.className - Optional CSS class name for the component
 * @param {object} props.rules - React Hook Form validation rules object (default: { required: true })
 * @param {function} props.onFocus - Callback function when the focus event occurs
 * @param {function} props onBlur - Callback function when the blur event occurs
 * @param {boolean} props.multiline - Whether the text field allows multiple lines
 * @param {number} props.rows - Number of rows for the text field (only applicable when multiline)
 * @param {function} props.onClick - Callback function when the component is clicked
 * @param {string} props.format - Optional format function for the input value
 * @param {string} props.type - Input type (default: 'text')
 */
export default function ControlledText({
  ref,
  prefix,
  value,
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
  errors
}: any) {

  if (!rules) {
    /**
     * Default validation rules: 'required'
     */
    rules = {
      required: true
    };
  }

  if (!name && label) {
    /**
     * Generate a unique name for the form field based on the label parts.
     *
     * @example
     * "full-name-first-last"
     */
    name = label.split(' ').map((optionNamePart: string) => {
      return optionNamePart.charAt(0).toLowerCase() + optionNamePart.slice(1)
    }).join('.')
  }

  if (prefix) {
    /**
     * Append the prefix to the form field name.
     *
     * @example
     * "profile-name"
     */
    name = `${prefix}.${name}`;
  }

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
    /**
     * Default input type: 'text'
     */
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
          sx={{ whiteSpace: 'nowrap', flexGrow: 1, display: 'flex', width: '100%' }}
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

export function UncontrolledText(props: any) {
  const { label, onClick, format, value, multiline, control, ref, rows, type, className, disabled } = props;
  let { name } = props;

  if (!name && label) {
    /**
     * Generate a unique name for the form field based on the label parts.
     *
     * @example
     * "full-name-first-last"
     */
    name = label.split(' ').map((optionNamePart: string) => {
      return optionNamePart.charAt(0).toLowerCase() + optionNamePart.slice(1)
    }).join('.')
  }

  /**
   * Uncontrolled text field component.
   *
   * @param {Object} props - Component properties
   */
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
  />
}