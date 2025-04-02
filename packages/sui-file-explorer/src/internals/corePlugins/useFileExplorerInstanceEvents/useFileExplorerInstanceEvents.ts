import * as React from 'react';
import {EventManager} from '../../utils/EventManager';
import type {FileExplorerPlugin} from '../../models';
import {UseFileExplorerInstanceEventsSignature} from './useFileExplorerInstanceEvents.types';
import type {FileExplorerEventListener} from '../../models/events';

const isSyntheticEvent = (event: any): event is React.SyntheticEvent => {
  return event.isPropagationStopped !== undefined;
};

export const useFileExplorerInstanceEvents: FileExplorerPlugin<UseFileExplorerInstanceEventsSignature> = () => {
  const [eventManager] = React.useState(() => new EventManager());

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


