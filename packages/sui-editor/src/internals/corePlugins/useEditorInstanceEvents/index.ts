/**
 * Exports the useEditorInstanceEvents hook.
 *
 * The useEditorInstanceEvents hook is used to subscribe and unsubscribe from events
 * emitted by an editor instance. It returns a signature object that can be used
 * to define event handlers for these events.
 */
export { useEditorInstanceEvents } from './useEditorInstanceEvents';

/**
 * Exports the type definition for the UseEditorInstanceEventsSignature.
 *
 * The UseEditorInstanceEventsSignature is a type that defines the shape of an
 * object returned by the useEditorInstanceEvents hook. It contains a set of event
 * handlers that can be used to subscribe and unsubscribe from events emitted by
 * an editor instance.
 */
export type { UseEditorInstanceEventsSignature } from './useEditorInstanceEvents.types';