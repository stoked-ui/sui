/**
 * This module provides the useFileExplorerInstanceEvents hook, which manages event publication and subscription for a File Explorer plugin.
 */

import * as React from 'react';
import {EventManager} from '../../utils/EventManager';
import type {FileExplorerPlugin} from '../../models';
import {UseFileExplorerInstanceEventsSignature} from './useFileExplorerInstanceEvents.types';
import type {FileExplorerEventListener} from '../../models/events';

/**
 * Checks if the provided event is a synthetic React event.
 *
 * @param {any} event The event to check.
 * @returns {boolean} True if the event is a synthetic React event, false otherwise.
 */
const isSyntheticEvent = (event: any): event is React.SyntheticEvent => {
  return event.isPropagationStopped !== undefined;
};

/**
 * A File Explorer plugin that manages event publication and subscription for an instance.
 *
 * @class useFileExplorerInstanceEvents
 * @implements {FileExplorerPlugin<UseFileExplorerInstanceEventsSignature>}
 */
export const useFileExplorerInstanceEvents: FileExplorerPlugin<UseFileExplorerInstanceEventsSignature> = () => {
  /**
   * The stateful EventManager component used to manage events for this plugin.
   *
   * @type {EventManager}
   */
  const [eventManager] = React.useState(() => new EventManager());

  /**
   * Publishes an event with the provided name and parameters.
   *
   * @param {...any[]} args The arguments to pass to the publish event function.
   * @returns {void}
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
   * Subscribes to an event with the provided name and handler.
   *
   * @param {string} event The event to subscribe to.
   * @param {FileExplorerEventListener<any>} handler The handler function for the event.
   * @returns {function} A function that will be called when the subscription is removed.
   */
  const subscribeEvent = React.useCallback(
    (event: string, handler: FileExplorerEventListener<any>) => {
      eventManager.on(event, handler);
      return () => {
        eventManager.removeListener(event, handler);
      };
    },
    [eventManager],
  );

  /**
   * The instance object for this plugin.
   *
   * @type {object}
   */
  return {
    instance: {
      $$publishEvent: publishEvent,
      $$subscribeEvent: subscribeEvent,
    },
  };
};

useFileExplorerInstanceEvents.params = {};