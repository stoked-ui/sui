import * as React from 'react';
import { useController } from "react-hook-form";
import { Checkbox, FormControlLabel, Tooltip } from "@mui/material";
import { namedId} from '@stoked-ui/common';
import OutlinedStyle from "./OutlinedStyle";

/**
 * A controlled checkbox component with support for validation and accessibility.
 *
 * @param {Object} props - Component props
 * @param {object} props.control - The control instance from react-hook-form
 * @param {string} props.name - The name of the form field
 * @param {string} [props.label] - The label to display for the checkbox
 * @param {boolean} props.disabled - Whether the checkbox is disabled
 * @param {string} [props.className] - Additional CSS class names
 * @param {object} [props.rules] - Validation rules for the form field
 * @param {function} [props.onClickLabel] - Callback function when the label is clicked
 * @param {function} [props.onFocus] - Callback function when the checkbox gains focus
 * @param {function} [props onBlur] - Callback function when the checkbox loses focus
 * @param {boolean} props.multiple - Whether the checkbox is a multiple-choice field
 * @param {number} props.rows - The number of rows to render in the dropdown
 * @param {string} props.format - The format of the form field (e.g. date, email)
 * @param {string} props.type - The type of the form field
 */
export default function ControlledCheckbox({
  control,
  name,
  label,
  disabled,
  className,
  rules,
  onClickLabel,
  onFocus,
  onBlur,
  multiline,
  rows,
  onClick,
  format,
  type
}) {

  /**
   * Set default validation rules if not provided.
   */
  if (!rules) {
    rules = {
      required: true
    };
  }

  /**
   * Generate a name for the form field if none is provided and label exists.
   */
  if (!name && label) {
    name = label.split(' ').map((optionNamePart: string) => {
      return optionNamePart.charAt(0).toLowerCase() + optionNamePart.slice(1)
    }).join('.')
  }

  /**
   * Get the field state from react-hook-form.
   */
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