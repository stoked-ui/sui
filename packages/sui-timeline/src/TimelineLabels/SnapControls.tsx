/**
 * SnapControls component for managing snap options in the timeline.
 * @param {Object} props - The component props.
 * @param {SxProps} [props.sx] - Custom styling using the MUI system.
 * @param {'large' | 'medium' | 'small'} [props.size] - Size of the snap controls.
 * @param {boolean} [props.hover] - Indicates if hover effect should be applied.
 * @returns {JSX.Element} - The SnapControls component.
 * @fires SnapControls#handleSnapOptions
 * @see ToggleButtonGroupEx
 * @see EdgeSnap
 * @see GridSnap
 */
export default function SnapControls({ sx, size, hover }) {
  /**
   * State and dispatch obtained from the TimelineProvider.
   */
  const {
    dispatch,
    state: { flags, settings },
  } = useTimeline();

  /**
   * State to manage the disabled state.
   */
  const [disabled, setDisabled] = React.useState(!!settings.disabled);

  /**
   * Effect to update disabled state based on settings.
   */
  React.useEffect(() => {
    if (settings.disabled !== disabled) {
      setDisabled(!!settings.disabled);
    }
  }, [settings.disabled]);

  /**
   * Check if snap controls are displayed.
   */
  const onControls = flags.noLabels && !flags.noSnapControls;

  /**
   * Determine control size based on flags or provided size prop.
   */
  const cntrlSize = size || (onControls ? 'large' : 'medium');

  /**
   * Object containing width and height values for different control sizes.
   */
  const cntrlSizes = { large: { width: 52, height: 40 }, medium: { width: 40, height: 32 }, small: { width: 30, height: 22 } };

  /**
   * State to manage the current control size.
   */
  const [currentSize, setCurrentSize] = React.useState(cntrlSize);

  /**
   * Effect to update current control size.
   */
  React.useEffect(() => {
    if (currentSize !== cntrlSize) {
      setCurrentSize(cntrlSize);
    }
  }, [cntrlSize]);

  /**
   * Return undefined if snap controls are disabled.
   */
  if (flags.noSnapControls) {
    return undefined;
  }

  /**
   * Event handler for snap options changes.
   * @param {React.MouseEvent<HTMLElement>} event - The event that triggered the change.
   * @param {string[]} newOptions - The new snap options selected.
   */
  const handleSnapOptions = (event, newOptions) => {
    const add = [];
    const remove = [];
    if (newOptions.includes('gridSnap')) {
      add.push('gridSnap');
    } else {
      remove.push('gridSnap');
    }
    if (newOptions.includes('edgeSnap')) {
      add.push('edgeSnap');
    } else {
      remove.push('edgeSnap');
    }
    dispatch({ type: 'SET_FLAGS', payload: { add, remove } });
  };

  /**
   * Retrieve width and height based on current control size.
   */
  const width = cntrlSizes[cntrlSize].width;
  const height = cntrlSizes[cntrlSize].height;

  /**
   * Array to store active control flags.
   */
  const controlFlags = [];
  if (flags.edgeSnap) {
    controlFlags.push('edgeSnap');
  }
  if (flags.gridSnap) {
    controlFlags.push('gridSnap');
  }

  /**
   * Style object for button hover effect.
   */
  const sxButton = hover ? { opacity: .4, '&:hover': { opacity: 1 } } : {};

  return (
    <ToggleButtonGroupEx
      onChange={handleSnapOptions}
      value={controlFlags}
      size={'small'}
      aria-label="text alignment"
      maxWidth={width}
      maxHeight={height}
      sx={sx}
      disabled={disabled}
    >
      {/* Tooltip for Edge Snap */}
      <Tooltip enterDelay={1000} title={'Edge Snap'} key={'edgeSnap'}>
        <span>
          <ToggleButton value="edgeSnap" aria-label="edge snap" key={'edgeSnap-tooltip'} sx={sxButton}>
            <EdgeSnap />
          </ToggleButton>
        </span>
      </Tooltip>
      {/* Tooltip for Grid Snap */}
      <Tooltip enterDelay={1000} title={'Grid Snap'} key={'gridSnap'}>
        <span>
          <ToolbarToggle value="gridSnap" aria-label="grid snap" key={'gridSnap-tooltip'} sx={sxButton}>
            <GridSnap />
          </ToolbarToggle>
        </span>
      </Tooltip>
    </ToggleButtonGroupEx>
  );
}

/**
 * SnapControls prop types generated from TypeScript types.
 * @property {object} style - Custom style object.
 */
SnapControls.propTypes = {
  style: PropTypes.object,
};