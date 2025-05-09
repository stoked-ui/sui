import * as React from 'react';
import {EventManager} from '../../utils/EventManager';
import type {FileExplorerPlugin} from '../../models';
import {UseFileExplorerInstanceEventsSignature} from './useFileExplorerInstanceEvents.types';
import type {FileExplorerEventListener} from '../../models/events';

/**
 * Checks if an event is a synthetic event.
 * @param {any} event - The event to check.
 * @returns {boolean} - True if the event is a synthetic event, false otherwise.
 */
const isSyntheticEvent = (event: any): event is React.SyntheticEvent => {
  return event.isPropagationStopped !== undefined;
};

/**
 * Custom hook for managing file explorer instance events.
 * @returns {Object} - An object containing instance methods for publishing and subscribing to events.
 */
export const useFileExplorerInstanceEvents: FileExplorerPlugin<UseFileExplorerInstanceEventsSignature> = () => {
  const [eventManager] = React.useState(() => new EventManager());

  /**
   * Publishes an event with optional parameters.
   * @param {...any} args - The event name, parameters, and event object.
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
   * Subscribes to a specific event with a handler function.
   * @param {string} event - The event to subscribe to.
   * @param {FileExplorerEventListener<any>} handler - The event handler function.
   * @returns {Function} - A function to unsubscribe from the event.
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

  return {
    instance: {
      $$publishEvent: publishEvent,
      $$subscribeEvent: subscribeEvent,
    },
  };
};

useFileExplorerInstanceEvents.params = {};