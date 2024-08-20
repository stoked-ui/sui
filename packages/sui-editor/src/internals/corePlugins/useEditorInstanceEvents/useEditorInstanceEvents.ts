import * as React from 'react';
import { EventManager } from '../../utils/EventManager';
import type { EditorPlugin } from '../../models';
import { UseEditorInstanceEventsSignature } from './useEditorInstanceEvents.types';
import type { EditorEventListener } from '../../models/events';

const isSyntheticEvent = (event: any): event is React.SyntheticEvent => {
  return event.isPropagationStopped !== undefined;
};

export const useEditorInstanceEvents: EditorPlugin<UseEditorInstanceEventsSignature> = () => {
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
    (event: string, handler: EditorEventListener<any>) => {
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

useEditorInstanceEvents.params = {};
