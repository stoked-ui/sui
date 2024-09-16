import { Interactable as InteractableBase } from '@interactjs/core/Interactable';
import { DragEvent, ResizeEvent } from "@interactjs/types";
import * as React from 'react';
import { DEFAULT_ADSORPTION_DISTANCE, DEFAULT_MOVE_GRID, DEFAULT_START_LEFT } from "../interface/const";
import { useAutoScroll } from './useAutoScroll';
import Interactable from '../Interactable/Interactable';
import { Direction, RowRndApi, RowRndProps } from './TimelineTrackDnd.types';

const TimelineRowDnd = React.forwardRef<RowRndApi, RowRndProps>(
  (
    {
      children,
      edges,
      left,
      width,

      start = DEFAULT_START_LEFT,
      grid = DEFAULT_MOVE_GRID,
      bounds = {
        left: Number.MIN_SAFE_INTEGER,
        right: Number.MAX_SAFE_INTEGER,
      },
      enableResizing = true,
      enableDragging = true,
      adsorptionDistance = DEFAULT_ADSORPTION_DISTANCE,
      adsorptionPositions = [],
      onResizeStart,
      onResize,
      onResizeEnd,
      onDragStart,
      onDragEnd,
      onDrag,
      parentRef,
      deltaScrollLeft,
    },
    ref,
  ) => {
    const interactable = React.useRef<InteractableBase>();
    const deltaX = React.useRef(0);
    const isAdsorption = React.useRef(false);
    const { initAutoScroll, dealDragAutoScroll, dealResizeAutoScroll, stopAutoScroll } = useAutoScroll(parentRef);

    React.useEffect(() => {
      return () => {
        interactable.current?.unset();
      };
    }, []);


    const handleUpdateLeft = (leftUpdate: number, reset = true) => {
      if (!interactable.current || !interactable.current.target) {
        return;
      }
      if (reset) {
        (deltaX.current = 0);
      }
      const target = interactable.current.target as HTMLElement;
      target.style.left = `${leftUpdate}px`;
      Object.assign(target.dataset, { left: leftUpdate });
    };

    const handleUpdateWidth = (widthUpdate: number, reset = true) => {
      if (!interactable.current || !interactable.current.target) {
        return;
      }
      if (reset) {
        (deltaX.current = 0);
      }
      const target = interactable.current.target as HTMLElement;
      target.style.width = `${widthUpdate}px`;
      Object.assign(target.dataset, { width: widthUpdate });
    };

    const handleGetLeft = () => {
      const target = interactable.current.target as HTMLElement;
      return parseFloat(target?.dataset?.left || '0');
    };

    const handleGetWidth = () => {
      const target = interactable.current.target as HTMLElement;
      return parseFloat(target?.dataset?.width || '0');
    };

    // #region [rgba(100,120,156,0.08)] Assignment related APIs
    React.useImperativeHandle(ref, () => ({
      updateLeft: (leftUpdate) => handleUpdateLeft(leftUpdate || 0, false),
      updateWidth: (widthUpdate) => handleUpdateWidth(widthUpdate, false),
      getLeft: handleGetLeft,
      getWidth: handleGetWidth,
    }));
    React.useEffect(() => {
      const target = interactable.current.target as HTMLElement;
      handleUpdateWidth(typeof width === 'undefined' ? target.offsetWidth : width, false);
    }, [width]);
    React.useEffect(() => {
      handleUpdateLeft(left || 0, false);
    }, [left]);

    // callback api
    const handleMoveStart = (/* e: DragEvent */) => {
      deltaX.current = 0;
      isAdsorption.current = false;
      initAutoScroll();
      onDragStart?.();
    };

    const move = (param: { left: number; width: number; scrollDelta?: number }) => {
      const { left: preLeft, width: preWidth, scrollDelta } = param;
      const distance = isAdsorption.current ? adsorptionDistance : grid;
      if (Math.abs(deltaX.current) >= distance) {
        const count = parseInt(`${deltaX.current / distance}`, 10);
        let curLeft = preLeft + count * distance;

        // controlled adsorption
        let adsorption = curLeft;
        const minDis = Number.MAX_SAFE_INTEGER;
        adsorptionPositions.forEach((item) => {
          const dis = Math.abs(item - curLeft);
          if (dis < adsorptionDistance && dis < minDis) {
            adsorption = item;
          }
          const dis2 = Math.abs(item - (curLeft + preWidth));
          if (dis2 < adsorptionDistance && dis2 < minDis) {
            adsorption = item - preWidth;
          }
        });

        if (adsorption !== curLeft) {
          // Using adsorption data
          isAdsorption.current = true;
          curLeft = adsorption;
        } else {
          // CONTROL GRID
          if ((curLeft - start) % grid !== 0) {
            curLeft = start + grid * Math.round((curLeft - start) / grid);
          }
          isAdsorption.current = false;
        }
        deltaX.current %= distance;

        // Control bounds
        if (curLeft < bounds.left) {
          curLeft = bounds.left;
        }
        else if (curLeft + preWidth > bounds.right) {
          curLeft = bounds.right - preWidth;
        }

        if (onDrag) {
          const ret = onDrag(
            {
              lastLeft: preLeft,
              left: curLeft,
              lastWidth: preWidth,
              width: preWidth,
            },
            scrollDelta,
          );
          if (ret === false) {
            return;
          }
        }

        handleUpdateLeft(curLeft, false);
      }
    };

    const handleMove = (e: DragEvent) => {
      const target = e.target;
      const { left: leftMove, width: widthMove } = target.dataset;
      const preLeft = parseFloat(leftMove);
      const preWidth = parseFloat(widthMove);
      if (deltaScrollLeft && parentRef?.current) {
        const result = dealDragAutoScroll(e, (delta) => {
          deltaScrollLeft(delta);

          deltaX.current += delta;
          move({ left: preLeft, width: preWidth, scrollDelta: delta });
        });

        if (!result) {
          return;
        }
      }

      deltaX.current += e.dx;
      move({ left: preLeft, width: preWidth });
    };

    const handleMoveStop = (e: DragEvent) => {
      deltaX.current = 0;
      isAdsorption.current = false;
      stopAutoScroll();

      const target = e.target;
      const { left: leftMoveStop, width: widthMoveStop } = target.dataset;
      onDragEnd?.({ left: parseFloat(leftMoveStop), width: parseFloat(widthMoveStop) });
    };

    const handleResizeStart = (e: ResizeEvent) => {
      deltaX.current = 0;
      isAdsorption.current = false;
      initAutoScroll();

      const dir: Direction = e.edges?.right ? 'right' : 'left';
      onResizeStart?.(dir);
    };

    const resize = (param: { left: number; width: number; dir: 'left' | 'right' }) => {
      const { dir, width: preWidth, left: preLeft } = param;
      const distance = isAdsorption.current ? adsorptionDistance : grid;

      if (dir === 'left') {
        // Drag left
        if (Math.abs(deltaX.current) >= distance) {
          const count = parseInt(`${deltaX.current / distance}`, 10);
          let curLeft = preLeft + count * distance;

          // controlled adsorption
          let adsorption = curLeft;
          const minDis = Number.MAX_SAFE_INTEGER;
          adsorptionPositions.forEach((item) => {
            const dis = Math.abs(item - curLeft);
            if (dis < adsorptionDistance && dis < minDis) {
              adsorption = item;
            }
          });

          if (adsorption !== curLeft) {
            // using adsorption data
            isAdsorption.current = true;
            curLeft = adsorption;
          } else {
            // Control grid
            if ((curLeft - start) % grid !== 0) {
              curLeft = start + grid * Math.round((curLeft - start) / grid);
            }
            isAdsorption.current = false;
          }
          deltaX.current %= distance;

          // control bounds
          const tempRight = preLeft + preWidth;
          if (curLeft < bounds.left) {
            curLeft = bounds.left;
          }
          const curWidth = tempRight - curLeft;

          if (onResize) {
            const ret = onResize('left', {
              lastLeft: preLeft,
              lastWidth: preWidth,
              left: curLeft,
              width: curWidth,
            });
            if (ret === false) {
              return;
            }
          }

          handleUpdateLeft(curLeft, false);
          handleUpdateWidth(curWidth, false);
        }
      } else if (dir === 'right') {
        // 拖动右侧
        if (Math.abs(deltaX.current) >= distance) {
          const count = parseInt(`${deltaX.current / grid}`, 10);
          let curWidth = preWidth + count * grid;

          // controlled adsorption
          let adsorption = preLeft + curWidth;
          const minDis = Number.MAX_SAFE_INTEGER;
          adsorptionPositions.forEach((item) => {
            const dis = Math.abs(item - (preLeft + curWidth));
            if (dis < adsorptionDistance && dis < minDis) {
              adsorption = item;
            }
          });

          if (adsorption !== preLeft + curWidth) {
            // Using adsorption data
            isAdsorption.current = true;
            curWidth = adsorption - preLeft;
          } else {
            // control grid grid
            let tempRight = preLeft + curWidth;
            if ((tempRight - start) % grid !== 0) {
              tempRight = start + grid * Math.round((tempRight - start) / grid);
              curWidth = tempRight - preLeft;
            }
            isAdsorption.current = false;
          }
          deltaX.current %= distance;

          // Control bounds
          if (preLeft + curWidth > bounds.right) {
            curWidth = bounds.right - preLeft;
          }

          if (onResize) {
            const ret = onResize('right', {
              lastLeft: preLeft,
              lastWidth: preWidth,
              left: preLeft,
              width: curWidth,
            });
            if (ret === false) {
              return;
            }
          }

          handleUpdateWidth(curWidth, false);
        }
      }
    };

    const handleResize = (e: ResizeEvent) => {
      const target = e.target;
      const dir = e.edges?.left ? 'left' : 'right';

      if (deltaScrollLeft && parentRef?.current) {
        const result = dealResizeAutoScroll(e, dir, (delta) => {
          deltaScrollLeft(delta);

          const { left: leftResize, width: widthResize } = target.dataset;
          const preLeft = parseFloat(leftResize);
          const preWidth = parseFloat(widthResize);
          deltaX.current += delta;
          resize({ left: preLeft, width: preWidth, dir });
        });
        if (!result) {
          return;
        }
      }

      const { left: leftResize, width: widthResize } = target.dataset;
      const preLeft = parseFloat(leftResize);
      const preWidth = parseFloat(widthResize);

      deltaX.current += dir === 'left' ? e.deltaRect.left : e.deltaRect.right;
      resize({ left: preLeft, width: preWidth, dir });
    };

    const handleResizeStop = (e: ResizeEvent) => {
      deltaX.current = 0;
      isAdsorption.current = false;
      stopAutoScroll();

      const target = e.target;
      const { left: leftResizeStop, width: widthResizeStop } = target.dataset;
      const dir: Direction = e.edges?.right ? 'right' : 'left';
      onResizeEnd?.(dir, {left: parseFloat(leftResizeStop), width: parseFloat(widthResizeStop),});
    };

    return (
      <Interactable
        interactRef={interactable}
        draggable={enableDragging}
        resizable={enableResizing}
        draggableOptions={{
          lockAxis: 'x',
          onmove: handleMove,
          onstart: handleMoveStart,
          onend: handleMoveStop,
          cursorChecker: () => {
            return null;
          },
        }}
        resizableOptions={{
          axis: 'x',
          invert: 'none',
          edges: {
            left: true,
            right: true,
            top: false,
            bottom: false,
            ...(edges || {}),
          },
          onmove: handleResize,
          onstart: handleResizeStart,
          onend: handleResizeStop,
        }}
      >
        {React.cloneElement(children as React.ReactElement, {
          style: {
            ...((children as React.ReactElement).props.style || {}),
            left,
            width,
          },
        })}
      </Interactable>
    );
  },
);
export default TimelineRowDnd;
