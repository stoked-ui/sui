/**
 * @typedef {Object} BlendMode
 * @property {'normal'} The action is not affected by blending.
 * @property {'multiply'} Multiply the color of the action with the background.
 * @property {'screen'} Divide the color of the action by the background to produce a brightened effect.
 * @property {'overlay'} Subtract the background from the action's color to produce an overlay effect.
 * @property {'darken'} Multiply the action's color by 0 (i.e., invert it) and add it to the background.
 * @property {'lighten'} Add the action's color to the background and divide the result by 255 to produce a lightened effect.
 * @property {'color-dodge'} Multiply the action's color with the background to produce a brightened effect, without changing its hue or saturation.
 * @property {'color-burn'} Subtract the background from the action's color to produce a darkened effect, without changing its hue or saturation.
 * @property {'hard-light'} Add the action's color to the background and multiply the result by 255 to produce a lightened effect, without changing its hue or saturation.
 * @property {'soft-light'} Subtract the action's color from the background and divide the result by 255 to produce a darkened effect, without changing its hue or saturation.
 * @property {'difference'} Divide the difference between the background and the action's color by 256 to produce a brightened effect.
 * @property {'exclusion'} Add the action's color to the background and subtract the result from 1 to produce a darkened effect.
 * @property {'hue'} Subtract the hue of the action from the hue of the background to produce an inverted effect without changing its saturation or lightness.
 * @property {'saturation'} Divide the saturation of the action by 256 to produce a desaturated effect, with no change in its hue or lightness.
 * @property {'color'} Multiply the color of the action with the color of the background to produce a brightened effect without changing its hue or saturation.
 * @property {'luminosity'} Subtract the luminosity of the action from the luminosity of the background to produce a darkened effect, with no change in its hue or saturation.
 * @property {'plus-darker'} Multiply the action's color with 0.5 and add it to the background to produce a darker effect.
 * @property {'plus-lighter'} Add the action's color to the background and multiply the result by 0.5 to produce a lighter effect.
 */

/**
 * @typedef {Object} Fit
 * @property {'fill'} The action is resized to fill the given dimension.
 * @property {'cover'} The action keeps its aspect ratio and fills the given dimension, with clipping if necessary.
 * @property {'contain'} The action keeps its aspect ratio, but is resized to fit within the given dimension.
 * @property {'none'} The default size of the action, without resizing it.
 */

/**
 * @interface IEditorFileAction
 * @extends {ITimelineFileAction}
 * @description An editor file action with additional properties for customization and styling.
 */
export interface IEditorFileAction extends ITimelineFileAction {
  /**
   * @type {React.CSSProperties} The CSS styles to apply to the editor file action.
   */
  style?: React.CSSProperties;

  /**
   * @type {number} The velocity of the editor file action, representing its speed or acceleration.
   */
  velocity?: number;

  /**
   * @type {number} The acceleration of the editor file action, representing its rate of change in velocity.
   */
  acceleration?: number;

  /**
   * @type {number} The width of the editor file action, represented as a pixel value.
   */
  width?: number;

  /**
   * @type {number} The height of the editor file action, represented as a pixel value.
   */
  height?: number;

  /**
   * @type {number} The z-index of the editor file action, representing its stacking order.
   */
  z?: number;

  /**
   * @type {(string|number)} The x-coordinate of the editor file action, or null for no offset.
   */
  x?: number | string;

  /**
   * @type {(string|number)} The y-coordinate of the editor file action, or null for no offset.
   */
  y?: number | string;

  /**
   * @type {Fit} The fit behavior of the editor file action, controlling its resizing and aspect ratio.
   */
  fit?: Fit;
}

/**
 * @interface IEditorAction
 * @extends {ITimelineAction}
 * @description An editor action with properties for customization and styling.
 */
export interface IEditorAction extends ITimelineAction {
  /**
   * @type {string} The unique identifier of the editor action, used to track its position and state.
   */
  id: string;

  /**
   * @type {React.CSSProperties} The CSS styles to apply to the editor action.
   */
  style?: React.CSSProperties;

  /**
   * @type {number} The width of the editor action, represented as a pixel value.
   */
  width: number;

  /**
   * @type {number} The height of the editor action, represented as a pixel value.
   */
  height: number;

  /**
   * @type {number} The z-index of the editor action, representing its stacking order.
   */
  z: number;

  /**
   * @type {(string|number)} The x-coordinate of the editor action, or null for no offset.
   */
  x?: number;

  /**
   * @type {(string|number)} The y-coordinate of the editor action, or null for no offset.
   */
  y?: number;

  /**
   * @type {DrawData} The next frame data to be applied to the editor action.
   */
  nextFrame?: DrawData;

  /**
   * @type {Fit} The fit behavior of the editor action, controlling its resizing and aspect ratio.
   */
  fit: Fit;
}

/**
 * @function
 * @description A function that takes an editor file action and returns a styled version with additional CSS styles.
 * @param {IEditorFileAction} editorFileAction The editor file action to be styled.
 * @returns {IEditorFileAction} The styled editor file action with the applied CSS styles.
 */
function styleEditorFileAction(editorFileAction: IEditorFileAction): IEditorFileAction {
  // TO DO: implement the function to apply the styles
}

/**
 * @function
 * @description A function that takes an editor action and returns a styled version with additional CSS styles.
 * @param {IEditorAction} editorAction The editor action to be styled.
 * @returns {IEditorAction} The styled editor action with the applied CSS styles.
 */
function styleEditorAction(editorAction: IEditorAction): IEditorAction {
  // TO DO: implement the function to apply the styles
}

/**
 * @function
 * @description A function that takes an editor file action and returns a customized version with additional properties for styling.
 * @param {IEditorFileAction} editorFileAction The editor file action to be customized.
 * @returns {IEditorFileAction} The customized editor file action with the added properties.
 */
function customizeEditorFileAction(editorFileAction: IEditorFileAction): IEditorFileAction {
  // TO DO: implement the function to add the customization properties
}

/**
 * @function
 * @description A function that takes an editor action and returns a customized version with additional properties for styling.
 * @param {IEditorAction} editorAction The editor action to be customized.
 * @returns {IEditorAction} The customized editor action with the added properties.
 */
function customizeEditorAction(editorAction: IEditorAction): IEditorAction {
  // TO DO: implement the function to add the customization properties
}

// Export the classes and functions for use in other files.