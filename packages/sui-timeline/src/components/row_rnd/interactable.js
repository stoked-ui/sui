import interact from "interactjs";
import { cloneElement, useEffect, useRef } from "react";
export const InteractComp = ({ children, interactRef, draggable, resizable, draggableOptions, resizableOptions }) => {
    const nodeRef = useRef();
    const interactable = useRef();
    const draggableOptionsRef = useRef();
    const resizableOptionsRef = useRef();
    useEffect(() => {
        draggableOptionsRef.current = { ...draggableOptions };
        resizableOptionsRef.current = { ...resizableOptions };
    }, [draggableOptions, resizableOptions]);
    useEffect(() => {
        interactable.current && interactable.current.unset();
        interactable.current = interact(nodeRef.current);
        interactRef.current = interactable.current;
        setInteractions();
    }, [draggable, resizable]);
    const setInteractions = () => {
        if (draggable)
            interactable.current.draggable({
                ...draggableOptionsRef.current,
                onstart: (e) => draggableOptionsRef.current.onstart && draggableOptionsRef.current.onstart(e),
                onmove: (e) => draggableOptionsRef.current.onmove && draggableOptionsRef.current.onmove(e),
                onend: (e) => draggableOptionsRef.current.onend && draggableOptionsRef.current.onend(e),
            });
        if (resizable)
            interactable.current.resizable({
                ...resizableOptionsRef.current,
                onstart: (e) => resizableOptionsRef.current.onstart && resizableOptionsRef.current.onstart(e),
                onmove: (e) => resizableOptionsRef.current.onmove && resizableOptionsRef.current.onmove(e),
                onend: (e) => resizableOptionsRef.current.onend && resizableOptionsRef.current.onend(e),
            });
    };
    return cloneElement(children, {
        ref: nodeRef,
        draggable: false,
    });
};
//# sourceMappingURL=interactable.js.map