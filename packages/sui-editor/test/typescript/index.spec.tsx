/**
 * React component demonstrating the usage of standard props with callback ref.
 * @returns {JSX.Element} JSX element representing the component
 */
function TestStandardPropsCallbackRefUsage() {
  /**
   * Reference to the content element within the dialog.
   * @type {React.MutableRefObject<HTMLDivElement | null>}
   */
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  /**
   * Callback function to set the content ref.
   * @param {HTMLDivElement | null} node - The HTML element to set as the ref
   */
  const setContentRef = React.useCallback((node: HTMLDivElement | null) => {
    contentRef.current = node;
    // ...
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
 * React component demonstrating the usage of standard props with object ref.
 * @returns {JSX.Element} JSX element representing the component
 */
function TestStandardPropsObjectRefUsage() {
  /**
   * Reference to the content element within the dialog.
   * @type {React.MutableRefObject<HTMLDivElement | null>}
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