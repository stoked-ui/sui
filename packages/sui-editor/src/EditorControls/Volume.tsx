/**
 * Volume component for controlling audio volume.
 * @param {boolean} [disabled] - Indicates if the volume control is disabled.
 * @param {SxProps} [sx] - Additional styles for the main container.
 * @param {SxProps} [sliderSx] - Additional styles for the volume slider.
 * @param {SxProps} [iconSx] - Additional styles for the volume icons.
 * @returns {JSX.Element} - The Volume component JSX element.
 */
export default function Volume({ disabled, sx, sliderSx, iconSx }) {
  const { state: { engine, settings } } = useEditorContext();
  const [value, setValue] = React.useState(100);
  const [mute, setMute] = React.useState(false);

  /**
   * Handles the change in volume.
   * @param {Event} event - The event that triggered the change.
   * @param {number | number[]} newValue - The new volume value.
   */
  const handleChange = (event, newValue) => {
    setValue(newValue);
    Howler.volume(newValue / 100);
    if (mute) {
      setMute(false);
    }
  };

  /**
   * Toggles the mute state.
   */
  const toggleMute = () => {
    Howler.mute(!mute);
    setMute(!mute);
  };

  const controlDisabled = settings.disabled || disabled;

  /**
   * Defines base styles for volume icons.
   * @param {any} theme - The current theme object.
   * @returns {SxProps} - The base styles for volume icons.
   */
  const base = (theme) => {
    return {
      mr: '4px!important',
      fill: controlDisabled ? theme.palette.action.disabled : theme.palette.text.primary,
      cursor: 'pointer',
      '&:hover': {
        fill: `${theme.palette.primary[500]}!important`,
      },
    };
  };

  /**
   * Retrieves the appropriate volume icon based on mute state and volume level.
   * @param {boolean} isMute - Indicates if the volume is muted.
   * @param {number} volume - The current volume level.
   * @returns {JSX.Element} - The volume icon JSX element.
   */
  const getIcon = (isMute, volume) => {
    let icon = <VolumeUp sx={base} />;
    if (isMute) {
      icon = <VolumeOff sx={[base, ...(Array.isArray(iconSx) ? iconSx : [iconSx])]} />;
    } else if (volume === 0) {
      icon = <VolumeMute sx={[{ ...base, left: '-4px', position: 'relative' }, ...(Array.isArray(iconSx) ? iconSx : [iconSx])]} />;
    } else if (volume < 70) {
      icon = <VolumeDown sx={[{ ...base, left: '-2px', position: 'relative' }, ...(Array.isArray(iconSx) ? iconSx : [iconSx])]} />;
    }
    return icon;
  };

  return (
    <Stack
      spacing={1}
      direction="row"
      sx={[{
        alignItems: 'center',
        width: '120px',
        mr: 2,
      },
        ...(Array.isArray(sx) ? sx : [sx])
      ]}
    >
      <IconButton
        sx={{
          '&:hover': {
            background: 'transparent',
          },
        }}
        onClick={toggleMute}
        disabled={controlDisabled}
      >
        {getIcon(mute, value)}
      </IconButton>
      <Slider
        aria-label="Volume"
        size="small"
        disabled={controlDisabled}
        sx={[{
          '& .MuiSlider-thumb::after': {
            position: 'absolute',
            content: '""',
            borderRadius: '50%', // 42px is the hit target
            width: '10px!important',
            height: '10px!important',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          },
          '& .MuiSlider-thumb:has(> input:focus-visible)': {
            boxShadow:
              '0px 0px 0px 4px rgba(var(--muidocs-palette-primary-mainChannel) /' +
              ' 0.16)!important',
          },
        }, ...(Array.isArray(sliderSx) ? sliderSx : [sliderSx])]}
        value={mute ? 0 : value}
        onChange={handleChange}
        min={0}
        max={100}
      />
    </Stack>
  );
}

Volume.propTypes = {
  disabled: PropTypes.bool,
} as any;