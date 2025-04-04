/**
 * A React hook that provides event management functionality for an editor instance.
 *
 * This plugin exports a useEditorInstanceEvents hook, which returns an object containing
 * the publishEvent and subscribeEvent functions. These functions can be used to manage events
 * between the editor instance and its parent component.
 */
export const useEditorInstanceEvents: EditorPlugin<UseEditorInstanceEventsSignature> = () => {
  /**
   * The event manager instance used by this plugin.
   *
   * @type {EventManager}
   */
  const [eventManager] = React.useState(() => new EventManager());

  /**
   * Publishes an event to the event manager.
   *
   * This function takes one or more arguments, which are expected to be in the format
   * (name, params, event). The event object is cloned from the last argument and its
   * defaultMuiPrevented property is set to false. If the event is a synthetic event,
   * it will not be emitted.
   *
   * @param {...any[]} args - The arguments to publish as an event.
   */
  const publishEvent = React.useCallback(
    (...args: any[]) => {
      const [name, params, event] = args;
      event.defaultMuiPrevented = false;

      if (isSyntheticEvent(event) && event.isPropagationStopped()) {
        return;
      }

      eventManager.emit(name, params, event);
    },
    [eventManager],
  );

  /**
   * Subscribes an event handler to the event manager.
   *
   * This function takes two arguments: the event name and the event handler. It returns
   * a cleanup function that can be used to unsubscribe from the event.
   *
   * @param {string} event - The event name to subscribe to.
   * @param {EditorEventListener<any>} handler - The event handler to subscribe.
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
    /**
     * The publish event function.
     */
    instance: {
      $$publishEvent: publishEvent,
      $$subscribeEvent: subscribeEvent,
    },
  };

  useEditorInstanceEvents.params = {};
};