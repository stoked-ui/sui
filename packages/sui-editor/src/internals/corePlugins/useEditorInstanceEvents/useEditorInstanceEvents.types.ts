import { EditorPluginSignature } from '../../models/plugin';
import { EditorEventListener } from '../../models/events';

/**
 * Interface defining the instance methods for handling editor events.
 */
export interface UseEditorInstanceEventsInstance {
  /**
   * Should never be used directly.
   * Please use `useInstanceEventHandler` instead.
   * @param {string} eventName - Name of the event to subscribe to.
   * @param {EditorEventListener<any>} handler - Event handler to call when the event is published.
   * @returns {() => void} Cleanup function.
   */
  $$subscribeEvent: (eventName: string, handler: EditorEventListener<any>) => () => void;
  /**
   * Should never be used directly.
   * Please use `publishEditorEvent` instead.
   * @param {string} eventName - Name of the event to publish.
   * @param {any} params - The params to publish with the event.
   */
  $$publishEvent: (eventName: string, params: any) => void;
}

/**
 * Type definition for the signature of using editor instance events.
 */
export type UseEditorInstanceEventsSignature = EditorPluginSignature<{
  instance: UseEditorInstanceEventsInstance;
}>;