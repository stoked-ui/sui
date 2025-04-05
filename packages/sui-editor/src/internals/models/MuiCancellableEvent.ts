/** Definition for a MUI (Material-UI) cancellable event object */
export type MuiCancellableEvent = {
  /** Indicates if the default MUI action has been prevented */
  defaultMuiPrevented?: boolean;
};

/** Definition for a MUI (Material-UI) cancellable event handler function */
export type MuiCancellableEventHandler<Event> = (event: Event & MuiCancellableEvent) => void;