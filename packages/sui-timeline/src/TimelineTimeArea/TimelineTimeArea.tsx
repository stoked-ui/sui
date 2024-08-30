import * as React from 'react';
import {emphasize, styled} from "@mui/material/styles";
import { AutoSizer, Grid, GridCellRenderer } from 'react-virtualized';
import { parserPixelToTime } from '../utils/deal_data';
import { TimelineTimeAreaProps } from './TimelineTimeArea.types';
import { prefix } from '../utils/deal_class_prefix';
import { ScrollSyncNode } from 'scroll-sync-react';
/** Animation timeline component parameters */


const TimeAreaRoot = styled('div')(({theme}) => ({
  height: '32px',
  flex: '0 0 auto',
  width: '2000px',
  overflow: 'scroll',
  backgroundColor: emphasize(theme.palette.background.default, 0.04),
  '& .ReactVirtualized__Grid': {
    outline: 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    }
  },

}));

const TimeUnitScale = styled('div')(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

const TimeAreaInteract = styled('div')({
  cursor: 'pointer',
  left: 0,
  top: 0,
});

const TimeUnit = styled('div')(({ theme }) => ({
  borderRight: `1px solid ${theme.palette.text.primary}`,
  boxSizing: 'content-box',
  height: '4px !important',
  bottom: '0 !important',
  top: 'auto !important',
  '&-big': {
    height: '8px !important',
  }
}));

/** Animation timeline component */
export default function TimelineTimeArea ({ setCursor, maxScaleCount, hideCursor, scale, scaleWidth, scaleCount, scaleSplitCount, startLeft, scrollLeft, onClickTimeArea, getScaleRender }: TimelineTimeAreaProps) {
  const gridRef = React.useRef<HTMLDivElement>();
  /** Whether to display subdivision scales */
  const showUnit = scaleSplitCount > 0;
  /** Get the rendering content of each cell */
  function CellRenderer({ columnIndex, key, style, showUnit }) {
    const isShowScale = showUnit ? columnIndex % scaleSplitCount === 0 : true;
    const classNames = ['time-unit'];
    if (isShowScale) {
      classNames.push('time-unit-big');
      style.height = '32px!imporatant';
    }
    const item = (showUnit ? columnIndex / scaleSplitCount : columnIndex) * scale;
    return (
        <TimeUnit key={key} style={style} className={prefix(...classNames)}>
          {isShowScale && <TimeUnitScale className={prefix('time-unit-scale')}>{getScaleRender ? getScaleRender(item) : item}</TimeUnitScale>}
        </TimeUnit>

    );
  }

  React.useEffect(() => {

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
  const createUnitArray = () => Array.from({ length: showUnit ? scaleCount * scaleSplitCount + 1 : scaleCount }, (_, i) => i);
  const [width, setWidth] = React.useState<string>('100%');
  React.useEffect(() => {
    const getWidth = () => {
      const tracks = document.querySelectorAll('.timeline-editor-edit-track');
      let longestTrack = 0;
      tracks.forEach((track) => {
        if (track.scrollWidth > longestTrack) {
          longestTrack = track.scrollWidth;
        }
      });
      return longestTrack;
    }
    setWidth(`${getWidth()}px`);
  }, [])

  const [unitArray, setUnitArray] = React.useState<number[]>(createUnitArray())
  React.useEffect(() => {
    createUnitArray();
  }, [scaleCount, scaleSplitCount, showUnit])
  const getTimeRow = () => {
    return (
      <ScrollSyncNode>
        <div ref={gridRef}  style={{width, overflow: 'auto', height: '300px', display: 'flex', flexDirection: 'row'}}>
          {Array.from(unitArray).map((num, index) => {
            return <CellRenderer columnIndex={index} showUnit={scaleSplitCount > 0} style={{width: getColumnWidth({index}), height: 32, color: 'pink'}} key={`${index}`}/>
          })}
        </div>
    </ScrollSyncNode>
  )}
  return (
    <TimeAreaRoot className={prefix('time-area')}>
      {getTimeRow()}

      <ScrollSyncNode>
        <TimeAreaInteract
          style={{ width: '100%', height: '100%' }}
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
      </ScrollSyncNode>

    </TimeAreaRoot>
  );
};
