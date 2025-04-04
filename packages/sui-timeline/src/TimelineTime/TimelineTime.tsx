import * as React from 'react';
import PropTypes from 'prop-types';
import { emphasize, styled } from '@mui/styles';
import { AutoSizer } from 'react-virtualized';

/**
 * Component that handles time manipulation.
 */
const TimeAreaRoot = styled.div`
  margin-left: ${props => props.marginLeft}px;
  display: grid;
`;

const TimeUnit = styled.div`
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.1s ease-in-out;

  &.time-unit-big {
    font-size: 18px;
  }
`;

const TimeUnitScale = styled(TimeUnit)`
  font-size: 14px;
`;

/**
 * Custom grid cell renderer.
 */
interface GridCellRendererProps {
  columnIndex: number;
  key?: string;
  style: object;
}

const GridCellRenderer = ({ columnIndex, key, style }: GridCellRendererProps) => {
  const isShowScale = showUnit ? columnIndex % scaleSplitCount === 0 : true;

  return (
    <TimeUnit
      key={key}
      style={style}
      className={prefix(...isShowScale ? ['time-unit', 'time-unit-big'] : ['time-unit'])}
      disabled={settings.disabled}
    >
      {isShowScale && (
        <TimeUnitScale disabled={settings.disabled} className="time-unit-scale">
          {getScaleRender ? getScaleRender(item) : item}
        </TimeUnitScale>
      )}
    </TimeUnit>
  );
};

/**
 * Get column width.
 */
const getColumnWidth = (data: { index: number }) => {
  switch (data.index) {
    case 0:
      return startLeft;
    default:
      return showUnit ? scaleWidth / scaleSplitCount : scaleWidth;
  }
};

/**
 * Component that handles time manipulation.
 */
interface TimelineTimeProps {
  /**
   * Set cursor position.
   */
  getScaleRender: PropTypes.func;
  onClickTimeArea: PropTypes.func;
  /**
   * Scroll callback, used for synchronous scrolling.
   */
  onScroll: PropTypes.func;
  /**
   * Left scroll distance.
   */
  scrollLeft: number;
}

const TimelineTime = ({ getScaleRender, onClickTimeArea, onScroll, scrollLeft }: TimelineTimeProps) => {
  const [isDragging, setIsDragging] = React.useState(false);

  /**
   * Set time to mouse position.
   */
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
      return; // Prevent setting time when returning false
    }
    if (!isDragging) {
      setIsDragging(true);
    }
    setCursor({ time }, context);
  };

  /**
   * Handle mouse move event.
   */
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

  return (
    <TimeAreaRoot
      marginLeft={startLeft - 7}
      ref={(ref) => (timeAreaRef = ref)}
      className="time-area"
    >
      <div style={{ right: 0, justifyContent: 'end', alignSelf: 'center' }}>
        {flags && flags.noLabels && <SnapControls size={'small'} hover={true} />}
        <ZoomControls />
      </div>
      <AutoSizer>
        {({ width, height }) => (
          <React.Fragment>
            <Grid
              id="time-area-grid"
              ref={(ref) => (gridRef = ref)}
              columnCount={showUnit ? scaleCount * scaleSplitCount + 1 : scaleCount}
              columnWidth={getColumnWidth}
              estimatedColumnSize={estColumnWidth}
              rowCount={1}
              style={{ overflowX: 'hidden' }}
              rowHeight={height}
              width={width}
              height={height}
              overscanRowCount={0}
              overscanColumnCount={10}
              cellRenderer={GridCellRenderer}
              scrollLeft={scrollLeft}
            />
            <TimeAreaInteract
              ref={(ref) => (timeInteractRef = ref)}
              style={{ width, height }}
              disabled={settings.disabled}
              onMouseDown={setTimeToMouse}
              onMouseMove={handleMouseMove}
              onMouseUp={() => setIsDragging(false)}
            />
          </React.Fragment>
        )}
      </AutoSizer>
    );
  };
};

export default TimelineTime;