import * as React from 'react';
import { MediaFile } from '@stoked-ui/media-selector';
import {getTrackController, IController, ITimelineTrack, TimelineState, ITimelineAction, ViewMode} from "@stoked-ui/timeline";
import composeClasses from "@mui/utils/composeClasses";
import {emphasize, styled, useThemeProps, alpha} from '@mui/material/styles';
import {useSlotProps} from "@mui/base/utils";
import {Typography} from "@mui/material";
import ToggleButton from "@mui/material/ToggleButton";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import {EditorLabelsProps} from './EditorLabels.types';
import {EditorLabelsClasses, getEditorLabelsUtilityClass} from "./editorLabelsClasses";


const useUtilityClasses = (
  ownerState: EditorLabelsProps,
) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
    label: ['label']
  };

  return composeClasses(slots, getEditorLabelsUtilityClass, classes);
};

const EditorLabelsRoot = styled('div', {
  name: 'MuiEditorLabels',
  slot: 'root',
  overridesResolver: (props, styles) => styles.icon,
})(() => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: '42px',
  flex: '0 1 auto',
  overflow: 'overlay',
}));

const EditorLabelRoot = styled('div', {
  name: 'MuiEditorLabel',
  slot: 'Label',
  overridesResolver: (props, styles) => styles.icon,
  shouldForwardProp: (prop) => prop !== 'lock',
})(() => ({
  height: '32px',
  paddingLeft: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: '4px',

}));

const ToggleButtonGroupStyled = styled(ToggleButtonGroup)(({theme})=> {
  return ({
    background: theme.palette.background.default,
    '& .MuiButtonBase-root': {
      color: theme.palette.text.primary,
      padding: '4px!important',
      '&:hover': {
        color: theme.palette.primary.main,
        background: theme.palette.background.default,
        border: `1px solid ${theme.palette.text.primary}`,
      },
    },
  })
})

const EditorLabelContainer = styled('div', {
  name: 'MuiEditorLabelContainer',
  slot: 'container',
  overridesResolver: (props, styles) => styles.icon,
  shouldForwardProp: (prop) => prop !== 'lock',

})<{ lock?: boolean, color: string, selected: boolean, hidden: boolean}>(({ theme, color }) => ({
  color: theme.palette.text.primary,
  borderTopLeftRadius: '4px',
  borderBottomLeftRadius: '4px',
  borderBottom: `1px solid ${theme.palette.background.default}`,
  width: '250px',
  display: 'flex',
  alignItems: 'center',
  paddingLeft: '6px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  textWrap: 'nowrap',
  flexGrow: '1',
  variants: [{
    props: {
      hidden: true
    },
    style: {
      opacity: '.4'
    }
  },{
    props: {
      lock: true
    },
    style: {
      backgroundImage: `linear-gradient(to bottom, transparent 50%, #28487d 50%), linear-gradient(to right, #617ca2 50%, #28487d 50%);`,
      backgroundSize: `5px 5px, 5px 5px`,
      /* background: lockedBg,
       '& .timeline-editor-action': {
       background: emphasize(theme.palette.background.default, 0.24)
       } */
    }
  },{
    props: { selected: true},
    style: {
      // background: `linear-gradient(to right, ${emphasize(theme.palette.background.default,
      // 0.12)}, 0%, ${alpha(color, .8)}, 70%, ${alpha(color, 0.3)})`,
      backgroundColor: 'red',
      border: `1px solid ${theme.palette.text.primary}`,

    }
  },{
    props: { selected: false },
    style: {
      background: `linear-gradient(to right,${alpha(color, (theme.palette.mode === 'dark' ? .8 : .62))}, 70%, ${alpha(color, theme.palette.action.focusOpacity)})`,
    }
  }]
}));

const EditorLabelText = styled('div', {
  name: 'MuiEditorLabelText',
  slot: 'label',
  overridesResolver: (props, styles) => styles.icon,
})(({ theme }) => ({
  '& span': {
    color: theme.palette.text.primary,
  },
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  paddingLeft: '6px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  textWrap: 'nowrap',
  flexGrow: '1'
}));

