import {
  UseEditorInstanceEventsInstance
} from '../corePlugins/useEditorInstanceEvents/useEditorInstanceEvents.types';
import { EditorAnyPluginSignature, EditorUsedEvents } from '../models';

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
