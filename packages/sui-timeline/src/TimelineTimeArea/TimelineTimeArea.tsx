import * as React from 'react';
import {emphasize, styled} from "@mui/material/styles";
import { AutoSizer, Grid, GridCellRenderer, OnScrollParams } from 'react-virtualized';
import { parserPixelToTime } from '../utils/deal_data';
import { TimelineTimeAreaProps } from './TimelineTimeArea.types';
import { prefix } from '../utils/deal_class_prefix';
/** Animation timeline component parameters */


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
export const TimeArea: React.FC<TimelineTimeAreaProps> = ({ setCursor, maxScaleCount, hideCursor, scale, scaleWidth, scaleCount, scaleSplitCount, startLeft, scrollLeft, onClickTimeArea, getScaleRender }) => {
  const gridRef = React.useRef<Grid>();
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

  React.useEffect(() => {
    gridRef.current?.recomputeGridSize();
  }, [scaleWidth, startLeft]);

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
                style={{ width, height }}
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
                  console.log('set cursor', time);
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
