import * as React from 'react';
import { IMediaFile, MediaFile } from '@stoked-ui/media-selector';
import { useTimeline, WebFile } from "@stoked-ui/timeline";
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import OpenIcon from '@mui/icons-material/OpenInBrowser';
import IconButton from '@mui/material/IconButton';
import composeClasses from "@mui/utils/composeClasses";
import {useSlotProps} from '@mui/base/utils';
import {keyframes} from "@emotion/react";
import InputIcon from '@mui/icons-material/Input';
import OutputIcon from '@mui/icons-material/Output';
import {
  Fab,
  Popover,
  SpeedDial,
  SpeedDialAction,
  Stack,
  Tooltip,
  TooltipProps,
  Zoom,
  alpha,
  tooltipClasses
} from "@mui/material";
import useForkRef from "@mui/utils/useForkRef";
import {createUseThemeProps, styled} from '../internals/zero-styled';
import {EditorViewProps} from './EditorView.types';
import {getEditorViewUtilityClass} from "./editorViewClasses";
import {useEditorContext} from "../EditorProvider/EditorContext";
import Loader from "../Editor/Loader";
import EditorFile, { EditorFileType, SUVideoMime } from '../EditorFile/EditorFile';
import { initEditorAction } from "../EditorAction";

const useThemeProps = createUseThemeProps('MuiEditorView');

const useUtilityClasses = <R extends IMediaFile, Multiple extends boolean | undefined>(
  ownerState: EditorViewProps<R, Multiple>,
) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
  };

  return composeClasses(slots, getEditorViewUtilityClass, classes);
};

