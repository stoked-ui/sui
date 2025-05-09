/**
 * Publishes a file explorer event.
 * 
 * @template Instance - Type of the instance that triggers the event
 * @template E - Type of the event key
 * 
 * @param {Instance} instance - The instance triggering the event
 * @param {E} eventName - The name of the event to be triggered
 * @param {FileExplorerUsedEvents<Instance['$$signature']>[E]['params']} params - Parameters for the event
 * 
 * @returns {void}
 * 
 * @example
 * publishFileExplorerEvent(instance, 'fileSelected', { fileId: '123' });
 */
export const publishFileExplorerEvent = <
  Instance extends UseFileExplorerInstanceEventsInstance & {
    $$signature: FileExplorerAnyPluginSignature;
  },
  E extends keyof FileExplorerUsedEvents<Instance['$$signature']>,
>(
  instance: Instance,
  eventName: E,
  params: FileExplorerUsedEvents<Instance['$$signature']>[E]['params'],
) => {
  instance.$$publishEvent(eventName as string, params);
};