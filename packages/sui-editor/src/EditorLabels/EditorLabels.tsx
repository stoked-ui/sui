import * as React from 'react';
import composeClasses from "@mui/utils/composeClasses";
import { useSlotProps } from '@mui/base/utils';
import {styled, Theme, useThemeProps} from '@mui/material/styles';
import ToggleButton from "@stoked-ui/core/ToggleButton";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ToggleButtonGroup from '@stoked-ui/core/ToggleButtonGroup';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import { EditorLabelsProps } from './EditorLabels.types';
import { getEditorLabelsUtilityClass } from "./editorLabelsClasses";

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
/*

const useUtilityClasses = <R extends FileBase, Multiple extends boolean | undefined>(
  ownerState: EditorProps<R, Multiple>,
) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
    viewSpace: ['viewSpace'],
    videoControls: ['videoControls'],
    timeline: ['timeline'],
    bottomLeft: ['bottomLeft'],
    bottomRight: ['bottomRight'],
  };

  return composeClasses(slots, getEditorUtilityClass, classes);
};

 */
const EditorLabelsRoot = styled('div', {
  name: 'MuiEditorLabels',
  slot: 'root',
  overridesResolver: (props, styles) => styles.icon,
})(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: '42px',
  height: '258px',
  flex: '0 1 auto',
  overflow: 'overlay',
}));


const EditorLabel = styled('div', {
  name: 'MuiEditorLabel',
  slot: 'Label',
  overridesResolver: (props, styles) => styles.icon,
})(({ theme }) => ({
  height: '32px',
  paddingLeft: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: '4px',

}));

const EditorLabelText = styled('div', {
  name: 'MuiEditorLabelText',
  slot: 'Label',
  overridesResolver: (props, styles) => styles.icon,
})(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey.A200 : theme.palette.grey['900'],
  color: theme.palette.text.primary,
  height: '28px',
  width: '150px',
  display: 'flex',
  alignItems: 'center',
  paddingLeft: '6px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  textWrap: 'nowrap',
  flexGrow: '1'
}));

const LabelButtonContainer = styled(ToggleButtonGroup, {
  name: 'MuiLabelButtonContainer',
  slot: 'LabelButtonContainer',
  overridesResolver: (props, styles) => styles.icon,
})(({ theme }: { theme: Theme}) => {
  return {
  width: 'min-content',
  display: 'flex',
  alignItems: 'center',
  paddingRight: '0px',
  '& button': {
    padding: '3px',
  }
}});

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
    const { tracks, slots, slotProps, sx, timelineState } = useThemeProps({ props: inProps, name: 'MuiEditorLabels' });

    const classes = useUtilityClasses(inProps);

    const Root = slots?.root ?? EditorLabelsRoot;
    const rootProps = useSlotProps({
      elementType: Root,
      externalSlotProps: slotProps?.root,
      className: classes.root,
      ownerState: inProps,
    });


    return (
      <Root
        ref={ref}
        style={{ overflow: 'overlay' }}
        onScroll={(scrollEvent:  React.UIEvent<HTMLDivElement, UIEvent>) => {
          timelineState.current?.setScrollTop((scrollEvent.target as HTMLDivElement).scrollTop);
        }}
        classes={classes}
        className={`${classes.root} timeline-list`}>
        {tracks?.map((item) => {

          const visibilityIcon = item.hidden ? <VisibilityOffIcon fontSize={'small'}/> : <VisibilityIcon fontSize={'small'}/>;

          const lockIcon = item.lock ? <LockIcon fontSize={'small'}/> : <LockOpenIcon fontSize={'small'}/>;
          return (
            <EditorLabel key={item.id} className={classes.label}>
              <EditorLabelText>{item.name}</EditorLabelText>

              {(inProps.getToggles && inProps.onToggle) && <LabelButtonContainer
                value={inProps.getToggles(item.id)}
                exclusive
                onChange={(event, value) => {
                  inProps.onToggle!(item.id, value)
                }}
                aria-label="text alignment"
              >
                <ToggleButton  value="hidden" aria-label="hidden">
                  {visibilityIcon}
                </ToggleButton>
                <ToggleButton value="lock" aria-label="lock">
                  {lockIcon}
                </ToggleButton>
                </LabelButtonContainer>
              }
            </EditorLabel>
          );
        })}
      </Root>
    )
  })

export default EditorLabels;
