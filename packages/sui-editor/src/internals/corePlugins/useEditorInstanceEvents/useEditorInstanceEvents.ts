/**
 * Custom hook for managing editor instance events.
 * @description This hook provides functionality to publish and subscribe to editor instance events.
 * @returns {EditorPlugin<UseEditorInstanceEventsSignature>} The editor plugin for managing editor instance events.
 */
export const useEditorInstanceEvents: EditorPlugin<UseEditorInstanceEventsSignature> = () => {
  const [eventManager] = React.useState(() => new EventManager());

  /**
   * Checks if the event is a synthetic event.
   * @param {any} event - The event to check.
   * @returns {boolean} True if the event is a synthetic event, false otherwise.
   */
  const isSyntheticEvent = (event: any): event is React.SyntheticEvent => {
    return event.isPropagationStopped !== undefined;
  };

  /**
   * Publishes an event with the provided name, parameters, and optional event object.
   * @param {...any} args - The arguments for publishing the event.
   */
  const publishEvent = React.useCallback(
    (...args: any[]) => {
      const [name, params, event = {}] = args;
      event.defaultMuiPrevented = false;

      if (isSyntheticEvent(event) && event.isPropagationStopped()) {
        return;
      }

      eventManager.emit(name, params, event);
    },
    [eventManager],
  );

  /**
   * Subscribes to an editor instance event with the specified event name and event handler.
   * @param {string} event - The name of the event to subscribe to.
   * @param {EditorEventListener<any>} handler - The event handler function.
   * @returns {Function} A function to unsubscribe the event handler.
   */
  const subscribeEvent = React.useCallback(
    (event: string, handler: EditorEventListener<any>) => {
      eventManager.on(event, handler);
      return () => {
        eventManager.removeListener(event, handler);
      };
    },
    [eventManager],
  );

  return {
    instance: {
      $$publishEvent: publishEvent,
      $$subscribeEvent: subscribeEvent,
    },
  };
};

useEditorInstanceEvents.params = {};