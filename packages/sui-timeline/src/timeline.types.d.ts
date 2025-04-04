/**
 * Global Window interface declaration
 */
declare global {
  /**
   * The window object.
   *
   * @description Represents the window object, which provides access to variables and functions that are part of the Global object (window).
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Window
   */
  interface Window {
    /**
     * End method.
     *
     * @description This property is not a standard JavaScript API. It might be used in specific libraries or frameworks.
     */
    end: any;

    /**
     * Sets the scale width of an element.
     *
     * @param {number} scaleWidth The new scale width value.
     * @see setScaleWidth method
     */
    setScaleWidth: (scaleWidth: number) => void;

    /**
     * Sets the scale factor for a map view.
     *
     * @param {number} scale The new scale value.
     * @see setScale method
     */
    setScale: (scale: number) => void;

    /**
     * Sets the split count for a map view.
     *
     * @param {number} splitCount The new split count value.
     * @see setScaleSplitCount method
     */
    setScaleSplitCount: (splitCount: number) => void;

    /**
     * Sets the minimum scale count for a map view.
     *
     * @param {number} minScaleCount The new minimum scale count value.
     * @see setMinScaleCount method
     */
    setMinScaleCount: (minScaleCount: number) => void;

    /**
     * Sets the maximum scale count for a map view.
     *
     * @param {number} maxScaleCount The new maximum scale count value.
     * @see setMaxScaleCount method
     */
    setMaxScaleCount: (maxScaleCount: number) => void;

    /**
     * Gets the current setting of the map view.
     *
     * @returns {*} The current setting value.
     * @see setSetting method
     */
    getSetting: () => any;

    /**
     * Gets the current state of the map view.
     *
     * @returns {*} The current state value.
     * @see getState method
     */
    getState: () => any;

    /**
     * Re-renders the map view.
     *
     * @description This property is not a standard JavaScript API. It might be used in specific libraries or frameworks.
     */
    reRender: any;

    /**
     * Updates the thumb size of an element.
     *
     * @param {number} thumbSize The new thumb size value.
     * @see updateThumbSize method
     */
    updateThumbSize: (thumbSize: number) => void;

    /**
     * Saves a URL.
     *
     * @description This property is not a standard JavaScript API. It might be used in specific libraries or frameworks.
     */
    saveUrl: any;
  }
}

export {};