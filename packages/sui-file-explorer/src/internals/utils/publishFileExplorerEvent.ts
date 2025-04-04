/**
 * Publishes a file explorer event.
 *
 * @param {Object} instance - The useFileExplorerInstanceEvents instance.
 * @param {string} eventName - The name of the event to publish.
 * @param {object} params - The parameters for the published event.
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
  /**
   * Publishes an event with the given name and parameters.
   */
  instance.$$publishEvent(eventName as string, params);
};