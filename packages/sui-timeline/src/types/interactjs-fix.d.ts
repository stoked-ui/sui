/**
 * Override for interactjs types to fix type errors and prevent duplicate declarations
 */
declare module '@interactjs/types' {
  /**
   * Just enough to satisfy the compiler
   */
  export default interface InteractStatic {
    // Add minimal interface definition
  }

  /**
   * Fix for duplicate property declarations errors
   * TS2717: Subsequent property declarations must have the same type
   */
  export interface ActionProps {
    // Override these properties to fix type errors
  }

  /**
   * Overriding event types to prevent duplicate declarations
   */
  export interface EventTypes {
    'interactions:new': any;
    'interactions:down': any;
    'interactions:move': any;
    'interactions:up': any;
    'interactions:update-pointer': any;
    'interactions:remove-pointer': any;
    'interactions:blur': any;
    'interactions:before-action-start': any;
    'interactions:action-start': any;
    'interactions:after-action-start': any;
    'interactions:before-action-move': any;
    'interactions:action-move': any;
    'interactions:after-action-move': any;
    'interactions:before-action-end': any;
    'interactions:action-end': any;
    'interactions:after-action-end': any;
    'interactions:stop': any;
    'interactions:find': any;
  }

  /**
   * Override Interaction to fix type errors
   */
  export interface Scope {
    Interaction: any;
    interactions: any;
  }
}