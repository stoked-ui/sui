import * as React from 'react';
import { FileBase } from '@stoked-ui/file-explorer';
import composeClasses from "@mui/utils/composeClasses";
import { useSlotProps } from '@mui/base/utils';
import { styled, createUseThemeProps } from '../internals/zero-styled';
import { EditorViewProps } from './EditorView.types';
import { getEditorViewUtilityClass } from "./editorViewClasses";
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
  position: 'relative',
  overflow: 'hidden',
}));

const EditorViewPreview = styled('div', {
  name: "MuiEditorViewPreview",
  slot: "preview"
})(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
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

  React.useEffect(() => {
    if (inProps.engine.current && viewRef?.current) {
      inProps.engine.current.viewer = viewRef.current;
    }
  }, [viewRef, inProps.engine])

  const { slots, slotProps } = props;
  const classes = useUtilityClasses(props);

  const Root = slots?.root ?? EditorViewRoot;
  const rootProps = useSlotProps({
    elementType: Root,
    externalSlotProps: slotProps?.root,
    className: classes.root,
    ownerState: {...props, ref: viewRef },
  });

  return (
    <Root {...rootProps} ref={combinedViewRef}>
      <EditorViewPreview />
      <EditorViewRenderer />
    </Root>
  )
})

