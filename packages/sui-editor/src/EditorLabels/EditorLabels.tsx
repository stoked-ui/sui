import * as React from 'react';
import {getTrackController, IController, ITimelineTrack, TimelineState, ITimelineAction, ViewMode} from "@stoked-ui/timeline";
import composeClasses from "@mui/utils/composeClasses";
import AddIcon from '@mui/icons-material/Add';
import {styled, useThemeProps, alpha, Theme} from '@mui/material/styles';
import {useSlotProps} from "@mui/base/utils";
import {Box, IconButton, Tooltip, Typography} from "@mui/material";
import ToggleButton from "@mui/material/ToggleButton";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import {EditorLabelsProps} from './EditorLabels.types';
import {EditorLabelsClasses, getEditorLabelsUtilityClass} from "./editorLabelsClasses";
import DetailView from '../DetailView/DetailView'
import FeatureSnap from "stokedui-com/src/icons/FeatureSnap";
import EdgeSnap from "stokedui-com/src/icons/EdgeSnap";
import SvgIcon from "@mui/material/SvgIcon";
import TimelineView from "../icons/TimelineView";
import MediaFile from 'packages/sui-media-selector/build/MediaFile';
// import EditorFile from "../DetailView/DetailVideoView.types";

const useUtilityClasses = (
  ownerState: EditorLabelsProps,
) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
    label: ['label'],
    template: ['template'],
    container: ['container']
  };

  return composeClasses(slots, getEditorLabelsUtilityClass, classes);
};

const EditorLabelsRoot = styled('div', {
  name: 'MuiEditorLabels',
  slot: 'root',
  overridesResolver: (props, styles ) => styles.icon,
})(({theme} ) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: '0 1 auto',
  overflow: 'overlay',
  cursor: 'pointer',
  '& .MuiEditorLabels-template .label': {
    color: theme.palette.action.disabled,
  },
  '& .MuiEditorLabels-template:hover': {
    '.label': {
      color: theme.palette.text.primary,
    },
  },
}));

const EditorLabelToolbar = styled('div', {
  name: 'MuiEditorLabels',
  slot: 'toolbar',
  overridesResolver: (props, styles ) => styles.icon,
})(({theme} ) => ({
  display: 'flex',
  flexDirection: 'row',
  marginTop: '32px',
  flex: '0 1 auto',
  overflow: 'overlay',
}));

const EditorLabelRoot = styled('div', {
  name: 'MuiEditorLabels',
  slot: 'label',
  overridesResolver: (props, styles) => styles.icon,
  shouldForwardProp: (prop) => prop !== 'lock',
})(() => {
  return ({
    height: '32px',
    paddingLeft: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: '4px',
  })
});

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
  name: 'MuiEditorLabels',
  slot: 'container',
  overridesResolver: (props, styles) => styles.icon,
  shouldForwardProp: (prop) => prop !== 'lock' && prop !== 'track',
})<{ lock?: boolean, color: string, selected?: boolean, hidden?: boolean, track?: ITimelineTrack}>
(({ theme, color, track, selected, hidden }) => {
  const endColor = alpha(color, selected ? .3 : theme.palette.action.focusOpacity);
  const getFirstColor = () => {
    if (selected) {
      return color;
    }
    return alpha(color, (theme.palette.mode === 'dark' ? .8 : .62));
  }
  const firstGradientColor = getFirstColor();
  return {
    color: ((track?.selected ?? false) ? theme.palette.text.primary : theme.palette.text.secondary),
    borderTopLeftRadius: '4px',
    borderBottomLeftRadius: '4px',
    borderBottom: `1px solid ${theme.palette.background.default}`,
    width: '250px',
    display: 'flex',
    height: '31px',
    alignItems: 'center',
    paddingLeft: '6px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textWrap: 'nowrap',
    flexGrow: '1',
    background: `linear-gradient(to right,${firstGradientColor}, 70%, ${endColor})`,
    '&:hover': {
      background: `linear-gradient(to right,${color}, 70%, ${endColor})`,
    },
    variants: [{
      props: {
        hidden: true
      },
      style: {
        opacity: '.4'
      }
    }]
  }
});

const EditorLabelText = styled('div', {
  name: 'MuiEditorLabels',
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
  flexGrow: '1',
  userSelect: 'none',
}));

