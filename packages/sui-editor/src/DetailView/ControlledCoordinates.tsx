/**
 * Functional component for a three-slot input component.
 * Allows input of X, Y, and Z coordinates.
 *
 * @param {Object} params - Component props
 * @param {Control<any, any>} params.control - React Hook Form control object
 * @param {boolean} [params.disabled] - Flag indicating if component is disabled
 * @param {function} [params.onClick] - Click event handler
 * 
 * @returns {JSX.Element} ThreeSlotComponent
 * 
 * @example
 * // Usage example:
 * // import ThreeSlotComponent from './ThreeSlotComponent';
 * //
 * // function App() {
 * //   return (
 * //     <ControlledCoordinates control={control} disabled={false} onClick={handleClick} />
 * //   );
 * // }
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
 * Component that wraps ThreeSlotComponent with additional props.
 *
 * @param {Object} params - Component props
 * @param {Control<any, any>} params.control - React Hook Form control object
 * @param {boolean} [params.disabled] - Flag indicating if component is disabled
 * @param {function} [params.onClick] - Click event handler
 * 
 * @returns {JSX.Element} ControlledCoordinates
 */
function ControlledCoordinates(params: { control: Control<any, any>, disabled?: boolean, onClick?: () => void }) {
  return <ThreeSlotComponent {...params} />
}

export default ControlledCoordinates;