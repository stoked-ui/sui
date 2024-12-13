import * as React from 'react';
import { Box, TextField } from '@mui/material';
import {Control, Controller} from "react-hook-form";

// Functional component definition
function ThreeSlotComponent({ control }) {
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
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label={'X'}
            placeholder={'X'}
            variant="outlined"
            fullWidth
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
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label={'Y'}
            placeholder={'Y'}
            variant="outlined"
            fullWidth
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
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label={'Z'}
            placeholder={'Z'}
            variant="outlined"
            fullWidth
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


export { ThreeSlotComponent };

// Usage example
// import ThreeSlotComponent from './ThreeSlotComponent';
//
// function App() {
//   return (
function ControlledCoordinates({ control }: { control: Control<any, any> }) {
  return <ThreeSlotComponent control={control} />
}

export default ControlledCoordinates;
//   );
// }