const EditorViewRoot = styled('div', {
  name: "MuiEditorView",
  slot: "root"
})<{ loading: boolean }>(({ loading }) => {
  const spin = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  `;
  const anim = `2.5s cubic-bezier(0.35, 0.04, 0.63, 0.95) 0s infinite normal none running ${spin}`;
  return {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  aspectRatio: 16 / 9,
  '& .lottie-canvas': {
    width: '1920px!important',
    height: '1080px!important'
  },
  '& #settings': {
    alignSelf: 'bottom'
  },

}});

const Renderer = styled('canvas', {
  name: "MuiEditorViewRenderer",
  slot: "renderer",
  shouldForwardProp: (prop) => prop !== 'viewMode',
})(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  position: 'absolute',
  left: 0,
  overflow: 'hidden',
  aspectRatio: 16 / 9,
  width: '100%',
  height: '100%',
  backgroundColor: theme.palette.background.default
}));

const Screener = styled('video', {
  name: "MuiEditorViewScreener",
  slot: "screener",
  shouldForwardProp: (prop) => prop !== 'viewMode',
})({
  display: 'none',
  flexDirection: 'column',
  width: '100%',
  position: 'absolute',
  left: 0,
  overflow: 'hidden',
  aspectRatio: 16 / 9,
  zIndex: 50,
});

const Stage = styled('div', {
  shouldForwardProp: (prop) => prop !== 'viewMode',
})(() => ({
  display: 'none',
  flexDirection: 'column',
  width: 'fit-content',
  position: 'absolute',
  left: 0,
  overflow: 'hidden',
  aspectRatio: 16 / 9,
  vIndex: 100,
}));

function Actions({ visible }: {visible: boolean}) {

  const { dispatch, file } = useEditorContext();

  const [fileIsDirty, setIsDirty] = React.useState<boolean>(false);
  React.useEffect(() => {
    const isFileDirty = async () => {
      const isDirty = await (file as EditorFile)?.isDirty();
      setIsDirty(isDirty);
    }

    isFileDirty().catch();

  }, [file])

  const saveHandler = async (embeded: boolean) => {
    if (!file) {
      return;
    }
    await file.save()
    console.info('file saved');
  }

  const saveEmbeddedHandler = async () => {
    await saveHandler(true);
  }

  const saveUrlRefsHandler = async () => {
    await saveHandler(false);
  }

  const openHandler = async () => {
    const input = document.createElement('input') as HTMLInputElement;
    input.type = 'file';

    async function handleFiles() {
      if (!input.files) {
        return;
      }
      const files = Array.from(input.files);
      if (files.length) {
        for (let i = 0; i < files.length; i += 1) {
          const clientFile = files[i];
          // eslint-disable-next-line no-await-in-loop
          const loadedFile = await WebFile.fromBlob<SUVideoMime, EditorFile<EditorFileType>>(clientFile);
          dispatch({ type: 'SET_FILE', payload: loadedFile });
        }
      }
    }
    input.addEventListener("change", handleFiles, false);

    input.click();
  }

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const actions = [
    { icon: <InputIcon />, name: 'Embedded', click: saveEmbeddedHandler },
    { icon: <OutputIcon />, name: 'Urls', click: saveUrlRefsHandler },
  ];

  return <Stack direction={'row'}>
    {fileIsDirty && visible &&
      <SpeedDial
        ariaLabel="Save"
        sx={{
          position: 'absolute',
          right: '88px',
          alignContent: 'top',
          margin: '8px',
          '& .MuiSpeedDialAction-staticTooltip': {
            maxWidth: 'none'
          }
        }}
        icon={<SaveIcon />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
        id={'save'}
        color={'standard'}
        direction={'down'}
        FabProps={{ size: 'small' }}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            tooltipOpen
            onClick={action.click}
            FabProps={{ size: 'small' }}
          />
        ))}
      </SpeedDial>
    }
    <Zoom in={visible} >
      <Fab
        id={'open'}
        aria-label="open"
        size="small"
        sx={{
          position: 'absolute',
          right: '48px',
          margin: '8px',
        }}
        onClick={openHandler}
      >
        <OpenIcon/>
      </Fab>
    </Zoom>
    <Zoom in={visible}>
      <Fab
        id={'settings'}
        aria-label="settings"
        size="small"
        sx={(theme) => ({
          position: 'absolute',
          right: '0px',
          margin: '8px',
        })}
        onClick={() => {
          dispatch({ type: 'PROJECT_DETAIL'});
        }}
      >
        <SettingsIcon/>
      </Fab>
    </Zoom>
  </Stack>
}
/**
 *
 * Demos:
 *
 * - [FileExplorer View](https://stoked-ui.github.io/editor/docs/)
 *
 * API:
 *
 * - [FileExplorer API](https://stoked-ui.github.io/editor/api/)
 */
const EditorView = React.forwardRef(function EditorView<
  R extends IMediaFile = IMediaFile,
  Multiple extends boolean | undefined = undefined,
>(
  inProps: EditorViewProps<R, Multiple>,
  ref: React.Ref<HTMLDivElement>
): React.JSX.Element {
  const editorContext = useEditorContext();
  const { id, file, engine, flags, dispatch } = editorContext;
  const isMobile = flags.includes('isMobile');

  const timelineContext = useTimeline();
  const props = useThemeProps({ props: inProps, name: 'MuiEditorView' });
  const viewRef = React.useRef<HTMLDivElement>(null);
  const combinedViewRef = useForkRef(ref , viewRef);

  const [showActions, setShowSettings] = React.useState<boolean>(false);
  const [showActionsPanel, setShowSettingsPanel] = React.useState<boolean>(false);
  const [, setViewerSize] = React.useState<{w: number, h: number}>({w: 0, h: 0});
  const viewerRef = React.useRef<HTMLDivElement>(null);
  const rendererRef = React.useRef<HTMLCanvasElement>(null);
  const screenerRef = React.useRef<HTMLVideoElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);


  React.useEffect(() => {
    if (engine && viewRef?.current) {
      engine.viewer = viewRef.current;
      if (viewRef.current.parentElement) {
        viewRef.current.id = `viewer-${id}`
        viewRef.current.classList.add(id);
      }
    }
  }, [viewRef, engine])

  // tie the renderer to the editor
  React.useEffect(() => {
    if (rendererRef.current && viewRef.current) {
      if (!rendererRef.current.id && viewRef.current.parentElement) {
        rendererRef.current.id = `renderer-${id}`
        rendererRef.current.classList.add(id);
      }
    }
  })

  // tie the renderer to the editor
  React.useEffect(() => {
    if (screenerRef.current && viewRef.current) {
      if (!screenerRef.current.id && viewRef.current.parentElement) {
        screenerRef.current.id = `screener-${id}`
        screenerRef.current.classList.add(id);
      }
    }
  })

  // tie the renderer to the editor
  React.useEffect(() => {
    if (stageRef.current && viewRef.current) {
      if (!stageRef.current.id && viewRef.current.parentElement) {
        stageRef.current.id = `stage-${id}`
        stageRef.current.classList.add(id);
      }
    }
  })

  const { slots, slotProps } = props;
  const classes = useUtilityClasses(props);

  const Root = slots?.root ?? EditorViewRoot;
  const rootProps = useSlotProps({
    elementType: Root,
    externalSlotProps: slotProps?.root,
    className: classes.root,
    ownerState: {...props, ref: viewRef }
  });

  // if the viewer resizes make the renderer match it
  React.useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let i = 0; i < entries.length; i += 1){
        const entry = entries[i];
        if (entry.target === viewerRef.current) {
          setViewerSize({w: entry.contentRect.width, h: entry.contentRect.height});
          if (rendererRef.current) {
            rendererRef.current.width = entry.contentRect.width;
            rendererRef.current.height = entry.contentRect.height;
            rendererRef.current.style.top = `-${rendererRef.current.height}px`;
          }
        }
      }
    });
    return () => {
      resizeObserver.disconnect()
    }
  }, [viewerRef]);

  function handleClose() {

    setShowSettingsPanel(false);
  }
  return (
    <Root role={'viewer'}
                {...rootProps}
                ref={combinedViewRef}
                data-preserve-aspect-ratio
                onMouseEnter={() => {
                  setShowSettings(true)

                }}
                onMouseLeave={() => {
                  setShowSettings(false)
                }}
    >

      <Renderer role={'renderer'} style={{backgroundColor: file?.backgroundColor}} ref={rendererRef}
                data-preserve-aspect-ratio/>
      <Screener role={'screener'} ref={screenerRef} />
      <Loader />
      <Stage role={'stage'} ref={stageRef}/>
      <Actions visible={showActions} />
    </Root>
  )
})

export default EditorView;
