/**
 * This module provides a hook for managing events related to file explorer instances.
 */

import {FileExplorerPluginSignature} from '../../models/plugin.types';
import {FileExplorerEventListener} from '../../models/events';

/**
 * Interface representing the events available on an instance of the File Explorer.
 */
export interface UseFileExplorerInstanceEventsInstance {
  /**
   * Subscribes to a specific event, returning a cleanup function when the subscription is
   *   removed.
   *
   * @param {string} eventName The name of the event to subscribe to.
   * @param {FileExplorerEventListener<any>} handler The event handler to call when the event is
   *   published.
   * @returns {() => void} A cleanup function that removes the subscription.
   */
  $$subscribeEvent: (eventName: string, handler: FileExplorerEventListener<any>) => () => void;
  
  /**
   * Publishes a specific event with the given parameters.
   *
   * @param {string} eventName The name of the event to publish.
   * @param {any} params The parameters to publish with the event.
   */
  $$publishEvent: (eventName: string, params: any) => void;
}

/**
 * Signature for the hook that returns an instance of the File Explorer events interface.
 */
export type UseFileExplorerInstanceEventsSignature = FileExplorerPluginSignature<{
  /**
   * The instance of the File Explorer events.
   */
  instance: UseFileExplorerInstanceEventsInstance;
}>;