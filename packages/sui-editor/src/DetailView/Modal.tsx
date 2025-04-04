/**
 * A functional component that renders a simple modal dialog.
 *
 * @description
 * This component uses React 18 and Material UI (MUI) to create a basic modal window with a title, description, and close button.
 * It demonstrates how to use state to control the visibility of the modal and handle user interactions.
 */

import * as React from 'react';
import { styled } from '@mui/material';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Box from "@mui/material/Box";

/**
 * SimpleModal component props
 *
 * @typedef {Object} Props
 * @property {boolean} [open] - The initial state of the modal's visibility.
 */

interface Props {
  /**
   * The initial state of the modal's visibility.
   */
  open?: boolean;
}

/**
 * SimpleModal component functionality
 *
 * @description
 * This component uses React 18 to manage its state and handle user interactions. It renders a button that opens the modal when clicked, and a close button to dismiss it.
 */

function SimpleModal({ open = false }: Props) {
  const [openState, setOpen] = React.useState(open);

  /**
   * Handles the opening of the modal.
   */
  const handleOpen = () => setOpen(true);
  
  /**
   * Handles the closing of the modal.
   */
  const handleClose = () => setOpen(false);

  return (
    <div>
      {/**
       * Button that opens the modal when clicked.
       */}
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Open Modal
      </Button>
      {/**
       * The modal dialog itself, which is conditionally rendered based on its visibility state.
       */}
      <Modal
        open={openState}
        onClose={handleClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        {/**
         * The styled container for the modal content, which is positioned absolutely and has a background paper theme.
         */}
        <Box sx={(theme) => ({
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          backgroundColor: theme.palette.background.paper,
          border: '2px solid #000',
          boxShadow: 24,
          padding: theme.spacing(2, 4, 3),
        })}>
          {/**
           * The title of the modal dialog.
           */}
          <h2 id="modal-title">Simple Modal</h2>
          {/**
           * A brief description of the modal dialog.
           */}
          <p id="modal-description">This is a simple modal dialog using React 18 and @mui/material/styled.</p>
          {/**
           * Button that closes the modal when clicked.
           */}
          <Button variant="contained" onClick={handleClose}>Close</Button>
        </Box>
      </Modal>
    </div>
  );
}

export default SimpleModal;