const EditorLabel = React.forwardRef(
  function EditorLabel(inProps: {
      track: ITimelineTrack,
      tracks: ITimelineTrack[],
      classes: EditorLabelsClasses,
      controller?: IController,
      setTracks: (updatedTracks: ITimelineTrack[]) => void,
      timelineState: React.RefObject<TimelineState>,
      onClick: (event: Event) => void,
      selectedFile: ITimelineAction | null,
      setSelectedFile:  React.Dispatch<React.SetStateAction<ITimelineAction | null>>,
      anchorEl: HTMLElement | null,
      setAnchorEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>,
      viewMode: ViewMode
    },
    ref: React.Ref<HTMLDivElement>
  ): React.JSX.Element {
    const { track, tracks, classes, controller, setSelectedFile, selectedFile, setAnchorEl, anchorEl, viewMode } = inProps;
    const visibilityIcon = track.hidden ? <VisibilityOffIcon fontSize={'small'} /> : <VisibilityIcon fontSize={'small'} />;
    const lockIcon = track.lock ? <LockIcon fontSize={'small'}/> : <LockOpenIcon fontSize={'small'}/>;

    const handleItemClick = (file: ITimelineAction, event: React.MouseEvent<HTMLElement>) => {
      setSelectedFile(file);
      setAnchorEl(event.currentTarget);
    }

    const handleClose = () => {
      setAnchorEl(null);
      setSelectedFile(null);
    }
    const trackFile = track.actions && track.actions[0] ? track.actions[0] : undefined;

    return (
      <EditorLabelRoot key={track.id} className={classes.label} ref={ref}>
        <EditorLabelContainer color={controller?.color ?? '#0000'} lock={track.lock} hidden={!!track.hidden} selected={!!track.selected}>
          <EditorLabelText
            onClick={(e) => trackFile ? handleItemClick(trackFile, e) : undefined}
          >
            <Typography variant="button" color="text.secondary" >{track.name}</Typography>
          </EditorLabelText>
          {viewMode === 'Renderer' && <ToggleButtonGroupStyled
            exclusive
            aria-label="text alignment"
          >
            <ToggleButton
              id={`${track.id}-hidden`}
              value={track.hidden ?? false}
              onChange={(e, ) => {
                const currentTrackIndex = tracks.findIndex((currTrack) =>
                  currTrack.id === e.currentTarget.id.replace('-hidden', ''))
                if (currentTrackIndex === -1) {
                  return
                }
                const currentTrack = {...tracks[currentTrackIndex]};
                currentTrack.hidden = !currentTrack.hidden;
                const updatedTracks = [...tracks];
                updatedTracks[currentTrackIndex] = currentTrack;
                inProps.setTracks(updatedTracks)
              }}
              aria-label="hidden"
              size={'small'}>
              {visibilityIcon}
            </ToggleButton>
            <ToggleButton
              id={`${track.id}-lock`}
              value={track.lock ?? false}
              aria-label="lock"
              size={'small'}
              onChange={(e, ) => {
                const currentTrackIndex = tracks.findIndex((currTrack) => currTrack.id === e.currentTarget.id.replace('-lock', ''))
                if (currentTrackIndex === -1) {
                  return
                }
                const currentTrack = {...tracks[currentTrackIndex]};
                currentTrack.lock = !currentTrack.lock;
                currentTrack.actions.forEach((updateAction) => {
                  updateAction.movable = !currentTrack.lock;
                  updateAction.flexible = !currentTrack.lock;
                })
                const updatedTracks = [...tracks];
                updatedTracks[currentTrackIndex] = currentTrack;
                inProps.setTracks(updatedTracks)
              }}
            >
              {lockIcon}
            </ToggleButton>
          </ToggleButtonGroupStyled>}
        </EditorLabelContainer>
      </EditorLabelRoot>
    );
  }
)
/**
 *
 * Demos:
 *
 * - [EditorLabels](https://stoked-ui.github.io/timeline/docs/)
 *
 * API:
 *
 * - [EditorLabels](https://stoked-ui.github.io/timeline/api/)
 */
const EditorLabels = React.forwardRef(
  function EditorLabels(inProps: EditorLabelsProps, ref: React.Ref<HTMLDivElement>): React.JSX.Element {
    const { tracks, slots, sx, timelineState, controllers } = useThemeProps({ props: inProps, name: 'MuiEditorLabels' });
    const [selectedFile, setSelectedFile] = React.useState<ITimelineAction | null>(null);
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

    const classes = useUtilityClasses(inProps);

    const Root = slots?.root ?? EditorLabelsRoot;

    const { slotProps } = inProps;
    const rootProps = useSlotProps({
      elementType: Root,
      externalSlotProps: slotProps?.root,
      className: classes.root,
      ownerState: inProps,
    });

    const handleItemClick = (file: ITimelineAction, event: React.MouseEvent<HTMLElement>) => {
      setSelectedFile(file);
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
      setSelectedFile(null);
    };

    return (
      <Root
        {...rootProps}
        style={{ overflow: 'overlay' }}
        onScroll={(scrollEvent:  React.UIEvent<HTMLDivElement, UIEvent>) => {
          timelineState.current?.setScrollTop((scrollEvent.target as HTMLDivElement).scrollTop);
        }}
        sx={sx}
        classes={classes}
        className={`${classes.root} timeline-list`}>
        {tracks?.map((track) => {
          if (!track) {
            return undefined;
          }
          const controller = controllers ? getTrackController(track, controllers) : undefined;
          const extraProps = {
            anchorEl,
            setAnchorEl,
            selectedFile,
            setSelectedFile
          };
          return <EditorLabel
            track={track}
            viewMode={inProps.viewMode}
            tracks={tracks}
            classes={classes}
            key={track.id}
            controller={controller}
            setTracks={inProps.setTracks}
            timelineState={timelineState}
            onClick={(e) => {
              handleItemClick(track.actionRef, e as unknown as React.MouseEvent<HTMLElement>);
            }}
            {...extraProps}
          />
        })}
       {/*  {(selectedFile && anchorEl) && (
          <FileDetail
            action={selectedFile}
            anchorEl={anchorEl}
            onClose={handleClose}
          />
        )} */}
        {/* <Box sx={(theme) => ({ display: 'flex', height: 18, background: alpha(theme.palette.background.default, .4)})} >
          <Typography variant='caption' sx={(theme) => ({ textTransform: 'uppercase', padding: '0 6px', color: `${alpha(theme.palette.text.primary,.2)}`})}>Duration: {timelineState.current?.engine.duration}</Typography>
        </Box> */}
      </Root>
    )
  })

export default EditorLabels;

