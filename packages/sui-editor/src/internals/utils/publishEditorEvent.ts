/**
 * Publishes an editor event to the given instance.
 *
 * @param <Instance> - The type of the editor instance that handles the event.
 * @param <E> - The type of the event name, where E is a key of EditorUsedEvents.
 * 
 * @param {Instance} instance - The editor instance to publish the event to.
 * @param {string} eventName - The name of the event to publish.
 * @param {*} params - The parameters for the event.
 *
 * @returns {void}
 */
export const publishEditorEvent = <
  Instance extends UseEditorInstanceEventsInstance & {
    $$signature: EditorAnyPluginSignature;
  },
  E extends keyof EditorUsedEvents<Instance['$$signature']>,
>(
  instance: Instance,
  eventName: E,
  params: EditorUsedEvents<Instance['$$signature']>[E]['params'],
) => {
  /**
   * Publishes the event to the given instance.
   */
  instance.$$publishEvent(eventName as string, params);
};