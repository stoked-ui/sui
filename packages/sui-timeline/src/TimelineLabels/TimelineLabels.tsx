import * as React from 'react';
import composeClasses from "@mui/utils/composeClasses";
import { useSlotProps } from '@mui/base/utils';
import {emphasize, styled, useThemeProps} from '@mui/material/styles';
import { TimelineLabelsProps } from './TimelineLabels.types';
import { getTimelineLabelsUtilityClass } from "./timelineLabelsClasses";
import { OnScrollParams } from "react-virtualized";

const useUtilityClasses = (
  ownerState: TimelineLabelsProps,
) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
    label: ['label']
  };

  return composeClasses(slots, getTimelineLabelsUtilityClass, classes);
};

const TimelineLabelsRoot = styled('div', {
  name: 'MuiTimelineLabels',
  slot: 'root',
  overridesResolver: (props, styles) => styles.icon,
})(({ theme }) => ({

  width: '150px',
  marginTop: '42px',
  height: '258px',
  flex: '0 1 auto',
  overflow: 'overlay',
}));


const TimelineLabel = styled('div', {
  name: 'MuiTimelineLabel',
  slot: 'Label',
  overridesResolver: (props, styles) => styles.icon,
})(({ theme }) => ({
  height: '32px',
  padding: '2px',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '& div': {
    color: theme.palette.text.primary,
    height: '28px',
    width: '100%',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '6px',
    backgroundColor: emphasize(theme.palette.background.default, 0.2),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textWrap: 'nowrap'
  }
}));

/**
 *
 * Demos:
 *
 * - [TimelineLabels](https://stoked-ui.github.io/timeline/docs/)
 *
 * API:
 *
 * - [TimelineLabels](https://stoked-ui.github.io/timeline/api/)
 */
export const TimelineLabels = React.forwardRef(
  function TimelineLabels(inProps: TimelineLabelsProps, ref: React.Ref<HTMLDivElement>): React.JSX.Element {
    const { tracks, slots, slotProps, sx, timelineState } = useThemeProps({ props: inProps, name: 'MuiTimelineLabels' });

    const classes = useUtilityClasses(inProps);

    const Root = slots?.root ?? TimelineLabelsRoot;
    const rootProps = useSlotProps({
      elementType: Root,
      externalSlotProps: slotProps?.root,
      className: classes.root,
      ownerState: inProps,
    });

    return (
      <Root
        ref={ref}
        setTracks={inProps.setTracks}
        style={{ overflow: 'overlay', height: 'fit-content' }}
        onScroll={(scrollEvent:  React.UIEvent<HTMLDivElement, UIEvent>) => {
          timelineState.current?.setScrollTop((scrollEvent.target as HTMLDivElement).scrollTop);
        }}
        classes={classes}
        className={`${classes.root} timeline-list`}>
        {tracks?.map((item) => {
          return (
            <TimelineLabel key={item.id} className={classes.label}>
              <div>{item.name}</div>
            </TimelineLabel>
          );
        })}
      </Root>
    )
  })

