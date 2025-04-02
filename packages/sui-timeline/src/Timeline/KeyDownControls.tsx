import * as React from 'react';
import { useTimeline } from '../TimelineProvider';

export default function KeyDownControls() {
  const { state, dispatch } = useTimeline();
  const { flags, settings } = state;

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {

      const editorElement = document.getElementById(settings.componentId);
      if (flags.fullscreen || editorElement && !editorElement.contains(event.target as Node)) {
        return; // Ignore keydown if not within the editor
      }

      const isMac = navigator.userAgent.includes('Mac');
      const isUndo = (isMac && event.metaKey && event.key === 'z') || (!isMac && event.ctrlKey && event.key === 'z');
      const isRedo =
        (isMac && event.metaKey && event.shiftKey && event.key === 'z') ||
        (!isMac && event.ctrlKey && event.key === 'y');

      if (isUndo) {
        event.preventDefault();
        dispatch({ type: 'UNDO' });
      } else if (isRedo) {
        event.preventDefault();
        dispatch({ type: 'REDO' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch]);

  return null; // This component doesn't render anything visible
};


