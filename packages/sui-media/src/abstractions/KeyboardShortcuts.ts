/**
 * Keyboard shortcuts abstraction for sui-media components
 *
 * This abstraction provides a framework-agnostic interface for registering and managing
 * keyboard shortcuts, allowing media components to work with any keyboard handling library
 * or custom implementation.
 *
 * @example
 * ```typescript
 * // Implementation with a custom hook
 * import { useEffect } from 'react';
 *
 * function useKeyboardShortcuts(): IKeyboardShortcuts {
 *   const shortcuts = new Map<string, ShortcutHandler>();
 *   const overlayCallbacks = new Set<OverlayCallback>();
 *
 *   useEffect(() => {
 *     const handleKeyDown = (e: KeyboardEvent) => {
 *       const key = getKeyString(e);
 *       const handler = shortcuts.get(key);
 *       if (handler) {
 *         if (handler(e) !== false) {
 *           e.preventDefault();
 *         }
 *       }
 *     };
 *
 *     window.addEventListener('keydown', handleKeyDown);
 *     return () => window.removeEventListener('keydown', handleKeyDown);
 *   }, []);
 *
 *   return {
 *     register: (key, handler, description) => {
 *       shortcuts.set(key, handler);
 *       return () => shortcuts.delete(key);
 *     },
 *     unregister: (key) => shortcuts.delete(key),
 *     showOverlay: () => {
 *       overlayCallbacks.forEach(cb => cb(true));
 *     },
 *     hideOverlay: () => {
 *       overlayCallbacks.forEach(cb => cb(false));
 *     },
 *     onOverlayChange: (callback) => {
 *       overlayCallbacks.add(callback);
 *       return () => overlayCallbacks.delete(callback);
 *     },
 *   };
 * }
 *
 * // Pass to media components
 * <MediaViewer shortcuts={useKeyboardShortcuts()} />
 * ```
 */

/**
 * Keyboard shortcut handler function
 * @param event - The keyboard event
 * @returns False to prevent default behavior, true or void to allow it
 */
export type ShortcutHandler = (event: KeyboardEvent) => void | boolean;

/**
 * Overlay visibility callback
 * @param visible - Whether the overlay should be visible
 */
export type OverlayCallback = (visible: boolean) => void;

/**
 * Keyboard shortcut definition
 */
export interface ShortcutDefinition {
  /**
   * The key combination (e.g., 'Space', 'Ctrl+P', 'Shift+?')
   */
  key: string;

  /**
   * Description of what the shortcut does
   */
  description: string;

  /**
   * Category for grouping shortcuts in the overlay
   */
  category?: string;

  /**
   * Handler function to execute when the shortcut is triggered
   */
  handler: ShortcutHandler;
}

/**
 * Keyboard shortcuts interface for managing keyboard interactions
 */
export interface IKeyboardShortcuts {
  /**
   * Register a keyboard shortcut
   * @param key - The key combination (e.g., 'Space', 'Ctrl+P', 'Shift+?')
   * @param handler - Function to execute when the shortcut is triggered
   * @param description - Optional description of what the shortcut does
   * @param category - Optional category for grouping shortcuts
   * @returns Cleanup function to unregister the shortcut
   */
  register: (
    key: string,
    handler: ShortcutHandler,
    description?: string,
    category?: string
  ) => (() => void) | void;

  /**
   * Register multiple shortcuts at once
   * @param shortcuts - Array of shortcut definitions
   * @returns Cleanup function to unregister all shortcuts
   */
  registerMany?: (shortcuts: ShortcutDefinition[]) => (() => void) | void;

  /**
   * Unregister a keyboard shortcut
   * @param key - The key combination to unregister
   */
  unregister: (key: string) => void;

  /**
   * Unregister all shortcuts
   */
  unregisterAll?: () => void;

  /**
   * Show the keyboard shortcuts overlay/help
   */
  showOverlay: () => void;

  /**
   * Hide the keyboard shortcuts overlay/help
   */
  hideOverlay: () => void;

  /**
   * Toggle the keyboard shortcuts overlay/help
   */
  toggleOverlay?: () => void;

  /**
   * Subscribe to overlay visibility changes
   * @param callback - Function to call when overlay visibility changes
   * @returns Cleanup function to unsubscribe
   */
  onOverlayChange: (callback: OverlayCallback) => (() => void) | void;

  /**
   * Get all registered shortcuts
   * @returns Array of all registered shortcut definitions
   */
  getAll?: () => ShortcutDefinition[];

  /**
   * Enable or disable keyboard shortcuts globally
   * @param enabled - Whether shortcuts should be enabled
   */
  setEnabled?: (enabled: boolean) => void;
}

