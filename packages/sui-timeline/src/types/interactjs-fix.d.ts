/**
 * Override for interactjs types.
 *
 * This module provides overrides to fix type errors and ensure compatibility with the current version of interactjs.
 */
declare module '@interactjs/types' {

  /**
   * Minimal interface definition for InteractStatic.
   */
  export default interface InteractStatic {
    // Add minimal interface definition
  }

  /**
   * Interface for ActionProps to override properties causing type errors.
   *
   * @see {@link https://github.com/interactjs/types#ts2717} for more information on the error TS2717.
   */
  export interface ActionProps {
    // Override these properties to fix type errors
  }

  /**
   * Overriding event types to prevent duplicate declarations.
   *
   * This interface defines the available event types and assigns them specific values.
   */
  export interface EventTypes {
    /**
     * Event type for when an interaction is created.
     */
    'interactions:new': any;

    /**
     * Event type for when a pointer is pressed down.
     */
    'interactions:down': any;

    /**
     * Event type for when the pointer moves.
     */
    'interactions:move': any;

    /**
     * Event type for when the pointer is released up.
     */
    'interactions:up': any;

    /**
     * Event type for when the interaction update pointer.
     */
    'interactions:update-pointer': any;

    /**
     * Event type for when the pointer is removed.
     */
    'interactions:remove-pointer': any;

    /**
     * Event type for when the element loses focus (blur).
     */
    'interactions:blur': any;

    /**
     * Event type for before an action starts.
     */
    'interactions:before-action-start': any;

    /**
     * Event type for when an action starts.
     */
    'interactions:action-start': any;

    /**
     * Event type for after an action starts.
     */
    'interactions:after-action-start': any;

    /**
     * Event type for before an action moves.
     */
    'interactions:before-action-move': any;

    /**
     * Event type for when an action moves.
     */
    'interactions:action-move': any;

    /**
     * Event type for after an action moves.
     */
    'interactions:after-action-move': any;

    /**
     * Event type for before an action ends.
     */
    'interactions:before-action-end': any;

    /**
     * Event type for when an action ends.
     */
    'interactions:action-end': any;

    /**
     * Event type for after an action ends.
     */
    'interactions:after-action-end': any;

    /**
     * Event type for when the interaction stops.
     */
    'interactions:stop': any;

    /**
     * Event type for finding elements.
     */
    'interactions:find': any;
  }

  /**
   * Interface for Scope to override Interaction and interactions properties.
   *
   * @see {@link https://github.com/interactjs/types} for more information on the interactjs types.
   */
  export interface Scope {
    /**
     * The Interaction object.
     */
    Interaction: any;

    /**
     * The interactions object.
     */
    interactions: any;
  }
}