const EditorLabel = React.forwardRef(
  function EditorLabel(inProps: {
      track: ITimelineTrack,
      tracks: ITimelineTrack[],
      classes: EditorLabelsClasses,
      controller?: IController,
      setTracks: (updatedTracks: ITimelineTrack[]) => void,
      onClick: (track: ITimelineTrack, event: React.MouseEvent<HTMLDivElement>) => void,
      viewMode: ViewMode,
      hideLock?: boolean
    },
    ref: React.Ref<HTMLDivElement>
  ): React.JSX.Element {
    const { track, tracks, classes, controller, viewMode, onClick } = inProps;
    const visibilityIcon = track.hidden ? <VisibilityOffIcon fontSize={'small'} /> : <VisibilityIcon fontSize={'small'} />;
    const lockIcon = track.lock ? <LockIcon fontSize={'small'}/> : <LockOpenIcon fontSize={'small'}/>;
    const toggleClick = (event: React.MouseEvent<HTMLElement, MouseEvent>, value: any) => {
      event.stopPropagation();
    }
    return (
      <EditorLabelRoot key={track.id} className={classes.label} ref={ref}>

        <EditorLabelContainer
          className={classes.container}
          color={controller?.color ?? '#8882'}
          track={track}
          lock={track.lock}
          hidden={!!track.hidden}
          selected={!!track.selected}
          onClick={(event) => {
            onClick(track, event)
          }}
        >
          {track.id === 'newTrack' &&
           <IconButton sx={{ borderRadius: '24px', width: '24px', height: '24px' }} size={'small'}>
            <AddIcon />
          </IconButton>}
          <EditorLabelText>
            <Typography variant="button" color="text.secondary" >{track.name}</Typography>
          </EditorLabelText>
          {track.id !== 'newTrack' && <ToggleButtonGroupStyled
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
              onClick={toggleClick}
              aria-label="hidden"
              size={'small'}>
              {visibilityIcon}
            </ToggleButton>
            {!inProps.hideLock && <ToggleButton
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
              onClick={toggleClick}
            >
              {lockIcon}
            </ToggleButton>}
          </ToggleButtonGroupStyled>}
        </EditorLabelContainer>
      </EditorLabelRoot>
    );
  }
)


const ToolbarGroup  = styled(ToggleButtonGroup, {
  name: 'MuiEditorLabels',
  slot: 'toolbar',
  overridesResolver: (props, styles) => styles.icon,
})(({ theme }) => ({
  background: 'unset!important',
  backgroundColor: 'unset!important',
  border: 'unset!important',
  '&:hover': {
    background: 'unset!important',
    backgroundColor: 'unset!important',
    border: 'unset!important',
    '& svg': {
      strokeWidth: '20px',
      '&:hover': {
        strokeWidth: '40px'
      }
    }
  },
  '& button': {
    background: 'unset!important',
    backgroundColor: 'unset!important',
    border: 'unset!important',
    '&:hover': {
      background: 'unset!important',
      backgroundColor: 'unset!important',
      border: 'unset!important',
    }
  }
}))

const ToolbarToggle = styled(ToggleButton)(() => ({
  background: 'unset',
  backgroundColor: 'unset',
}))

export function Toolbar({view, setView}: {view: 'timeline' | 'files', setView: (newView: 'timeline' | 'files') => void }) {
  const selectedColor = (theme: Theme) => theme.palette.mode === 'light' ? '#FFF' : '#000';
  const sxButton = (theme: Theme) => {
    return {
      borderRadius: '0px!important',
      border: `2px solid ${selectedColor(theme)}!important`,

    }};

  return <ToolbarGroup
    sx={(theme) => ({
      backgroundColor: theme.palette.text.primary,
      alignItems: 'center',
      margin: '0px 6px',
      '& .MuiButtonBase-root': {
        backgroundColor: 'transparent',
        color: theme.palette.text.primary,
        border: `2px solid ${selectedColor(theme)}!important`,
        '&:hover': {
          color: theme.palette.primary.main,
          backgroundColor: theme.palette.background.default,
          border: `2px solid ${alpha(selectedColor(theme), .5)}!important`,
        },
      },
      '& MuiButtonBase-root.MuiToggleButtonGroup-grouped.MuiToggleButtonGroup-groupedHorizontal.MuiToggleButton-root.Mui-selectedMuiToggleButton-sizeSmall.MuiToggleButton-standard':{
        border: `2px solid ${selectedColor(theme)}!important`,
        '&:hover': {
          border: `2px solid ${alpha(selectedColor(theme), .5)}!important`,
        },
      }
    })}
    value={view}
    exclusive
    onChange={(event, newView) => {
      if (!newView) {
        newView = view === 'timeline' ? 'files' : 'timeline';
      }
      setView(newView)
    }}
    size={'small'}
    aria-label="text alignment"
  >
   <Tooltip title={"Snap to Edge"}>
     <ToolbarToggle sx={sxButton} value="edgeSnap" aria-label="lock">
       <EdgeSnap/>
     </ToolbarToggle>
   </Tooltip>
   <Tooltip title={"Snap to Feature"} sx={{position: 'absolute'}}>
     <ToolbarToggle sx={sxButton} value="featureSnap">
       <FeatureSnap />
     </ToolbarToggle>
   </Tooltip>
  </ToolbarGroup>
}

