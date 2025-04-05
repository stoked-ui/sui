/**
 * @typedef {Object} TimelineTimeProps - Props for the TimelineTime component
 * @property {Function} getScaleRender - Function to render scale
 * @property {Function} onClickTimeArea - Callback function for clicking on the time area
 * @property {Function} onScroll - Callback function for scrolling
 * @property {number} scrollLeft - Left scroll distance
 */

import * as React from 'react';
import PropTypes from 'prop-types';
import { emphasize, styled } from '@mui/material/styles';
import { AutoSizer, Grid, GridCellRenderer } from 'react-virtualized';
import { parserPixelToTime } from '../utils/deal_data';
import { prefix } from '../utils/deal_class_prefix';
import { useTimeline } from '../TimelineProvider';
import { TimelineTimeProps } from './TimelineTime.types';
import ZoomControls from '../TimelineTrackArea/ZoomControls';
import SnapControls from "../TimelineLabels/SnapControls";

/**
 * Root styled component for the Time Area
 */
const TimeAreaRoot = styled('div')(({ theme }) => ({
  position: 'relative',
  height: '37px !important',
  flex: '0 0 auto',
  backgroundColor: emphasize(theme.palette.background.default, 0.04),
  '& .ReactVirtualized__Grid': {
    outline: 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
  '& #time-area-grid': {},
}));

/**
 * Scale of a time unit styled component
 */
const TimeUnitScale = styled('div')<{ disabled: boolean }>(({ theme, disabled }) => ({
  color: disabled ? theme.palette.action.disabled : theme.palette.text.secondary,
  position: 'absolute',
  right: 0,
  top: 0,
  transform: 'translate(50%, -100%)',
  userSelect: 'none',
}));

/**
 * Interact component for the Time Area
 */
const TimeAreaInteract = styled('div')<{ disabled: boolean }>(({ disabled }) => ({
  position: 'absolute',
  cursor: disabled ? 'not-allowed' : 'pointer',
  left: 0,
  top: 0,
}));

/**
 * Time unit styled component
 */
const TimeUnit = styled('div')<{ disabled: boolean }>(({ theme, disabled }) => ({
  borderRight: `1px solid ${disabled ? theme.palette.action.disabled : theme.palette.text.secondary}`,
  position: 'relative',
  boxSizing: 'content-box',
  height: '4px !important',
  bottom: '0 !important',
  top: 'auto !important',
  '&-big': {
    height: '8px !important',
  },
}));

/**
 * Animation timeline component
 * @param {TimelineTimeProps} props - Props for the TimelineTime component
 * @returns {JSX.Element} Animation timeline component
 */
function TimelineTime(props: TimelineTimeProps) {
  const context = useTimeline();
  const { state, dispatch } = context;
  const { flags, engine, settings } = state;
  const {
    startLeft,
    scaleCount,
    maxScaleCount,
    scale,
    scaleWidth,
    scaleSplitCount,
    setCursor,
    getScaleRender,
  } = settings;

  const { scrollLeft, onClickTimeArea } = props;
  const gridRef = React.useRef<Grid>();
  const timeInteract = React.useRef<HTMLDivElement>();
  const timeAreaRef = React.useRef<HTMLDivElement>();

  const showUnit = scaleSplitCount > 0;

  const cellRenderer: GridCellRenderer = ({ columnIndex, key, style }) => {
    const isShowScale = showUnit ? columnIndex % scaleSplitCount === 0 : true;
    const classNames = ['time-unit'];
    if (isShowScale) {
      classNames.push('time-unit-big');
    }

    const item = (showUnit ? columnIndex / scaleSplitCount : columnIndex) * scale;
    return (
      <TimeUnit
        key={key}
        style={style}
        className={prefix(...classNames)}
        disabled={settings.disabled}
      >
        {isShowScale && (
          <TimeUnitScale disabled={settings.disabled} className={prefix('time-unit-scale')}>
            {getScaleRender ? getScaleRender(item) : item}
          </TimeUnitScale>
        )}
      </TimeUnit>
    );
  };

  React.useEffect(() => {
    gridRef.current?.recomputeGridSize();
  }, [scaleWidth, startLeft]);

  const getColumnWidth = (data: { index: number }) => {
    switch (data.index) {
      case 0:
        return startLeft;
      default:
        return showUnit ? scaleWidth / scaleSplitCount : scaleWidth;
    }
  };

  const estColumnWidth = getColumnWidth({ index: 1 });
  const [isDragging, setIsDragging] = React.useState(false);

  const setTimeToMouse = (e) => {
    if (flags.hideCursor || engine.isPlaying) {
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
      return;
    }
    if (!isDragging) {
      setIsDragging(true);
    }
    setCursor({ time }, context);
  };

  const handleMouseMove = (e) => {
    if (engine.isPlaying) {
      return;
    }
    if (e.buttons === 0) {
      if (isDragging) {
        setIsDragging(false);
      }
      return;
    }
    if (!isDragging) {
      setIsDragging(true);
    }
    setTimeToMouse(e);
  };

  return (<TimeAreaRoot
    sx={{marginLeft: `${startLeft - 7}px`, display: 'grid'}}
    ref={timeAreaRef}
    className={prefix('time-area')}
  >
    <div style={{
      right: 0,
      justifySelf: 'end',
      alignSelf: 'center',
      position: 'absolute',
      zIndex: 300
    }}>
      {flags && flags.noLabels && <SnapControls size={'small'} hover={true} />}
      <ZoomControls/>
    </div>
    <AutoSizer>
      {({width, height}) => {
        return (<React.Fragment>
            <Grid
              id={'time-area-grid'}
              ref={gridRef}
              columnCount={showUnit ? scaleCount * scaleSplitCount + 1 : scaleCount}
              columnWidth={getColumnWidth}
              estimatedColumnSize={estColumnWidth}
              rowCount={1}
              style={{overflowX: 'hidden'}}
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
              style={{width, height}}
              disabled={settings.disabled}
              onMouseDown={setTimeToMouse}
              onMouseMove={handleMouseMove}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              className={prefix('time-area-interact')}
            />
          </React.Fragment>);
      }}
    </AutoSizer>
  </TimeAreaRoot>
);
}

TimelineTime.propTypes = {
  getScaleRender: PropTypes.func,
  onClickTimeArea: PropTypes.func,
  onScroll: PropTypes.func,
  scrollLeft: PropTypes.number,
} as any;

export default TimelineTime;
