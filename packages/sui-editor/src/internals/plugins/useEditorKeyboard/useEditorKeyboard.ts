import * as React from 'react';
import { useRtl } from '@mui/system/RtlProvider';
import useEventCallback from '@mui/utils/useEventCallback';
import { EditorPlugin } from '../../models';
import { EditorFirstCharMap, UseEditorKeyboardSignature } from './useEditorKeyboard.types';
import { ITimelineAction } from '@stoked-ui/timeline';

/**
 * Checks if a character is printable.
 *
 * @param string The character to check.
 * @returns True if the character is printable, false otherwise.
 */
function isPrintableCharacter(string: string): boolean {
  return !!string && string.length === 1 && !!string.match(/\S/);
}

/**
 * EditorPlugin interface for useEditorKeyboard.
 *
 * @implements {EditorPlugin<UseEditorKeyboardSignature>}
 */
export const useEditorKeyboard: EditorPlugin<UseEditorKeyboardSignature> = () => {
  /**
   * Whether the editor is in RTL mode.
   *
   * @type {boolean}
   */
  const isRtl = useRtl();

  /**
   * The first character map used by the editor.
   *
   * @type {React.RefObject<EditorFirstCharMap>}
   */
  const firstCharMap = React.useRef<EditorFirstCharMap>({});

  /**
   * Updates the first character map.
   *
   * @param callback The function to call with the updated first char map.
   * @returns A function that updates the first char map.
   */
  const updateFirstCharMap = useEventCallback(
    (callback: (firstCharMap: EditorFirstCharMap) => EditorFirstCharMap) => {
      firstCharMap.current = callback(firstCharMap.current);
    },
  );

  /**
   * Handles an action in the editor.
   *
   * @param event The keyboard event that triggered this function.
   * @param action The action to handle.
   */
  const handleAction = (event: KeyboardEvent, action: ITimelineAction) => {
    // TODO: Implement handling of actions
  };

  /**
   * Handles an item key down in the editor.
   *
   * @param event The keyboard event that triggered this function.
   * @param type The type of key pressed.
   * @param item The item being edited.
   */
  const handleItemKeyDown = (
    event: KeyboardEvent,
    type: string,
    item: any
  ) => {
    // Prevent default behavior
    event.preventDefault();

    switch (type) {
      case 'action':
        handleAction(event, item);
        return;
      default:
        console.log('key down not handled');
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
      case key === 'Backspace': {
        console.log('target', event.currentTarget);
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
      case !ctrlPressed && !key.includes('Meta') && !key.includes('Alt'): {

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