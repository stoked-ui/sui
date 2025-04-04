/**
 * Dialog component test cases
 */

import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

/**
 * Test case for standard props and ref usage
 */
function TestStandardPropsCallbackRefUsage() {
  /**
   * Reference to the content element
   * @type {HTMLDivElement | null}
   */
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  /**
   * Callback function to update the content reference
   * @param {HTMLDivElement | null} node - The new content element
   */
  const setContentRef = React.useCallback((node: HTMLDivElement | null) => {
    contentRef.current = node;
    // Update dialog content based on the new reference
  }, []);

  return (
    <Dialog open>
      <DialogTitle>Dialog Demo</DialogTitle>
      <DialogContent ref={setContentRef}>
        <DialogContentText>Dialog content</DialogContentText>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Test case for standard props and object reference usage
 */
function TestStandardPropsObjectRefUsage() {
  /**
   * Reference to the content element
   * @type {HTMLDivElement | null}
   */
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <Dialog open>
      <DialogTitle>Dialog Demo</DialogTitle>
      <DialogContent ref={contentRef}>
        <DialogContentText>Dialog content</DialogContentText>
      </DialogContent>
    </Dialog>
  );
}