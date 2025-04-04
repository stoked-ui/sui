/**
 * ContextMenu component for displaying a context menu on click.
 *
 * @description The ContextMenu component allows the user to right-click and view a dropdown menu.
 */

import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

/**
 * Props for the ContextMenu component
 */
interface Props {}

/**
 * State for the ContextMenu component
 */
type ContextMenuState = {
  mouseX: number;
  mouseY: number;
} | null;

/**
 * ContextMenu component.
 *
 * @description The ContextMenu component is a wrapper around the Menu component from Material-UI.
 * It displays a context menu on click, allowing the user to view additional options.
 */
export default function ContextMenu(props: Props) {
  const [contextMenu, setContextMenu] = React.useState<ContextMenuState>(null);

  /**
   * Handles the context menu event by preventing the default behavior and setting the mouse position.
   *
   * @param {React.MouseEvent} event The context menu event object.
   */
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
          // Other native context menus might behave different.
          // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
        null,
    );
  };

  /**
   * Closes the context menu by setting its state to null.
   */
  const handleClose = () => {
    setContextMenu(null);
  };

  return (
    <div onContextMenu={handleContextMenu} style={{ cursor: 'context-menu' }}>
      {/**
       * Typography component displaying a sample text.
       */}
      <Typography>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam ipsum purus,
        bibendum sit amet vulputate eget, porta semper ligula. Donec bibendum
        vulputate erat, ac fringilla mi finibus nec. Donec ac dolor sed dolor
        porttitor blandit vel vel purus. Fusce vel malesuada ligula. Nam quis
        vehicula ante, eu finibus est. Proin ullamcorper fermentum orci, quis finibus
        massa. Nunc lobortis, massa ut rutrum ultrices, metus metus finibus ex, sit
        amet facilisis neque enim sed neque. Quisque accumsan metus vel maximus
        consequat. Suspendisse lacinia tellus a libero volutpat maximus.
      </Typography>
    </div>
  );
}