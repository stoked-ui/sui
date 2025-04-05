/**
 * Tooltip component with custom slotProps for styling
 * @description Tooltip component with custom slotProps for styling
 * @param {Object} props - React props
 * @param {string} props.title - Title for the tooltip
 * @param {Object} props.slotProps - Slot props object for custom styling
 * @param {Object} props.slotProps.tooltip - Slot props for tooltip styling
 * @param {Function} props.slotProps.tooltip.sx.color - Function to set color based on theme palette
 * @param {Function} props.slotProps.tooltip.sx.backgroundColor - Function to set background color based on theme palette
 * @param {Object} props.slotProps.arrow - Slot props for arrow styling
 * @param {Function} props.slotProps.arrow.sx.color - Function to set color based on theme palette
 * @param {Function} props.slotProps.arrow.sx.backgroundColor - Function to set background color based on theme palette
 * @returns {JSX.Element} - Rendered Tooltip component
 * @example
 * <Tooltip
 *  title="tooltip"
 *  slotProps={{
 *    tooltip: {
 *      sx: {
 *        color: (theme) => theme.palette.custom.main,
 *        backgroundColor: (theme) => theme.palette.invalid.main,
 *      },
 *    },
 *    arrow: {
 *      sx: {
 *        color: (theme) => theme.palette.custom.main,
 *        backgroundColor: (theme) => theme.palette.invalid.main,
 *      },
 *    },
 *  }}
 * >
 *  <Button>Hover Me!</Button>
 * </Tooltip>
 */
<Tooltip
  title="tooltip"
  slotProps={{
    tooltip: {
      sx: {
        color: (theme) => theme.palette.custom.main,
        // @ts-expect-error Property 'invalid' does not exist on 'Palette'
        backgroundColor: (theme) => theme.palette.invalid.main,
      },
    },
    arrow: {
      sx: {
        color: (theme) => theme.palette.custom.main,
        // @ts-expect-error Property 'invalid' does not exist on 'Palette'
        backgroundColor: (theme) => theme.palette.invalid.main,
      },
    },
  }}
>
  <Button>Hover Me!</Button>
</Tooltip>;