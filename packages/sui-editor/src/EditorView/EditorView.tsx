import * as React from 'react';
import {FileBase} from '@stoked-ui/file-explorer';
import composeClasses from "@mui/utils/composeClasses";
import {useSlotProps} from '@mui/base/utils';
import {createUseThemeProps, styled} from '../internals/zero-styled';
import {EditorViewProps} from './EditorView.types';
import {getEditorViewUtilityClass} from "./editorViewClasses";
import useForkRef from "@mui/utils/useForkRef";

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
})(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  aspectRatio: 16 / 9,
}));

const EditorViewRenderer = styled('canvas', {
  name: "MuiEditorViewRenderer",
  slot: "renderer"
})(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  position: 'absolute',
  left: 0,
  overflow: 'hidden',
  aspectRatio: 16 / 9,
/*   background: `repeating-linear-gradient(
    45deg,
    rgba(0, 0, 0, 0.2),
    rgba(0, 0, 0, 0.2) 10px,
    rgba(0, 0, 0, 0.3) 10px,
    rgba(0, 0, 0, 0.3) 20px
  ),
  url(http://s3-us-west-2.amazonaws.com/s.cdpn.io/3/old_map_@2X.png)` */
}));

const EditorViewPreview = styled('div', {
  name: "MuiEditorViewPreview",
  slot: "preview"
})(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  aspectRatio: 16 / 9,
  position: 'relative',
  overflow: 'hidden',
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

  const [viewerSize, setViewerSize] = React.useState<{w: number, h: number}>({w: 0, h: 0});
  const viewerRef = React.useRef<HTMLDivElement>(null);
  const rendererRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (inProps.engine.current && viewRef?.current) {
      inProps.engine.current.viewer = viewRef.current;
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

  // tie the viewer to the editor
  React.useEffect(() => {
    if (viewerRef.current && viewRef.current) {
      if (!viewerRef.current.id && viewRef.current.parentElement) {
        viewerRef.current.id = `preview-${viewRef.current.parentElement.id}`
        viewerRef.current.classList.add(viewRef.current.parentElement.id);
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
      for (const entry of entries) {
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
  }, [viewerRef]);

  return (
    <Root role={'viewer'} {...rootProps} ref={combinedViewRef} >
      <EditorViewPreview role={'preview'} ref={viewerRef}/>
      <EditorViewRenderer role={'renderer'}  ref={rendererRef}/>
    </Root>
  )
})

