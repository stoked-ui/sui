import * as React from 'react';
import PropTypes from 'prop-types';
import { emphasize, styled } from '@mui/material/styles';
import { AutoSizer, Grid, GridCellRenderer } from 'react-virtualized';
import { parserPixelToTime } from '../utils/deal_data';
import { prefix } from '../utils/deal_class_prefix';
import { useTimeline } from '../TimelineProvider';
import { TimelineTimeProps } from './TimelineTime.types';

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
  userSelect: 'none',
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
  },
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
  const context = useTimeline();
  const {
    getState,
    flags,
    engine,
    settings: {
      startLeft,
      scaleCount,
      maxScaleCount,
      scale,
      scaleWidth,
      scaleSplitCount,
      setCursor,
      getScaleRender
    },
  } = context;

  const { scrollLeft, onClickTimeArea } = props;
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

  React.useLayoutEffect(() => {
    const unit = gridRef.current;

    if (!unit) {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(() => {
      const timeUnit = document.querySelector('.timeline-editor-time-unit');
      if (!timeUnit) {
        return;
      }
      if (timeUnit.clientWidth < 10) {
        setCustomScaleSplitCount(customScaleSplitCount * 2);
      } else if (timeUnit.clientWidth > 20) {
        setCustomScaleSplitCount(customScaleSplitCount * 0.5);
      }
    });
    const timeUnit = document.querySelector('.timeline-editor-time-unit');
    const grid = document.getElementById('time-area-grid');
    resizeObserver.observe(grid);

    return () => {
      resizeObserver.unobserve(grid);
    };
  }, []);


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
  const [isDragging, setIsDragging] = React.useState(false);
  const setTimeToMouse = (e) =>  {
    if (flags.hideCursor) {
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
    if (!isDragging) {
      setIsDragging(true);
    }
    engine.reRender();
    setCursor({ time }, context);
  }
  const handleMouseMove = (e) => {
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
      // setPosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <TimeAreaRoot
      sx={{ marginLeft: `${startLeft - 7}px` }}
      ref={timeAreaRef}
      className={prefix('time-area')}
    >
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
                style={{ overflowX: 'hidden' }}
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
                style={{ width, height }}
                /* onClick={} */
                onMouseDown={setTimeToMouse}
                onMouseMove={handleMouseMove}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                className={prefix('time-area-interact')}
              />
            </React.Fragment>
          );
        }}
      </AutoSizer>
    </TimeAreaRoot>
  );
}

TimelineTime.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * @description Get the action id list to prompt the auxiliary line. Calculate it when
   *   move/resize start. By default, get all the action ids except the current move action.
   */
  getAssistDragLineActionIds: PropTypes.func.isRequired,
  /**
   * @description Custom scale rendering
   */
  getScaleRender: PropTypes.func.isRequired,
  /**
   * @description Move end callback (return false to prevent onChange from triggering)
   */
  onActionMoveEnd: PropTypes.func.isRequired,
  /**
   * @description Start moving callback
   */
  onActionMoveStart: PropTypes.func.isRequired,
  /**
   * @description Move callback (return false to prevent movement)
   */
  onActionMoving: PropTypes.func.isRequired,
  /**
   * @description size change end callback (return false to prevent onChange from triggering)
   */
  onActionResizeEnd: PropTypes.func.isRequired,
  /**
   * @description Start changing the size callback
   */
  onActionResizeStart: PropTypes.func.isRequired,
  /**
   * @description Start size callback (return false to prevent changes)
   */
  onActionResizing: PropTypes.func.isRequired,
  /**
   * @description click action callback
   */
  onClickAction: PropTypes.func.isRequired,
  /**
   * @description Click action callback (not executed when drag is triggered)
   */
  onClickActionOnly: PropTypes.func.isRequired,
  /**
   * @description Click time area event, prevent setting time when returning false
   */
  onClickTimeArea: PropTypes.func.isRequired,
  /**
   * @description Click track callback
   */
  onClickTrack: PropTypes.func.isRequired,
  /**
   * @description Right-click action callback
   */
  onContextMenuAction: PropTypes.func.isRequired,
  /**
   * @description Right-click track callback
   */
  onContextMenuTrack: PropTypes.func.isRequired,
  /**
   * @description cursor drag event
   */
  onCursorDrag: PropTypes.func.isRequired,
  /**
   * @description cursor ends drag event
   */
  onCursorDragEnd: PropTypes.func.isRequired,
  /**
   * @description cursor starts drag event
   */
  onCursorDragStart: PropTypes.func.isRequired,
  /**
   * @description Double-click action callback
   */
  onDoubleClickAction: PropTypes.func.isRequired,
  /**
   * @description Double-click track callback
   */
  onDoubleClickTrack: PropTypes.func.isRequired,
  onScroll: PropTypes.func.isRequired,
  /**
   * Set the number of scales
   */
  setScaleCount: PropTypes.func.isRequired,
  /**
   * @description Custom timelineControl style
   */
  style: PropTypes.object.isRequired,
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]).isRequired,
    ),
    PropTypes.func,
    PropTypes.object,
  ]).isRequired,
} as any;

export default TimelineTime;
