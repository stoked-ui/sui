import {useEditorContext} from "../EditorProvider";
import * as React from "react";
import {VolumeDown, VolumeMute, VolumeOff, VolumeUp} from "@mui/icons-material";
import {Slider, Stack, SxProps} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import PropTypes from "prop-types";

export default function Volume({ disabled, sx, sliderSx, iconSx }: { disabled?: boolean, sx?: SxProps, sliderSx?: SxProps, iconSx?: SxProps }) {
  const { state: { engine, settings } } = useEditorContext();
  const [value, setValue] = React.useState<number>(100);
  const [mute, setMute] = React.useState<boolean>(false);

  const handleChange = (event: Event, newValue: number | number[]) => {
    setValue(newValue as number);
    Howler.volume((newValue as number) / 100);
    if (mute) {
      setMute(false);
    }
  };

  const toggleMute = () => {
    Howler.mute(!mute);
    setMute(!mute);
  };

  const controlDisabled = settings.disabled || disabled;

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
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // |D To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  disabled: PropTypes.bool,
} as any;
