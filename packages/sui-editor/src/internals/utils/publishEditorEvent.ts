/**
 * Publishes an editor event with specified parameters.
 * 
 * @template Instance - The instance type that extends UseEditorInstanceEventsInstance with a $$signature property.
 * @template E - The event key of EditorUsedEvents that corresponds to the instance's $$signature.
 * 
 * @param {Instance} instance - The instance of the editor to publish the event from.
 * @param {E} eventName - The key of the event to be published.
 * @param {EditorUsedEvents<Instance['$$signature']>[E]['params']} params - The parameters for the event to be published.
 * 
 * @returns {void}
 * 
 * @fires {string} eventName - The name of the event being published.
 * 
 * @example
 * publishEditorEvent(editorInstance, 'someEvent', { data: 'example' });
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
  instance.$$publishEvent(eventName as string, params);
};