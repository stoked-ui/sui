import * as React from 'react';
// @ts-ignore - no declaration file for @interactjs/actions
import { DragEvent, Interactable as InteractableBase, ResizableOptions, DraggableOptions } from "@interactjs/actions";
import interact from "interactjs";

export interface InteractableProps {
  children: React.ReactElement;
  interactRef?: React.MutableRefObject<InteractableBase>;
  draggable: boolean;
  draggableOptions: DraggableOptions;
  resizable: boolean;
  resizableOptions: ResizableOptions;
}

function Interactable({ children, interactRef, draggable, resizable, draggableOptions, resizableOptions }: InteractableProps) {
  const nodeRef = React.useRef<HTMLElement>();
  const interactable = React.useRef<InteractableBase>();
  const draggableOptionsRef = React.useRef<DraggableOptions>();
  const resizableOptionsRef = React.useRef<ResizableOptions>();

  React.useEffect(() => {
    draggableOptionsRef.current = { ...draggableOptions };
    resizableOptionsRef.current = { ...resizableOptions };
  }, [draggableOptions, resizableOptions]);


  const setInteractions = () => {
    if (draggable) {
      interactable.current!.draggable({
        ...draggableOptionsRef.current,
        onstart: (e: any) => draggableOptionsRef.current!.onstart && (draggableOptionsRef.current!.onstart as (e: DragEvent) => any)(e),
        onmove: (e: any) => draggableOptionsRef.current!.onmove && (draggableOptionsRef.current!.onmove as (e: DragEvent) => any)(e),
        onend: (e: any) => draggableOptionsRef.current!.onend && (draggableOptionsRef.current!.onend as (e: DragEvent) => any)(e),
      });
    }
    if (resizable) {
      interactable.current!.resizable({
        ...resizableOptionsRef.current,
        onstart: (e: any) => resizableOptionsRef.current!.onstart && (resizableOptionsRef.current!.onstart as (e: DragEvent) => any)(e),
        onmove: (e: any) => resizableOptionsRef.current!.onmove && (resizableOptionsRef.current!.onmove as (e: DragEvent) => any)(e),
        onend: (e: any) => resizableOptionsRef.current!.onend && (resizableOptionsRef.current!.onend as (e: DragEvent) => any)(e),
      });
    }
  };

  React.useEffect(() => {
    interactable.current?.unset();
    interactable.current = interact(nodeRef.current as HTMLElement);
    interactRef!.current = interactable.current;
    setInteractions();
  }, [draggable, resizable]);

  return React.cloneElement(children as React.ReactElement, {
    ref: nodeRef,
    draggable: false,
  });
}

export default Interactable;