const ViewGroup = styled(ToggleButtonGroup)(() => ({
  background: 'unset!important',
  backgroundColor: 'unset!important',
  border: 'unset!important',
  '&:hover': {
    background: 'unset!important',
    backgroundColor: 'unset!important',
    border: 'unset!important',
    '& svg': {
      strokeWidth: '20px',
      '&:hover': {
        strokeWidth: '40px'
      }
    }
  },
  '& button': {
    background: 'unset!important',
    backgroundColor: 'unset!important',
    border: 'unset!important',
    '&:hover': {
      background: 'unset!important',
      backgroundColor: 'unset!important',
      border: 'unset!important',
    }
  }
}))

const ViewButton = styled(ToggleButton)(() => ({
  background: 'unset',
  backgroundColor: 'unset',
}))

export function ViewToggle({view, setView}: {view: 'timeline' | 'files', setView: (newView: 'timeline' | 'files') => void }) {
  const selectedColor = (theme: Theme) => theme.palette.mode === 'light' ? '#FFF' : '#000';
  const sxButton = (theme: Theme) => {
    return {
      borderRadius: '0px!important',
      border: `2px solid ${selectedColor(theme)}!important`,

    }};

  return <ViewGroup
    sx={(theme) => ({
      backgroundColor: theme.palette.text.primary,
      alignItems: 'center',
      margin: '0px 6px',
      '& .MuiButtonBase-root': {
        backgroundColor: 'transparent',
        color: theme.palette.text.primary,
        border: `2px solid ${selectedColor(theme)}!important`,
        '&:hover': {
          color: theme.palette.primary.main,
          backgroundColor: theme.palette.background.default,
          border: `2px solid ${alpha(selectedColor(theme), .5)}!important`,
        },
      },
      '& MuiButtonBase-root.MuiToggleButtonGroup-grouped.MuiToggleButtonGroup-groupedHorizontal.MuiToggleButton-root.Mui-selectedMuiToggleButton-sizeSmall.MuiToggleButton-standard':{
        border: `2px solid ${selectedColor(theme)}!important`,
        '&:hover': {
          border: `2px solid ${alpha(selectedColor(theme), .5)}!important`,
        },
      }
    })}
    value={view}
    exclusive
    onChange={(event, newView) => {
      if (!newView) {
        newView = view === 'timeline' ? 'files' : 'timeline';
      }
      setView(newView)
    }}
    size={'small'}
    aria-label="text alignment"
  >

    {view === 'timeline' &&
     <Tooltip title={"Switch to Files View"}>
       <ViewButton sx={sxButton} value="files" aria-label="lock">
         <SvgIcon  fontSize={'small'}>
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="46.057 64.188 404.091 497.187" width="404.091" height="497.187">
             <path d="M 409.103 64.188 L 197.159 64.188 C 174.513 64.188 156.111 82.603 156.111 105.232 L 156.111 119.2 L 142.132 119.2 C 119.502 119.2 101.068 137.598 101.068 160.243 L 101.068 174.259 L 87.121 174.259 C 64.491 174.259 46.057 192.677 46.057 215.304 L 46.057 520.326 C 46.057 542.955 64.492 561.375 87.121 561.375 L 299.05 561.375 C 321.696 561.375 340.11 542.955 340.11 520.326 L 340.11 506.347 L 354.078 506.347 C 376.708 506.347 395.137 487.93 395.137 465.284 L 395.137 451.323 L 409.105 451.323 C 431.735 451.323 450.148 432.904 450.148 410.274 L 450.148 105.232 C 450.146 82.603 431.733 64.188 409.103 64.188 Z M 307.34 520.326 C 307.34 524.895 303.613 528.604 299.05 528.604 L 87.121 528.604 C 82.554 528.604 78.827 524.895 78.827 520.326 L 78.827 215.303 C 78.827 210.739 82.554 207.028 87.121 207.028 L 299.05 207.028 C 303.614 207.028 307.34 210.739 307.34 215.303 L 307.34 520.326 Z M 362.35 465.284 C 362.35 469.868 358.645 473.579 354.077 473.579 L 340.109 473.579 L 340.109 215.303 C 340.109 192.676 321.696 174.258 299.049 174.258 L 133.837 174.258 L 133.837 160.243 C 133.837 155.659 137.564 151.954 142.132 151.954 L 354.077 151.954 C 358.645 151.954 362.35 155.659 362.35 160.243 L 362.35 465.284 Z M 417.377 410.274 C 417.377 414.841 413.672 418.547 409.104 418.547 L 395.136 418.547 L 395.136 160.243 C 395.136 137.597 376.707 119.2 354.077 119.2 L 188.863 119.2 L 188.863 105.232 C 188.863 100.665 192.59 96.96 197.159 96.96 L 409.103 96.96 C 413.671 96.96 417.376 100.665 417.376 105.232 L 417.376 410.274 L 417.377 410.274 Z M 137.35 292.584 L 222.587 292.584 C 231.629 292.584 238.985 285.25 238.985 276.191 C 238.985 267.14 231.629 259.815 222.587 259.815 L 137.35 259.815 C 128.314 259.815 120.956 267.14 120.956 276.191 C 120.957 285.251 128.314 292.584 137.35 292.584 Z M 248.816 325.393 L 137.35 325.393 C 128.314 325.393 120.956 332.729 120.956 341.784 C 120.956 350.838 128.313 358.163 137.35 358.163 L 248.816 358.163 C 257.874 358.163 265.193 350.838 265.193 341.784 C 265.193 332.729 257.874 325.393 248.816 325.393 Z M 248.816 390.963 L 137.35 390.963 C 128.314 390.963 120.956 398.282 120.956 407.34 C 120.956 416.393 128.313 423.717 137.35 423.717 L 248.81 423.717 C 257.868 423.717 265.187 416.393 265.187 407.34 C 265.193 398.283 257.874 390.963 248.816 390.963 Z M 248.816 456.52 L 137.35 456.52 C 128.314 456.52 120.956 463.838 120.956 472.895 C 120.956 481.949 128.313 489.289 137.35 489.289 L 248.816 489.289 C 257.874 489.289 265.193 481.949 265.193 472.895 C 265.193 463.838 257.874 456.52 248.816 456.52 Z" fill="currentColor"/>
           </svg>
         </SvgIcon>
       </ViewButton>
     </Tooltip>
    }
    {view === 'files' &&
     <Tooltip title={"Switch to Timeline View"} sx={{position: 'absolute'}}>
       <ViewButton sx={sxButton} value="timeline">
         <TimelineView fontSize={'small'}/>
       </ViewButton>
     </Tooltip>
    }

  </ViewGroup>
}
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
    const { engineRef, tracks, setTracks, onAddFiles, hideLock = false } = inProps;
    const { slots, sx, controllers } = useThemeProps({ props: inProps, name: 'MuiEditorLabels' });
    const [selectedTrack, setSelectedTrack] = React.useState<ITimelineTrack | null>(null);
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const detailViewRef = React.useRef<HTMLDivElement>();

    const classes = useUtilityClasses(inProps);
    const Root = slots?.root ?? EditorLabelsRoot;
    const { slotProps } = inProps;

    const rootProps = useSlotProps({
      elementType: Root,
      externalSlotProps: slotProps?.root,
      className: classes.root,
      ownerState: inProps,
    });

    const newTrackClick = () => {
      const input = document.createElement('input') as HTMLInputElement;
      input.type = 'file';
      input.onchange =  async (ev) => {
        const files =  await MediaFile.from(ev)
        console.info('files', files);
        onAddFiles?.(files);
      }
      input.click();
    }
    const handleItemClick = (t: ITimelineTrack, event: React.MouseEvent<HTMLElement>) => {
      if (t.id === 'newTrack') {
        newTrackClick();
        return;
      }
      if (engineRef.current) {
        engineRef.current.selected = {...t};
        if (!engineRef.current?.detailMode) {
          setSelectedTrack(t);
          setAnchorEl(event.currentTarget);
        }
      }
    };

    const handleClose = () => {
      if (engineRef.current?.detailMode) {
        engineRef.current.detailMode = false;
      }
      setAnchorEl(null);
      setSelectedTrack(null);
    };

    return (
      <Root
        {...rootProps}
        style={{ overflow: 'overlay' }}
        onScroll={(scrollEvent:  React.UIEvent<HTMLDivElement, UIEvent>) => {
          // timelineState.current?.setScrollTop((scrollEvent.target as HTMLDivElement).scrollTop);
          // timelineState.current?.setScrollTop((scrollEvent.target as HTMLDivElement).scrollTop);
        }}
        sx={sx}
        classes={classes}
        className={`${classes.root} timeline-list`}>
        <Box sx={{height: '37px'}}></Box>
        {tracks?.map((track) => {
          if (!track) {
            return undefined;
          }
          const controller = controllers ? getTrackController(track, controllers) : undefined;

          return <EditorLabel
            track={track}
            viewMode={inProps.viewMode}
            hideLock={inProps.hideLock}
            tracks={tracks}
            classes={classes}
            key={track.id}
            controller={controller}
            setTracks={inProps.setTracks}
            onClick={handleItemClick}
          />
        })}
       {(selectedTrack && anchorEl && engineRef.current && !inProps.detailMode) && (
          <DetailView
            engine={engineRef.current}
            anchorEl={anchorEl}
            onClose={handleClose}
            tracks={tracks}
          />
        )}
      </Root>
    )
  })

export default EditorLabels;

