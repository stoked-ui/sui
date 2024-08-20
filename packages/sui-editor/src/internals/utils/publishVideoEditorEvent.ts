import {
  UseVideoEditorInstanceEventsInstance
} from '../corePlugins/useVideoEditorInstanceEvents/useVideoEditorInstanceEvents.types';
import { VideoEditorAnyPluginSignature, VideoEditorUsedEvents } from '../models';

export const publishVideoEditorEvent = <
  Instance extends UseVideoEditorInstanceEventsInstance & {
    $$signature: VideoEditorAnyPluginSignature;
  },
  E extends keyof VideoEditorUsedEvents<Instance['$$signature']>,
>(
  instance: Instance,
  eventName: E,
  params: VideoEditorUsedEvents<Instance['$$signature']>[E]['params'],
) => {
  instance.$$publishEvent(eventName as string, params);
};
