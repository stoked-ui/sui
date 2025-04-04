/**
 * Interactable component
 * 
 * The Interactable component is a wrapper around the children provided to it.
 * It adds drag and drop functionality if the "draggable" prop is set to true, and
 * resizable functionality if the "resizable" prop is set to true.
 */

import * as React from 'react';
import { DragEvent, Interactable as InteractableBase, ResizableOptions, DraggableOptions } from "@interactjs/actions";
import interact from "interactjs";

/**
 * Props for the Interactable component
 */
export interface InteractableProps {
  /**
   * The children to be wrapped by the Interactable component.
   */
  children: React.ReactElement;
  /**
   * Reference to the interactable instance, optional.
   */
  interactRef?: React.MutableRefObject<InteractableBase>;
  /**
   * Whether the element is draggable or not.
   */
  draggable: boolean;
  /**
   * Options for drag functionality, if applicable.
   */
  draggableOptions: DraggableOptions;
  /**
   * Whether the element is resizable or not.
   */
  resizable: boolean;
  /**
   * Options for resizable functionality, if applicable.
   */
  resizableOptions: ResizableOptions;
}

/**
 * Interactable component implementation
 */
function Interactable({ children, interactRef, draggable, resizable, draggableOptions, resizableOptions }: InteractableProps) {
  /**
   * Reference to the element being wrapped by the Interactable component.
   */
  const nodeRef = React.useRef<HTMLElement>();
  /**
   * The interactable instance, if applicable.
   */
  const interactable = React.useRef<InteractableBase>();
  /**
   * Reference to the drag options, if applicable.
   */
  const draggableOptionsRef = React.useRef<DraggableOptions>();
  /**
   * Reference to the resizable options, if applicable.
   */
  const resizableOptionsRef = React.useRef<ResizableOptions>();

  /**
   * Effect to update the drag and resize options when they change.
   */
  React.useEffect(() => {
    draggableOptionsRef.current = { ...draggableOptions };
    resizableOptionsRef.current = { ...resizableOptions };
  }, [draggableOptions, resizableOptions]);

  /**
   * Set up interactions for the element.
   */
  const setInteractions = () => {
    if (draggable) {
      interactable.current.draggable({
        ...draggableOptionsRef.current,
        onstart: (e) => draggableOptionsRef.current.onstart && (draggableOptionsRef.current.onstart as (e: DragEvent) => any)(e),
        onmove: (e) => draggableOptionsRef.current.onmove && (draggableOptionsRef.current.onmove as (e: DragEvent) => any)(e),
        onend: (e) => draggableOptionsRef.current.onend && (draggableOptionsRef.current.onend as (e: DragEvent) => any)(e),
      });
    }
    if (resizable) {
      interactable.current.resizable({
        ...resizableOptionsRef.current,
        onstart: (e) => resizableOptionsRef.current.onstart && (resizableOptionsRef.current.onstart as (e: DragEvent) => any)(e),
        onmove: (e) => resizableOptionsRef.current.onmove && (resizableOptionsRef.current.onmove as (e: DragEvent) => any)(e),
        onend: (e) => resizableOptionsRef.current.onend && (resizableOptionsRef.current.onend as (e: DragEvent) => any)(e),
      });
    }
  };

  /**
   * Effect to set up interactions for the element when it mounts.
   */
  React.useEffect(() => {
    interactable.current?.unset();
    interactable.current = interact(nodeRef.current);
    interactRef.current = interactable.current;
    setInteractions();
  }, [draggable, resizable]);

  return React.cloneElement(children as React.ReactElement, {
    ref: nodeRef,
    draggable: false,
  });
}

export default Interactable;