import {EditorPluginSignature} from '../../models/plugin';
import {EditorEventListener} from '../../models/events';

/**
 * Provides functionality to subscribe and publish events for an editor instance.
 */
export interface UseEditorInstanceEventsInstance {
  /**
   * Subscribes to an event on the editor instance.
   * 
   * @param {string} eventName - Name of the event to subscribe to.
   * @param {EditorEventListener<any>} handler - Event handler to call when the event is published.
   * @returns {() => void} Cleanup function to unsubscribe from events.
   */
  $$subscribeEvent: (eventName: string, handler: EditorEventListener<any>) => () => void;
  
  /**
   * Publishes an event on the editor instance.
   * 
   * @param {string} eventName - Name of the event to publish.
   * @param {any} params - Parameters to publish with the event.
   */
  $$publishEvent: (eventName: string, params: any) => void;
}

/**
 * Type representing a signature for an editor plugin instance using `UseEditorInstanceEvents`.
 */
export type UseEditorInstanceEventsSignature = EditorPluginSignature<{
  /**
   * The instance of `UseEditorInstanceEvents` used to subscribe and publish events.
   */
  instance: UseEditorInstanceEventsInstance;
}>;