import * as React from 'react';
import {FileBase} from '@stoked-ui/file-explorer';
import {ViewMode} from "@stoked-ui/timeline";
import composeClasses from "@mui/utils/composeClasses";
import {useSlotProps} from '@mui/base/utils';
import useForkRef from "@mui/utils/useForkRef";
import {createUseThemeProps, styled} from '../internals/zero-styled';
import {EditorViewProps} from './EditorView.types';
import {getEditorViewUtilityClass} from "./editorViewClasses";

const useThemeProps = createUseThemeProps('MuiEditorView');

const useUtilityClasses = <R extends FileBase, Multiple extends boolean | undefined>(
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
})(() => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  aspectRatio: 16 / 9,
  '& .lottie-canvas': {
    width: '1920px!important',
    height: '1080px!important'
  }
}));

const Renderer = styled('canvas', {
  name: "MuiEditorViewRenderer",
  slot: "renderer",
  shouldForwardProp: (prop) => prop !== 'viewMode',
})<{ viewMode?: ViewMode }>(({  viewMode }) => ({
  display: viewMode === 'Renderer' ? 'flex' : 'none',
  flexDirection: 'column',
  position: 'absolute',
  left: 0,
  overflow: 'hidden',
  aspectRatio: 16 / 9,
  width: '100%',
  height: '100%'
/*   background: `repeating-linear-gradient(
    45deg,
    rgba(0, 0, 0, 0.2),
    rgba(0, 0, 0, 0.2) 10px,
    rgba(0, 0, 0, 0.3) 10px,
    rgba(0, 0, 0, 0.3) 20px
  ),
  url(http://s3-us-west-2.amazonaws.com/s.cdpn.io/3/old_map_@2X.png)` */
}));

const Screener = styled('video', {
  name: "MuiEditorViewScreener",
  slot: "screener",
  shouldForwardProp: (prop) => prop !== 'viewMode',
})<{ viewMode?: ViewMode }>(({  viewMode }) => ({
  display: viewMode === 'Screener' ? 'flex' : 'none',
  flexDirection: 'column',
  width: '100%',
  position: 'absolute',
  left: 0,
  overflow: 'hidden',
  aspectRatio: 16 / 9,
  zIndex: 50,
}));

const Stage = styled('div', {
  shouldForwardProp: (prop) => prop !== 'viewMode',
})<{ viewMode?: ViewMode }>(({  viewMode }) => ({
  display: viewMode === 'Edit' ? 'flex' : 'none',
  flexDirection: 'column',
  width: 'fit-content',
  position: 'absolute',
  left: 0,
  overflow: 'hidden',
  aspectRatio: 16 / 9,
  vIndex: 100,
}));

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
export const EditorView = React.forwardRef(function EditorView<
  R extends FileBase = FileBase,
  Multiple extends boolean | undefined = undefined,
>(inProps: EditorViewProps<R, Multiple>, ref: React.Ref<HTMLDivElement>): React.JSX.Element {
  const props = useThemeProps({ props: inProps, name: 'MuiEditorView' });
  const viewRef = React.useRef<HTMLDivElement>(null);
  const combinedViewRef = useForkRef(ref , viewRef);

  const [, setViewerSize] = React.useState<{w: number, h: number}>({w: 0, h: 0});
  const viewerRef = React.useRef<HTMLDivElement>(null);
  const rendererRef = React.useRef<HTMLCanvasElement>(null);
  const screenerRef = React.useRef<HTMLVideoElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);


  React.useEffect(() => {
    if (inProps.engine && viewRef?.current) {
      inProps.engine.viewer = viewRef.current;
      if (viewRef.current.parentElement && viewRef.current.parentElement.id) {
        viewRef.current.id = `viewer-${viewRef.current.parentElement.id}`
        viewRef.current.classList.add(viewRef.current.parentElement.id);
      }
    }
  }, [viewRef, inProps.engine])

  // tie the renderer to the editor
  React.useEffect(() => {
    if (rendererRef.current && viewRef.current) {
      if (!rendererRef.current.id && viewRef.current.parentElement) {
        rendererRef.current.id = `renderer-${viewRef.current.parentElement.id}`
        rendererRef.current.classList.add(viewRef.current.parentElement.id);
      }
    }
  })

  // tie the renderer to the editor
  React.useEffect(() => {
    if (screenerRef.current && viewRef.current) {
      if (!screenerRef.current.id && viewRef.current.parentElement) {
        screenerRef.current.id = `screener-${viewRef.current.parentElement.id}`
        screenerRef.current.classList.add(viewRef.current.parentElement.id);
      }
    }
  })

  // tie the renderer to the editor
  React.useEffect(() => {
    if (stageRef.current && viewRef.current) {
      if (!stageRef.current.id && viewRef.current.parentElement) {
        stageRef.current.id = `stage-${viewRef.current.parentElement.id}`
        stageRef.current.classList.add(viewRef.current.parentElement.id);
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
    ownerState: {...props, ref: viewRef },
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


  return (
    <Root role={'viewer'} {...rootProps} ref={combinedViewRef} data-preserve-aspect-ratio>
      <Renderer role={'renderer'} ref={rendererRef} data-preserve-aspect-ratio viewMode={inProps.engine?.viewMode || 'Renderer'}/>
      <Screener role={'screener'} ref={screenerRef} viewMode={inProps.engine?.viewMode || 'Renderer'} />
      <Stage role={'stage'} ref={stageRef} viewMode={inProps.engine?.viewMode || 'Renderer'}  />
    </Root>
  )
})

