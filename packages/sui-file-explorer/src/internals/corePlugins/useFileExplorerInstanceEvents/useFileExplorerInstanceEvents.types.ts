import {FileExplorerPluginSignature} from '../../models/plugin.types';
import {FileExplorerEventListener} from '../../models/events';

export interface UseFileExplorerInstanceEventsInstance {
  /**
   * Should never be used directly.
   * Please use `useInstanceEventHandler` instead.
   * @param {string} eventName Name of the event to subscribe to.
   * @param {FileExplorerEventListener<any>} handler Event handler to call when the event is
   *   published.
   * @returns {() => void} Cleanup function.
   */
  $$subscribeEvent: (eventName: string, handler: FileExplorerEventListener<any>) => () => void;
  /**
   * Should never be used directly.
   * Please use `publishFileExplorerEvent` instead.
   * @param {string} eventName Name of the event to publish.
   * @param {any} params The params to publish with the event.
   */
  $$publishEvent: (eventName: string, params: any) => void;
}

export type UseFileExplorerInstanceEventsSignature = FileExplorerPluginSignature<{
  instance: UseFileExplorerInstanceEventsInstance;
}>;