/**
 * No-op keyboard shortcuts implementation that does nothing
 *
 * Use this as a default shortcuts provider for applications that don't need shortcuts,
 * or as a placeholder during development/testing.
 *
 * @example
 * ```typescript
 * import { NoOpKeyboardShortcuts } from '@stoked-ui/sui-media';
 *
 * // Use as default when shortcuts are optional
 * function MediaViewer({ shortcuts = NoOpKeyboardShortcuts }) {
 *   // Component will work but shortcuts won't do anything
 * }
 * ```
 */
export class NoOpKeyboardShortcuts implements IKeyboardShortcuts {
  register(
    key: string,
    handler: ShortcutHandler,
    description?: string,
    category?: string
  ): void {
    // No-op: does nothing
  }

  registerMany(shortcuts: ShortcutDefinition[]): void {
    // No-op: does nothing
  }

  unregister(key: string): void {
    // No-op: does nothing
  }

  unregisterAll(): void {
    // No-op: does nothing
  }

  showOverlay(): void {
    // No-op: does nothing
  }

  hideOverlay(): void {
    // No-op: does nothing
  }

  toggleOverlay(): void {
    // No-op: does nothing
  }

  onOverlayChange(callback: OverlayCallback): void {
    // No-op: does nothing
  }

  getAll(): ShortcutDefinition[] {
    return [];
  }

  setEnabled(enabled: boolean): void {
    // No-op: does nothing
  }
}

/**
 * Singleton instance of NoOpKeyboardShortcuts for convenience
 */
export const noOpKeyboardShortcuts = new NoOpKeyboardShortcuts();

/**
 * In-memory keyboard shortcuts implementation for testing and simple use cases
 *
 * @example
 * ```typescript
 * import { createInMemoryKeyboardShortcuts } from '@stoked-ui/sui-media';
 *
 * const shortcuts = createInMemoryKeyboardShortcuts();
 *
 * // Register shortcuts
 * shortcuts.register('Space', () => console.log('Space pressed'), 'Play/Pause');
 * shortcuts.register('f', () => console.log('F pressed'), 'Fullscreen');
 *
 * // Use in components or tests
 * <MediaViewer shortcuts={shortcuts} />
 * ```
 */
export function createInMemoryKeyboardShortcuts(): IKeyboardShortcuts {
  const shortcuts = new Map<string, ShortcutDefinition>();
  const overlayCallbacks = new Set<OverlayCallback>();
  let overlayVisible = false;
  let enabled = true;

  return {
    register(key, handler, description = '', category = 'General') {
      shortcuts.set(key, { key, handler, description, category });
      return () => shortcuts.delete(key);
    },

    registerMany(defs) {
      defs.forEach(def => shortcuts.set(def.key, def));
      return () => defs.forEach(def => shortcuts.delete(def.key));
    },

    unregister(key) {
      shortcuts.delete(key);
    },

    unregisterAll() {
      shortcuts.clear();
    },

    showOverlay() {
      if (!overlayVisible) {
        overlayVisible = true;
        overlayCallbacks.forEach(cb => cb(true));
      }
    },

    hideOverlay() {
      if (overlayVisible) {
        overlayVisible = false;
        overlayCallbacks.forEach(cb => cb(false));
      }
    },

    toggleOverlay() {
      overlayVisible = !overlayVisible;
      overlayCallbacks.forEach(cb => cb(overlayVisible));
    },

    onOverlayChange(callback) {
      overlayCallbacks.add(callback);
      return () => overlayCallbacks.delete(callback);
    },

    getAll() {
      return Array.from(shortcuts.values());
    },

    setEnabled(isEnabled) {
      enabled = isEnabled;
    },
  };
}

/**
 * Utility function to normalize key strings
 * Handles cross-browser differences and provides consistent key names
 *
 * @param event - Keyboard event
 * @returns Normalized key string (e.g., 'Ctrl+Space', 'Shift+?')
 */
export function normalizeKeyString(event: KeyboardEvent): string {
  const parts: string[] = [];

  if (event.ctrlKey || event.metaKey) parts.push('Ctrl');
  if (event.altKey) parts.push('Alt');
  if (event.shiftKey) parts.push('Shift');

  // Use event.key for most keys, fallback to event.code
  const key = event.key !== 'Unidentified' ? event.key : event.code;
  parts.push(key);

  return parts.join('+');
}

/**
 * Common media player keyboard shortcuts
 * Can be used as a starting point for custom implementations
 */
export const COMMON_MEDIA_SHORTCUTS = {
  PLAY_PAUSE: 'Space',
  SEEK_FORWARD: 'ArrowRight',
  SEEK_BACKWARD: 'ArrowLeft',
  VOLUME_UP: 'ArrowUp',
  VOLUME_DOWN: 'ArrowDown',
  MUTE: 'm',
  FULLSCREEN: 'f',
  THEATER_MODE: 't',
  NEXT: 'Shift+n',
  PREVIOUS: 'Shift+p',
  SHOW_HELP: '?',
} as const;
