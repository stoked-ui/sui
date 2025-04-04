/**
 * Import required modules from Material UI.
 */
import {
  Badge,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  FormLabel,
  FilledInput,
  OutlinedInput,
  IconButton,
  Input,
  InputLabel,
  LinearProgress,
  Radio,
  TextField,
  SvgIcon,
  Switch,
} from '@mui/material';

/**
 * A base class component for testing color palette props.
 */
function TestBaseColorPaletteProp() {
  /**
   * Base color palette array.
   */
  const baseColorPalette = ['primary', 'secondary', 'error', 'info', 'success', 'warning'] as const;

  return (
    <div>
      {baseColorPalette.map((color) => (
        <div key={color}>
          {/* A badge component with the specified color prop. */}
          <Badge color={color} />
          {/* A button component with the specified color prop. */}
          <Button color={color} />
          {/* A checkbox component with the specified color prop. */}
          <Checkbox color={color} />
          {/* A chip component with the specified color prop. */}
          <Chip color={color} />
          {/* A circular progress indicator component with the specified color prop. */}
          <CircularProgress color={color} />
          {/* A form control component with the specified color prop. */}
          <FormControl color={color} />
          {/* A filled input component with the specified color prop. */}
          <FilledInput color={color} />
          {/* A form label component with the specified color prop. */}
          <FormLabel color={color} />
          {/* An outlined input component with the specified color prop. */}
          <OutlinedInput color={color} />
          {/* An icon button component with the specified color prop. */}
          <IconButton color={color} />
          {/* A text input component with the specified color prop. */}
          <Input color={color} />
          {/* A label for the input field with the specified color prop. */}
          <InputLabel color={color} />
          {/* A linear progress indicator component with the specified color prop. */}
          <LinearProgress color={color} />
          {/* A text field component with the specified color prop. */}
          <TextField color={color} />
          {/* A radio button component with the specified color prop. */}
          <Radio color={color} />
          {/* An SVG icon component with the specified color prop. */}
          <SvgIcon color={color} />
          {/* A switch component with the specified color prop. */}
          <Switch color={color} />
        </div>
      ))}
    </div>
  );
}