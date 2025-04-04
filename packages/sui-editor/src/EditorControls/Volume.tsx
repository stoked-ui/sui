import {useEditorContext} from "../EditorProvider";
import * as React from "react";
import {VolumeDown, VolumeMute, VolumeOff, VolumeUp} from "@mui/icons-material";
import {Slider, Stack, SxProps} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import PropTypes from "prop-types";

/**
 * A component for controlling the volume in an audio player.
 * 
 * The component allows users to adjust the volume using a slider and toggle mute.
 * It also displays the current volume level with an icon that changes depending on the volume level.
 * 
 * @param {Object} props
 * @param {boolean} [props.disabled] - Whether the volume control is disabled.
 * @param {SxProps} [props.sx] - Additional styles for the component.
 * @param {SxProps} [props.sliderSx] - Additional styles for the slider.
 * @param {SxProps} [props.iconSx] - Additional styles for the icon.
 */
export default function Volume({ disabled, sx, sliderSx, iconSx }: { disabled?: boolean, sx?: SxProps, sliderSx?: SxProps, iconSx?: SxProps }) {
  const { state: { engine, settings } } = useEditorContext();
  const [value, setValue] = React.useState<number>(100);
  const [mute, setMute] = React.useState<boolean>(false);

  /**
   * Handles changes to the volume slider.
   * 
   * @param {Event} event - The change event.
   * @param {number|number[]} newValue - The new value of the slider.
   */
  const handleChange = (event: Event, newValue: number | number[]) => {
    setValue(newValue as number);
    Howler.volume((newValue as number) / 100);
    if (mute) {
      setMute(false);
    }
  };

  /**
   * Toggles the mute state of the audio player.
   */
  const toggleMute = () => {
    Howler.mute(!mute);
    setMute(!mute);
  };

  /**
   * Determines whether the control is disabled based on the settings and the disabled prop.
   * 
   * @returns {boolean} Whether the control is disabled.
   */
  const controlDisabled = settings.disabled || disabled;

  /**
   * Returns a base style object for the icon.
   * 
   * @param {Object} theme - The Material-UI theme object.
   * @returns {Object}
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
   * Returns the icon to display based on the mute state and volume level.
   * 
   * @param {boolean} isMute - Whether the audio player is muted.
   * @param {number} volume - The current volume level.
   * @returns {React.ReactElement}
   */
  const getIcon = (isMute: boolean, volume: number) => {
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
        ...(Array.isArray(sliderSx) ? sliderSx : [sliderSx])]}
    >
      {icon && (
        <IconButton aria-label="Volume" onClick={toggleMute}>
          {getIcon(mute, value)}
        </IconButton>
      )}
      <Slider
        value={mute ? 0 : value}
        onChange={handleChange}
        min={0}
        max={100}
        sx={[...(Array.isArray(sliderSx) ? sliderSx : [sliderSx])]}
      />
    </Stack>
  );
}

Volume.propTypes = {
  /**
   * Whether the volume control is disabled.
   */
  disabled: PropTypes.bool,
} as any;