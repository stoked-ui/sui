import * as React from 'react';
import { FileBase } from '@stoked-ui/file-explorer';
import composeClasses from "@mui/utils/composeClasses";
import { useSlotProps } from '@mui/base/utils';
import { styled, createUseThemeProps } from '../internals/zero-styled';
import { EditorViewProps } from './EditorView.types';
import { getEditorViewUtilityClass } from "./editorViewClasses";

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
  minHeight: '400px',

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
  minHeight: '400px',
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
  minHeight: '400px',
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

  const { slots, slotProps } = props;
  const classes = useUtilityClasses(props);

  const Root = slots?.root ?? EditorViewRoot;
  const rootProps = useSlotProps({
    elementType: Root,
    externalSlotProps: slotProps?.root,
    className: classes.root,
    ownerState: props,
  });

  return (
    <Root {...rootProps}>
      <EditorViewPreview />
      <EditorViewRenderer />
    </Root>
  )
})

