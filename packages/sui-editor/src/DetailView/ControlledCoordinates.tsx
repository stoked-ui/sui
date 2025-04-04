import * as React from 'react';
import { Box, TextField } from '@mui/material';
import {Control, Controller} from "react-hook-form";

/**
 * A functional component that renders three text fields for controlled coordinates.
 *
 * @param params
 *   - control: The control instance from react-hook-form.
 *   - disabled: Whether the fields are disabled or not. Defaults to false.
 *   - onClick: An optional function to be called when the field is clicked.
 */
function ThreeSlotComponent(params: { control: Control<any, any>, disabled?: boolean, onClick?: () => void }) {
  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        '&:hover .MuiOutlinedInput-root': {
          borderColor: 'primary.main',
        },
        borderRadius: '4px',
        '&:hover': {
          '& .MuiFormControl-root .MuiInputBase-root fieldset': {
            borderWidth: '1px',
            borderColor: 'white',
          }
        },
        '&:focus-within': {
          '& .MuiFormControl-root .MuiInputBase-root fieldset': {
            borderWidth: '2px',
            borderColor: theme.palette.primary.main,
          }
        }
      })}
    >
      {/* Slot X */}
      <Controller
        name={'x'}
        control={params.control}
        render={({ field }) => (
          <TextField
            {...field}
            label={'X'}
            placeholder={'X'}
            variant="outlined"
            fullWidth
            disabled={params.disabled}
            sx={{
              '& fieldset': {
                borderRight: 'none',
                borderRadius: '4px 0 0 4px',
              },
            }}
          />
        )}
      />

      {/* Slot Y */}
      <Controller
        name={'y'}
        control={params.control}
        render={({ field }) => (
          <TextField
            {...field}
            label={'Y'}
            placeholder={'Y'}
            variant="outlined"
            fullWidth
            disabled={params.disabled}
            sx={{
              '& fieldset': {
                borderRight: 'none',
                borderLeft: 'none',
                borderRadius: 0,
              },
            }}
          />
        )}
      />

      {/* Slot Z */}
      <Controller
        name={'z'}
        control={params.control}
        render={({ field }) => (
          <TextField
            {...field}
            label={'Z'}
            placeholder={'Z'}
            variant="outlined"
            fullWidth
            disabled={params.disabled}
            sx={{
              '& fieldset': {
                borderLeft: 'none',
                borderRadius: '0 4px 4px 0',
              },
            }}
          />
        )}
      />
    </Box>
  );
}

/**
 * A controlled version of the ThreeSlotComponent.
 *
 * @param params
 *   - control: The control instance from react-hook-form.
 *   - disabled: Whether the fields are disabled or not. Defaults to false.
 *   - onClick: An optional function to be called when the field is clicked.
 */
function ControlledCoordinates(params: { control: Control<any, any>, disabled?: boolean, onClick?: () => void }) {
  return <ThreeSlotComponent {...params} />
}

export default ControlledCoordinates;