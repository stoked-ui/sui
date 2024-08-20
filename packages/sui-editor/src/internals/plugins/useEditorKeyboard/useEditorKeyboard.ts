import * as React from 'react';
import { useRtl } from '@mui/system/RtlProvider';
import useEventCallback from '@mui/utils/useEventCallback';
import { EditorPlugin } from '../../models';
import {
  EditorFirstCharMap,
  UseEditorKeyboardSignature,
} from './useEditorKeyboard.types';
import { MuiCancellableEvent } from '../../models/MuiCancellableEvent';

function isPrintableCharacter(string: string) {
  return !!string && string.length === 1 && !!string.match(/\S/);
}

export const useEditorKeyboard: EditorPlugin<
  UseEditorKeyboardSignature
> = ({ instance, params, state }) => {
  const isRtl = useRtl();
  const firstCharMap = React.useRef<EditorFirstCharMap>({});

  const updateFirstCharMap = useEventCallback(
    (callback: (firstCharMap: EditorFirstCharMap) => EditorFirstCharMap) => {
      firstCharMap.current = callback(firstCharMap.current);
    },
  );


  // ARIA specification: https://www.w3.org/WAI/ARIA/apg/patterns/editorview/#keyboardinteraction
  const handleItemKeyDown = (
    event: React.KeyboardEvent<HTMLElement> & MuiCancellableEvent,
    itemId: string,
  ) => {
    if (event.defaultMuiPrevented) {
      return;
    }

    if (
      event.altKey ||
      event.currentTarget !== (event.target as HTMLElement).closest('*[role="fileexploreritem"]')
    ) {
      return;
    }

    const ctrlPressed = event.ctrlKey || event.metaKey;
    const key = event.key;

    // eslint-disable-next-line default-case
    switch (true) {
      // Select the item when pressing "Space"
      case key === ' ': {
        break;
      }

      // If the focused item has children, we expand it.
      // If the focused item has no children, we select it.
      case key === 'Delete': {
        alert('delete');

        break;
      }

      // Focus the next focusable item
      case key === 'ArrowDown': {

        break;
      }

      // Focuses the previous focusable item
      case key === 'ArrowUp': {


        break;
      }

      // If the focused item is expanded, we move the focus to its first child
      // If the focused item is collapsed and has children, we expand it
      case (key === 'ArrowRight' && !isRtl) || (key === 'ArrowLeft' && isRtl): {

        break;
      }

      // If the focused item is expanded, we collapse it
      // If the focused item is collapsed and has a parent, we move the focus to this parent
      case (key === 'ArrowLeft' && !isRtl) || (key === 'ArrowRight' && isRtl): {

        break;
      }

      // Focuses the first item in the editor
      case key === 'Home': {

        event.preventDefault();
        break;
      }

      // Focuses the last item in the editor
      case key === 'End': {

        event.preventDefault();
        break;
      }

      // Expand all siblings that are at the same level as the focused item
      case key === '*': {
        break;
      }

      // Multi select behavior when pressing Ctrl + a
      // Selects all the items
      case key === 'a' && ctrlPressed: {
        event.preventDefault();
        break;
      }

      // Type-ahead
      // TODO: Support typing multiple characters
      case !ctrlPressed && !event.shiftKey && isPrintableCharacter(key): {

        break;
      }
    }
  };

  return {
    instance: {
      updateFirstCharMap,
      handleItemKeyDown,
    },
  };
};

useEditorKeyboard.params = {};
