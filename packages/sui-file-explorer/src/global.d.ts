/**
 * Global namespace declaration.
 *
 * This block is added due to the 8-line rule and represents the highest possible scope in this section.
 */

declare global {
  /**
   * Interface representing a base file entity.
   *
   * @interface FileBase
   * @property {number} [visibleIndex] - Optional index of the visible item in the list.
   */
  interface FileBase {
    /**
     * Sets or gets the index of the visible file in the list.
     * @example
     * ```
     * const file = new FileBase();
     * file.visibleIndex = 0;
     * console.log(file.visibleIndex); // Output: 0
     * ```
     */
    visibleIndex?: number;
  }
}

export {};