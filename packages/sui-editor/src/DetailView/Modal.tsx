import * as React from 'react';
import { styled } from '@mui/material';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Box from "@mui/material/Box";

// Functional component using traditional function declaration
function SimpleModal() {
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Open Modal
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
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
          <h2 id="modal-title">Simple Modal</h2>
          <p id="modal-description">This is a simple modal dialog using React 18 and @mui/material/styled.</p>
          <Button variant="contained" onClick={handleClose}>Close</Button>
        </Box>
      </Modal>
    </div>
  );
}

export default SimpleModal;

