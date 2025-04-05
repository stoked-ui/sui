/**
 * Renders components with different color palettes based on a predefined set of colors.
 * @returns {JSX.Element} Components with different color palettes.
 */
function TestBaseColorPaletteProp() {
  const baseColorPalette = ['primary', 'secondary', 'error', 'info', 'success', 'warning'] as const;
  return (
    <div>
      {baseColorPalette.map((color) => (
        <div key={color}>
          <Badge color={color} /> // @property {string} color - The color of the badge.
          <Button color={color} /> // @property {string} color - The color of the button.
          <Checkbox color={color} /> // @property {string} color - The color of the checkbox.
          <Chip color={color} /> // @property {string} color - The color of the chip.
          <CircularProgress color={color} /> // @property {string} color - The color of the circular progress.
          <FormControl color={color} /> // @property {string} color - The color of the form control.
          <FilledInput color={color} /> // @property {string} color - The color of the filled input.
          <FormLabel color={color} /> // @property {string} color - The color of the form label.
          <OutlinedInput color={color} /> // @property {string} color - The color of the outlined input.
          <IconButton color={color} /> // @property {string} color - The color of the icon button.
          <Input color={color} /> // @property {string} color - The color of the input.
          <InputLabel color={color} /> // @property {string} color - The color of the input label.
          <LinearProgress color={color} /> // @property {string} color - The color of the linear progress.
          <TextField color={color} /> // @property {string} color - The color of the text field.
          <Radio color={color} /> // @property {string} color - The color of the radio button.
          <SvgIcon color={color} /> // @property {string} color - The color of the SVG icon.
          <Switch color={color} /> // @property {string} color - The color of the switch.
        </div>
      ))}
    </div>
  );
}