/**
 * Controller export module.
 *
 * This module exports the Controller class and related types.
 */

import Controller from './Controller';
import Controllers from './Controllers';

/**
 * Exports the Controller class as the default export.
 */
export default Controller;

/**
 * Exports the Controllers type.
 *
 * @type {Array<Controller>}
 */
export { Controllers };

/**
 * Exports controller-related types from this module.
 */
export * from './Controller.types';
export * from './ControllerParams';