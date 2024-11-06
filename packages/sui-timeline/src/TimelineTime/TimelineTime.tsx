import * as React from 'react';
import useResizeObserver from 'use-resize-observer';
import {emphasize, styled} from "@mui/material/styles";
import {AutoSizer, Grid, GridCellRenderer, OnScrollParams} from 'react-virtualized';
import {parserPixelToTime} from '../utils/deal_data';
import {CommonProps} from '../interface/common_prop';
import {prefix} from '../utils/deal_class_prefix';

/** Animation timeline component parameters */
export type TimelineTimeProps = CommonProps & {
  /** Left scroll distance */
  scrollLeft: number;
  /** Scroll callback, used for synchronous scrolling */
  onScroll: (params: OnScrollParams) => void;
  /** Set cursor position */
  setCursor: (param: { left?: number; time?: number }) => void;
};

const TimeAreaRoot = styled('div')(({theme}) => ({
  position: 'relative',
  height: '37px !important',
  flex: '0 0 auto',
  backgroundColor: emphasize(theme.palette.background.default, 0.04),
  '& .ReactVirtualized__Grid': {
    outline: 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    }
  },
  '& #time-area-grid': {

  }
}));
/*
const TimeUnitScale = styled('div')(({ theme }) => ({
  color: theme.palette.text.secondary,
  position: 'absolute',
  right: 0,
  top: 0,
  transform: 'translate(50%, -100%)',
  userSelect: 'none',
  paddingInlineStart: '0px',
  lineHeight: '20px',
})); */


const TimeUnitScale = styled('div')(({ theme }) => ({
  color: theme.palette.text.secondary,
  position: 'absolute',
  right: 0,
  top: 0,
  transform: 'translate(50%, -100%)',
  userSelect: 'none'
}));

const TimeAreaInteract = styled('div')({
  position: 'absolute',
  cursor: 'pointer',
  left: 0,
  top: 0,
});

const TimeUnit = styled('div')(({ theme }) => ({
  borderRight: `1px solid ${theme.palette.text.primary}`,
  position: 'relative',
  boxSizing: 'content-box',
  height: '4px !important',
  bottom: '0 !important',
  top: 'auto !important',
  '&-big': {
    height: '8px !important',
  }
}));
/*

 const TimeUnit = styled('div')(({ theme }) => ({
 borderRight: `1px solid ${theme.palette.text.primary}`,
 position: 'relative',
 boxSizing: 'content-box',
 height: '4px !important',
 bottom: '0 !important',
 top: '31px !important',
 '&.timeline-editor-time-unit-big': {
 height: '8px !important',
 }
 }));
 */

/** Animation timeline component */
function TimelineTime(props: TimelineTimeProps) {
  const {
    setCursor,
    maxScaleCount,
    hideCursor,
    scale,
    scaleWidth,
    scaleCount,
    scaleSplitCount,
    startLeft,
    scrollLeft,
    onClickTimeArea,
    getScaleRender,
    disabled
  } = props;

  const gridRef = React.useRef<Grid>();
  const timeInteract = React.useRef<HTMLDivElement>();
  const timeAreaRef = React.useRef<HTMLDivElement>();
  /** Whether to display subdivision scales */
  const showUnit = scaleSplitCount > 0;

  /** Get the rendering content of each cell */
  const cellRenderer: GridCellRenderer = ({ columnIndex, key, style }) => {
    const isShowScale = showUnit ? columnIndex % scaleSplitCount === 0 : true;
    const classNames = ['time-unit'];
    if (isShowScale) {
      classNames.push('time-unit-big');
    }
    const item = (showUnit ? columnIndex / scaleSplitCount : columnIndex) * scale;
    return (
      <TimeUnit key={key} style={style} className={prefix(...classNames)}>
        {isShowScale && <TimeUnitScale className={prefix('time-unit-scale')}>{getScaleRender ? getScaleRender(item) : item}</TimeUnitScale>}
      </TimeUnit>
    );
  };
  const [customScaleSplitCount, setCustomScaleSplitCount] = React.useState(null);

  React.useEffect(() => {
    gridRef.current?.recomputeGridSize();
  }, [scaleWidth, startLeft]);


  useResizeObserver({
    ref: timeAreaRef,
    onResize: ({ width }) => {
      const timeUnit = document.querySelector('.timeline-editor-time-unit');
      if (!timeUnit) {
        return;
      }
      if (timeUnit.clientWidth < 10) {
        setCustomScaleSplitCount(customScaleSplitCount * 2);
      } else if (timeUnit.clientWidth > 20) {
        setCustomScaleSplitCount(customScaleSplitCount * 0.5);
      }
    },
  });

  /** Get column width */
  const getColumnWidth = (data: { index: number }) => {
    switch (data.index) {
      case 0:
        return startLeft;
      default:
        return showUnit ? scaleWidth / scaleSplitCount : scaleWidth;
    }
  };
  const estColumnWidth=getColumnWidth({index:1});
  return (
    <TimeAreaRoot ref={timeAreaRef} className={prefix('time-area')}>
      <AutoSizer>
        {({ width, height }) => {
          return (
            <React.Fragment>
              <Grid
                id={'time-area-grid'}
                ref={gridRef}
                columnCount={showUnit ? scaleCount * scaleSplitCount + 1 : scaleCount}
                columnWidth={getColumnWidth}
                estimatedColumnSize={estColumnWidth}
                rowCount={1}
                rowHeight={height}
                width={width}
                height={height}
                overscanRowCount={0}
                overscanColumnCount={10}
                cellRenderer={cellRenderer}
                scrollLeft={scrollLeft}
              />
              <TimeAreaInteract
                ref={timeInteract}
                style={{ width, height}}
                onClick={(e) => {
                  if (hideCursor) {
                    return;
                  }
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  const position = e.clientX - rect.x;
                  const left = Math.max(position + scrollLeft, startLeft);
                  if (left > maxScaleCount * scaleWidth + startLeft - scrollLeft) {
                    return;
                  }

                  const time = parserPixelToTime(left, { startLeft, scale, scaleWidth });
                  const result = onClickTimeArea && onClickTimeArea(time, e);
                  if (result === false) {
                    return; // Prevent setting time when returning false}
                  }
                  setCursor({ time });
                }}
                className={prefix('time-area-interact')}
              />
            </React.Fragment>
          );
        }}
      </AutoSizer>
    </TimeAreaRoot>
  );
};

export default TimelineTime;
