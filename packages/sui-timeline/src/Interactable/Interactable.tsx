/**
 * Component for creating interactable elements using interactjs library.
 * Interactable elements can be draggable and resizable.
 *
 * @param {InteractableProps} props - The props for the Interactable component.
 * @property {React.ReactElement} props.children - The child element to make interactable.
 * @property {React.MutableRefObject<InteractableBase>} [props.interactRef] - Ref to the interactable element.
 * @property {boolean} props.draggable - Flag to enable draggable functionality.
 * @property {DraggableOptions} props.draggableOptions - Options for draggable functionality.
 * @property {boolean} props.resizable - Flag to enable resizable functionality.
 * @property {ResizableOptions} props.resizableOptions - Options for resizable functionality.
 *
 * @returns {React.ReactElement} - The rendered Interactable component.
 *
 * @example
 * <Interactable draggable resizable draggableOptions={{}} resizableOptions={{}}>
 *   <div>Interactable Element</div>
 * </Interactable>
 */
function Interactable({ children, interactRef, draggable, resizable, draggableOptions, resizableOptions }: InteractableProps) {
  const nodeRef = React.useRef<HTMLElement>();
  const interactable = React.useRef<InteractableBase>();
  const draggableOptionsRef = React.useRef<DraggableOptions>();
  const resizableOptionsRef = React.useRef<ResizableOptions>();

  /**
   * Update draggable and resizable options on props change.
   */
  React.useEffect(() => {
    draggableOptionsRef.current = { ...draggableOptions };
    resizableOptionsRef.current = { ...resizableOptions };
  }, [draggableOptions, resizableOptions]);

  /**
   * Set up interactions based on draggable and resizable flags.
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
   * Initialize interactable element and set interactions on draggable and resizable changes.
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