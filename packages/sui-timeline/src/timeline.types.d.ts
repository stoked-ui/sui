/**
 * Defines custom properties and methods added to the global window object.
 */
declare global {
  interface Window {
    /** Holds the value for the end property. */
    end: any;
    /** Sets the width scale. */
    setScaleWidth: any;
    /** Sets the scale. */
    setScale: any;
    /** Sets the split count for the scale. */
    setScaleSplitCount: any;
    /** Sets the minimum scale count. */
    setMinScaleCount: any;
    /** Sets the maximum scale count. */
    setMaxScaleCount: any;
    /** Sets a specific setting. */
    setSetting: any;
    /** Retrieves a specific setting. */
    getSetting: any;
    /** Retrieves the current state. */
    getState: any;
    /** Forces a re-render of the component. */
    reRender: any;
    /** Updates the thumb size. */
    updateThumbSize: any;
    /** Saves the current URL. */
    saveUrl: any;
  }
}

export {};