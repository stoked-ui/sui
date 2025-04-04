import { DragEvent, ResizeEvent } from '@interactjs/types/index';
import * as React from 'react';

/**
 * Constants for auto scroll functionality
 */
const DEFAULT_SPEED = 1;
const MAX_SPEED = 3;
const CRITICAL_SIZE = 10;

/**
 * Custom hook to enable auto scrolling on a target element
 *
 * @param {React.MutableRefObject<HTMLDivElement>} target The reference to the target element
 * @returns {object} An object with methods for initializing, handling drag and resize events, and stopping auto scroll
 */
export function useAutoScroll(target: React.MutableRefObject<HTMLDivElement>) {
  /**
   * Refs for left and right bounds of the target element
   */
  const leftBoundRef = React.useRef(Number.MIN_SAFE_INTEGER);
  const rightBoundRef = React.useRef(Number.MAX_SAFE_INTEGER);

  /**
   * Speed of auto scrolling, defaults to DEFAULT_SPEED
   */
  const speed = React.useRef(DEFAULT_SPEED);

  /**
   * Frame number for the animation loop
   */
  const frame = React.useRef<number>();

  /**
   * Initialize the auto scroll functionality by setting up left and right bounds
   */
  const initAutoScroll = () => {
    if (target?.current) {
      const { left, width } = target.current.getBoundingClientRect();
      leftBoundRef.current = left;
      rightBoundRef.current = left + width;
    }
  };

  /**
   * Handle drag events by updating the scroll speed and animation frame
   *
   * @param {DragEvent} e The drag event object
   * @param {(delta: number) => void} [deltaScroll] Optional callback for delta scroll
   * @returns {boolean} Whether to continue scrolling or stop
   */
  const dealDragAutoScroll = (e: DragEvent, deltaScroll?: (delta: number) => void) => {
    // 超出
    if (e.clientX >= rightBoundRef.current || e.clientX <= leftBoundRef.current) {
      if (frame.current !== undefined) {
        cancelAnimationFrame(frame.current);
      }
      const over = Math.abs(e.clientX >= rightBoundRef.current ? e.clientX - rightBoundRef.current : e.clientX - leftBoundRef.current);
      speed.current = Math.min(Number((over / CRITICAL_SIZE).toFixed(0)) * DEFAULT_SPEED, MAX_SPEED);

      const dir = e.clientX >= rightBoundRef.current ? 1 : -1;
      const delta = dir * speed.current;
      const loop = () => {
        if (deltaScroll) {
          deltaScroll(delta);
        }
        frame.current = requestAnimationFrame(loop);
      };

      frame.current = requestAnimationFrame(loop);
      return false;
    }
    if (frame.current !== undefined) {
      cancelAnimationFrame(frame.current);
    }

    return true;
  };

  /**
   * Handle resize events by updating the scroll speed and animation frame
   *
   * @param {ResizeEvent} e The resize event object
   * @param {'left' | 'right'} dir The direction of the resize (left or right)
   * @param {(delta: number) => void} [deltaScroll] Optional callback for delta scroll
   * @returns {boolean} Whether to continue scrolling or stop
   */
  const dealResizeAutoScroll = (e: ResizeEvent, dir: 'left' | 'right', deltaScroll?: (delta: number) => void) => {
    if (e.clientX >= rightBoundRef.current || e.clientX < leftBoundRef.current) {
      if (frame.current !== undefined) {
        cancelAnimationFrame(frame.current);
      }
      const over = Math.abs(e.clientX >= rightBoundRef.current ? e.clientX - rightBoundRef.current : e.clientX - leftBoundRef.current);
      speed.current = Math.min(Number((over / CRITICAL_SIZE).toFixed(0)) * DEFAULT_SPEED, MAX_SPEED);

      const direction = e.clientX >= rightBoundRef.current ? 1 : -1;
      const delta = direction * speed.current;
      const loop = () => {
        if (deltaScroll) {
          deltaScroll(delta);
        }
        frame.current = requestAnimationFrame(loop);
      };

      frame.current = requestAnimationFrame(loop);

      return false;
    }
    if (frame.current !== undefined) {
      cancelAnimationFrame(frame.current);
    }
    return true;
  };

  /**
   * Stop the auto scroll functionality by resetting bounds and speed
   */
  const stopAutoScroll = () => {
    leftBoundRef.current = Number.MIN_SAFE_INTEGER;
    rightBoundRef.current = Number.MAX_SAFE_INTEGER;
    speed.current = DEFAULT_SPEED;
    if (frame.current !== undefined) {
      cancelAnimationFrame(frame.current);
    }
  };

  return {
    initAutoScroll,
    dealDragAutoScroll,
    dealResizeAutoScroll,
    stopAutoScroll,
  };
}