import * as React from 'react';
import { useTimeline } from '../TimelineProvider';

/**
 * KeyDownControls is a functional React component that handles keydown events in the editor.
 * It listens for undo and redo shortcuts and dispatches corresponding actions to the timeline provider.
 */

export default function KeyDownControls() {
  const { state, dispatch } = useTimeline();
  const { flags, settings } = state;

  /**
   * Handles keydown events.
   *
   * @param {KeyboardEvent} event - The keydown event object.
   */
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {

      // Check if the keydown event occurred outside the editor
      const editorElement = document.getElementById(settings.componentId);
      if (flags.fullscreen || editorElement && !editorElement.contains(event.target as Node)) {
        return; // Ignore keydown if not within the editor
      }

      /**
       * Checks if the undo shortcut was triggered.
       *
       * @type {boolean}
       */
      const isUndo = (isMac && event.metaKey && event.key === 'z') || (!isMac && event.ctrlKey && event.key === 'z');

      /**
       * Checks if the redo shortcut was triggered.
       *
       * @type {boolean}
       */
      const isRedo =
        (isMac && event.metaKey && event.shiftKey && event.key === 'z') ||
        (!isMac && event.ctrlKey && event.key === 'y');

      // Prevent default behavior and dispatch the corresponding action
      if (isUndo) {
        event.preventDefault();
        dispatch({ type: 'UNDO' });
      } else if (isRedo) {
        event.preventDefault();
        dispatch({ type: 'REDO' });
      }
    };

    /**
     * Adds a listener for keydown events.
     */
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup function to remove the listener when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch]);

  return null; // This component doesn't render anything visible
};