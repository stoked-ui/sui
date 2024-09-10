import * as React from 'react';
import {emphasize, styled} from "@mui/material/styles";
import {AutoSizer, Grid, GridCellRenderer, OnScrollParams} from 'react-virtualized';
import {parserPixelToTime} from '../utils/deal_data';
import {CommonProps} from '../interface/common_prop';
import {prefix} from '../utils/deal_class_prefix';

/** Animation timeline component parameters */
export type TimeAreaProps = CommonProps & {
  /** Left scroll distance */
  scrollLeft: number;
  /** Scroll callback, used for synchronous scrolling */
  onScroll: (params: OnScrollParams) => void;
  /** Set cursor position */
  setCursor: (param: { left?: number; time?: number }) => void;
};

const TimeAreaRoot = styled('div')(({theme}) => ({
  position: 'relative',
  height: '32px',
  flex: '0 0 auto',
  backgroundColor: emphasize(theme.palette.background.default, 0.04),
  '& .ReactVirtualized__Grid': {
    outline: 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    }
  }
}));

const TimeUnitScale = styled('div')(({ theme }) => ({
  color: theme.palette.text.secondary,
  position: 'absolute',
  right: 0,
  top: 0,
  transform: 'translate(50%, -100%)',
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

/** Animation timeline component */
function TimelineTime(props: TimeAreaProps) {
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
  } = props;

  const gridRef = React.useRef<Grid>();
  const timeInteract = React.useRef<HTMLDivElement>();
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
  const [customScaleSplitCount, setCustomScaleSplitCount] = React.useState(scaleSplitCount);

  React.useEffect(() => {
    gridRef.current?.recomputeGridSize();
  }, [scaleWidth, startLeft]);

  // if the viewer resizes make the renderer match it
  React.useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      const unit = entries.find((entry) => entry.target.classList.contains('timeline-editor-time-unit'));
      if (unit) {
        if (unit.target.clientWidth < 10) {
          setCustomScaleSplitCount(customScaleSplitCount * 2);
        } else if (unit.target.clientWidth > 20) {
          setCustomScaleSplitCount(customScaleSplitCount * 0.5);
        }
      }
    });
    return () => {
      resizeObserver.disconnect();
    }
  }, [scaleWidth]);


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
    <TimeAreaRoot className={prefix('time-area')}>
      <AutoSizer>
        {({ width, height }) => {
          return (
            <React.Fragment>
              <Grid
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
