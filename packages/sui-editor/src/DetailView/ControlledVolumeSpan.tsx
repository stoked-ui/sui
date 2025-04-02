import * as React from 'react';
import {Box, Stack, SxProps, TextField} from '@mui/material';
import {Control, Controller, FieldArray, FieldArrayMethodProps, useFieldArray,
  UseFormSetValue, UseFormGetValues} from "react-hook-form";
import Volume from '../EditorControls/Volume';
import AddIcon from "@mui/icons-material/Add";
import SubtractIcon from "@mui/icons-material/Remove";
import Fab from "@mui/material/Fab";
import { IEditorActionDetail } from './Detail.types';

function ControlledVolumeInstance(params: {
  index: number;
  length: number;
  name: string;
  getValues: UseFormGetValues<any>;
  setValue:  UseFormSetValue<any>;
  remove: (index: number) => void;
  insert: (index: number, value: any) => void;
  control: Control<any>;
  startBound: number;
  endBound: number;
  disabled?: boolean;
  sliderSx: SxProps;
}) {
  const { index, name, control, getValues, remove, insert, startBound, endBound } = params;
  const handleStartChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  ) => {
    const newStart = parseFloat(e.target.value);
    const currentValues = getValues(name); // Get the latest array values
    const current = currentValues[index];
    const currentStart = current[1];
    const currentEnd = current[2];
    const next = currentValues[index + 1];
    const nextStart = next ? next[1] : undefined;
    const nextEnd = next ? next[2] : undefined;


    // Case 1: Prevent invalid changes
    if (newStart < startBound || newStart >= currentEnd) {
      e.preventDefault();
      return;
    }

    // Case 2: Split the record (current becomes [start, newStart], new becomes [newStart, end])
    if (newStart > currentStart) {
      insert(index + 1, [[1, newStart, currentEnd]]); // Add new record after
      params.setValue(`${params.name}.${params.index}.2`, newStart)
      onChange({ ...e, target: { ...e.target, value: currentStart.toString() } }); // Retain the original start value
    }
    // Case 3: Merge with the previous record (newStart matches the startBound)
    else if (newStart === startBound && index > 0) {
      const previous = currentValues[index - 1];
      previous[2] = currentEnd; // Update the previous record's end to match current end
      params.setValue(`${params.name}.${params.index - 1}.2`, currentEnd)
      remove(index); // Remove the current record
    }
    // Case 4: Regular update
    else {
      onChange(e);
    }
    console.log('volume', getValues(name));
  };


  const first = index === 0;
  const last = index === params.length - 1;

  const order = `${first ? 'first' : ''} ${last ? 'last' : ''}`;
  return (
    <Stack direction={'row'} sx={{ width: '60%', alignItems: 'center'}}>
      <Controller
        name={`${params.name}.${params.index}.0`}
        control={params.control}
        render={({ field }) => (
          <Volume disabled={params.disabled} {...field} sx={params.sliderSx}/>
        )}
      />

      <Controller
        name={`${params.name}.${params.index}.1`}
        control={params.control}
        render={({ field }) => (
          <TextField
            {...field}
            className={order}
            label={index === 0 ? 'Start' : undefined}
            type="number"
            variant="outlined"
            disabled={params.disabled}
            inputProps={{
              step: 0.01,
              min: startBound,
              max: endBound,
            }}
            sx={{
              width: '150px',
              '& .MuiInputBase-input': {
                paddingRight: '0px',
              },
              '& fieldset': {
                borderRight: 'none',
                borderRadius: ` ${index === 0 ? '4px' : '0'} 0 0 ${index === 0 ? '0' : '4px'}`,
                borderBottomWidth: last ? '1px' : '0px',
                borderTopWidth: first ? '1px' : '0px'
              },
            }}
          />
        )}
      />

      <Controller
        name={`${params.name}.${params.index}.2`}
        control={params.control}
        render={({ field }) => (
          <TextField
            {...field}
            label={index === 0 ? 'End' : undefined}
            className={order}
            type="number"
            variant="outlined"
            inputProps={{
              step: 0.01,
              min: startBound,
              max: endBound,
            }}
            disabled={params.disabled}

            sx={{
              width: '150px',
              '& .MuiInputBase-input': {
                paddingRight: '8px',
              },
              '& fieldset': {
                borderLeft: 'none',
                borderRadius: `0 ${index === 0 ? '4px' : '0'} ${index === 0 ? '0' : '4px'} 0`,
                borderBottomWidth: last ? '1px' : '0px',
                borderTopWidth: first ? '1px' : '0px'
              },
            }}
          />
        )}
      />
      {last && <Fab
          size="small"
          color="primary"
          sx={{ height: 40, minWidth: '40px!important', marginLeft: '8px' }}
          onClick={() => params.insert(index + 1, [[1, params.startBound, params.endBound]])}
        >
          <AddIcon />
        </Fab>}
      {!last && <Fab
        size="small"
        color="error"
        onClick={() => params.remove(index)}
        sx={{ height: 40, minWidth: '40px!important', marginLeft: '8px' }}
      >
        <SubtractIcon />
      </Fab>}
    </Stack>
  );
}
// Functional component definition
function ControlledVolumeSpan(params: {
  name: string;
  getValues: UseFormGetValues<any>;
  setValue:  UseFormSetValue<any>;
  control: Control<any>;
  disabled?: boolean;
  sx: SxProps;
  sliderSx: SxProps;
  start: number;
  end: number;
  onClick?: () => void;
}) {
  const { fields, append, remove, insert } = useFieldArray({
    control: params.control,
    name: params.name,
  });

  React.useEffect(() => {
    // Ensure default value is always present
    if (fields.length === 0) {
      append([1, params.start, params.end]);
    }
  }, [fields, append, params.start, params.end]);

  return (
    <Box
      sx={[(theme) => ({
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
            borderBottomWidth: '0px',
            borderTopWidth: '0px',
          },
          '& .MuiFormControl-root.last .MuiInputBase-root fieldset': {
            borderBottomWidth: '1px',
          },
          '& .MuiFormControl-root.first .MuiInputBase-root fieldset': {
            borderTopWidth: '1px',
          }
        },
        '&:focus-within': {
          '& .MuiFormControl-root .MuiInputBase-root fieldset': {
            borderWidth: '2px',
            borderColor: theme.palette.primary.main,
            borderBottomWidth: '0px',
            borderTopWidth: '0px',
          },
          '& .MuiFormControl-root.last .MuiInputBase-root fieldset': {
            borderBottomWidth: '2px',
          },
          '& .MuiFormControl-root.first .MuiInputBase-root fieldset': {
            borderTopWidth: '2px',
          }
        },
        width: '100%'
      }), ...(Array.isArray(params.sx) ? params.sx : [params.sx])]}
      onClick={params.onClick}
    >
      <Stack sx={params.sx}>
        {fields.map((_, index) => (
          <ControlledVolumeInstance
            key={index}
            index={index}
            length={fields.length}
            name={params.name}
            control={params.control}
            getValues={params.getValues}
            setValue={params.setValue}
            remove={remove}
            insert={insert}
            startBound={params.start}
            endBound={params.end}
            disabled={params.disabled}
            sliderSx={params.sliderSx}
          />
        ))}
      </Stack>
    </Box>
  );
}


// Usage example
// import ThreeSlotComponent from './ThreeSlotComponent';
//
// function App() {
//   return (


export default ControlledVolumeSpan;
//   );
// }

