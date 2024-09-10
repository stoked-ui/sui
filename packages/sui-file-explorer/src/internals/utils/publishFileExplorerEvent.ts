import {
  UseFileExplorerInstanceEventsInstance
} from '../corePlugins/useFileExplorerInstanceEvents/useFileExplorerInstanceEvents.types';
import {FileExplorerAnyPluginSignature, FileExplorerUsedEvents} from '../models';

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
