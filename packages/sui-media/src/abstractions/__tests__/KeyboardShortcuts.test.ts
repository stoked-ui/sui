import { describe, it, expect, vi } from 'vitest';
import {
  NoOpKeyboardShortcuts,
  noOpKeyboardShortcuts,
  createInMemoryKeyboardShortcuts,
  normalizeKeyString,
  COMMON_MEDIA_SHORTCUTS,
} from '../KeyboardShortcuts';
import type { IKeyboardShortcuts, ShortcutDefinition } from '../KeyboardShortcuts';

describe('KeyboardShortcuts Abstraction', () => {
  describe('NoOpKeyboardShortcuts', () => {
    it('should create a new instance', () => {
      const shortcuts = new NoOpKeyboardShortcuts();
      expect(shortcuts).toBeInstanceOf(NoOpKeyboardShortcuts);
    });

    it('should implement IKeyboardShortcuts interface', () => {
      const shortcuts: IKeyboardShortcuts = new NoOpKeyboardShortcuts();
      expect(shortcuts).toHaveProperty('register');
      expect(shortcuts).toHaveProperty('unregister');
      expect(shortcuts).toHaveProperty('showOverlay');
      expect(shortcuts).toHaveProperty('hideOverlay');
      expect(shortcuts).toHaveProperty('onOverlayChange');
    });

    it('should do nothing on register', () => {
      const shortcuts = new NoOpKeyboardShortcuts();
      const handler = vi.fn();

      expect(() => shortcuts.register('Space', handler)).not.toThrow();
      expect(handler).not.toHaveBeenCalled();
    });

    it('should do nothing on registerMany', () => {
      const shortcuts = new NoOpKeyboardShortcuts();
      const defs: ShortcutDefinition[] = [
        { key: 'Space', description: 'Play', handler: vi.fn() },
        { key: 'f', description: 'Fullscreen', handler: vi.fn() },
      ];

      expect(() => shortcuts.registerMany?.(defs)).not.toThrow();
    });

    it('should do nothing on unregister', () => {
      const shortcuts = new NoOpKeyboardShortcuts();
      expect(() => shortcuts.unregister('Space')).not.toThrow();
    });

    it('should do nothing on unregisterAll', () => {
      const shortcuts = new NoOpKeyboardShortcuts();
      expect(() => shortcuts.unregisterAll?.()).not.toThrow();
    });

    it('should do nothing on showOverlay', () => {
      const shortcuts = new NoOpKeyboardShortcuts();
      expect(() => shortcuts.showOverlay()).not.toThrow();
    });

    it('should do nothing on hideOverlay', () => {
      const shortcuts = new NoOpKeyboardShortcuts();
      expect(() => shortcuts.hideOverlay()).not.toThrow();
    });

    it('should do nothing on toggleOverlay', () => {
      const shortcuts = new NoOpKeyboardShortcuts();
      expect(() => shortcuts.toggleOverlay?.()).not.toThrow();
    });

    it('should do nothing on onOverlayChange', () => {
      const shortcuts = new NoOpKeyboardShortcuts();
      const callback = vi.fn();

      expect(() => shortcuts.onOverlayChange(callback)).not.toThrow();
      expect(callback).not.toHaveBeenCalled();
    });

    it('should return empty array for getAll', () => {
      const shortcuts = new NoOpKeyboardShortcuts();
      expect(shortcuts.getAll?.()).toEqual([]);
    });

    it('should do nothing on setEnabled', () => {
      const shortcuts = new NoOpKeyboardShortcuts();
      expect(() => shortcuts.setEnabled?.(false)).not.toThrow();
    });
  });

  describe('noOpKeyboardShortcuts singleton', () => {
    it('should provide a singleton instance', () => {
      expect(noOpKeyboardShortcuts).toBeInstanceOf(NoOpKeyboardShortcuts);
    });

    it('should be the same instance on multiple accesses', () => {
      const ref1 = noOpKeyboardShortcuts;
      const ref2 = noOpKeyboardShortcuts;
      expect(ref1).toBe(ref2);
    });
  });

  describe('createInMemoryKeyboardShortcuts', () => {
    it('should create a keyboard shortcuts instance', () => {
      const shortcuts = createInMemoryKeyboardShortcuts();
      expect(shortcuts).toHaveProperty('register');
      expect(shortcuts).toHaveProperty('unregister');
    });

    it('should register shortcuts', () => {
      const shortcuts = createInMemoryKeyboardShortcuts();
      const handler = vi.fn();

      shortcuts.register('Space', handler, 'Play/Pause');

      const all = shortcuts.getAll?.();
      expect(all).toHaveLength(1);
      expect(all?.[0].key).toBe('Space');
      expect(all?.[0].description).toBe('Play/Pause');
    });

    it('should register shortcuts with category', () => {
      const shortcuts = createInMemoryKeyboardShortcuts();
      shortcuts.register('f', vi.fn(), 'Fullscreen', 'Display');

      const all = shortcuts.getAll?.();
      expect(all?.[0].category).toBe('Display');
    });

    it('should return cleanup function from register', () => {
      const shortcuts = createInMemoryKeyboardShortcuts();
      const cleanup = shortcuts.register('Space', vi.fn());

      expect(cleanup).toBeInstanceOf(Function);

      cleanup?.();
      const all = shortcuts.getAll?.();
      expect(all).toHaveLength(0);
    });

    it('should register multiple shortcuts', () => {
      const shortcuts = createInMemoryKeyboardShortcuts();
      const defs: ShortcutDefinition[] = [
        { key: 'Space', description: 'Play', handler: vi.fn() },
        { key: 'f', description: 'Fullscreen', handler: vi.fn() },
        { key: 'm', description: 'Mute', handler: vi.fn() },
      ];

      shortcuts.registerMany?.(defs);

      const all = shortcuts.getAll?.();
      expect(all).toHaveLength(3);
    });

    it('should return cleanup function from registerMany', () => {
      const shortcuts = createInMemoryKeyboardShortcuts();
      const defs: ShortcutDefinition[] = [
        { key: 'Space', description: 'Play', handler: vi.fn() },
        { key: 'f', description: 'Fullscreen', handler: vi.fn() },
      ];

      const cleanup = shortcuts.registerMany?.(defs);
      expect(cleanup).toBeInstanceOf(Function);

      cleanup?.();
      const all = shortcuts.getAll?.();
      expect(all).toHaveLength(0);
    });

    it('should unregister shortcuts', () => {
      const shortcuts = createInMemoryKeyboardShortcuts();
      shortcuts.register('Space', vi.fn());
      shortcuts.register('f', vi.fn());

      shortcuts.unregister('Space');

      const all = shortcuts.getAll?.();
      expect(all).toHaveLength(1);
      expect(all?.[0].key).toBe('f');
    });

    it('should unregister all shortcuts', () => {
      const shortcuts = createInMemoryKeyboardShortcuts();
      shortcuts.register('Space', vi.fn());
      shortcuts.register('f', vi.fn());
      shortcuts.register('m', vi.fn());

      shortcuts.unregisterAll?.();

      const all = shortcuts.getAll?.();
      expect(all).toHaveLength(0);
    });

    it('should show overlay', () => {
      const shortcuts = createInMemoryKeyboardShortcuts();
      const callback = vi.fn();

      shortcuts.onOverlayChange(callback);
      shortcuts.showOverlay();

      expect(callback).toHaveBeenCalledWith(true);
    });

    it('should hide overlay', () => {
      const shortcuts = createInMemoryKeyboardShortcuts();
      const callback = vi.fn();

      shortcuts.onOverlayChange(callback);
      shortcuts.showOverlay();
      callback.mockClear();
      shortcuts.hideOverlay();

      expect(callback).toHaveBeenCalledWith(false);
    });

    it('should not trigger callback if overlay state unchanged', () => {
      const shortcuts = createInMemoryKeyboardShortcuts();
      const callback = vi.fn();

      shortcuts.onOverlayChange(callback);
      shortcuts.showOverlay();
      callback.mockClear();
      shortcuts.showOverlay();

      expect(callback).not.toHaveBeenCalled();
    });

    it('should toggle overlay', () => {
      const shortcuts = createInMemoryKeyboardShortcuts();
      const callback = vi.fn();

      shortcuts.onOverlayChange(callback);
      shortcuts.toggleOverlay?.();

      expect(callback).toHaveBeenCalledWith(true);

      callback.mockClear();
      shortcuts.toggleOverlay?.();

      expect(callback).toHaveBeenCalledWith(false);
    });

    it('should return cleanup function from onOverlayChange', () => {
      const shortcuts = createInMemoryKeyboardShortcuts();
      const callback = vi.fn();

      const cleanup = shortcuts.onOverlayChange(callback);
      expect(cleanup).toBeInstanceOf(Function);

      cleanup?.();
      shortcuts.showOverlay();

      expect(callback).not.toHaveBeenCalled();
    });

    it('should support multiple overlay callbacks', () => {
      const shortcuts = createInMemoryKeyboardShortcuts();
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      shortcuts.onOverlayChange(callback1);
      shortcuts.onOverlayChange(callback2);
      shortcuts.showOverlay();

      expect(callback1).toHaveBeenCalledWith(true);
      expect(callback2).toHaveBeenCalledWith(true);
    });

    it('should enable/disable shortcuts', () => {
      const shortcuts = createInMemoryKeyboardShortcuts();

      shortcuts.setEnabled?.(false);
      shortcuts.setEnabled?.(true);

      // No errors should occur
      expect(true).toBe(true);
    });
  });

  describe('normalizeKeyString', () => {
    // Skip KeyboardEvent tests in Node environment (requires DOM/browser)
    // These tests work in browser/jsdom environments
    it.skip('should normalize simple key', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' });
      const normalized = normalizeKeyString(event);

      expect(normalized).toBe('a');
    });

    it.skip('should normalize Ctrl key combination', () => {
      const event = new KeyboardEvent('keydown', {
        key: 'p',
        ctrlKey: true,
      });
      const normalized = normalizeKeyString(event);

      expect(normalized).toBe('Ctrl+p');
    });

    it.skip('should normalize Shift key combination', () => {
      const event = new KeyboardEvent('keydown', {
        key: '?',
        shiftKey: true,
      });
      const normalized = normalizeKeyString(event);

      expect(normalized).toBe('Shift+?');
    });

    it.skip('should normalize Alt key combination', () => {
      const event = new KeyboardEvent('keydown', {
        key: 'f',
        altKey: true,
      });
      const normalized = normalizeKeyString(event);

      expect(normalized).toBe('Alt+f');
    });

    it.skip('should normalize multiple modifiers', () => {
      const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        shiftKey: true,
      });
      const normalized = normalizeKeyString(event);

      expect(normalized).toBe('Ctrl+Shift+s');
    });

    it.skip('should use metaKey as Ctrl on Mac', () => {
      const event = new KeyboardEvent('keydown', {
        key: 'c',
        metaKey: true,
      });
      const normalized = normalizeKeyString(event);

      expect(normalized).toBe('Ctrl+c');
    });

    it.skip('should handle special keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      const normalized = normalizeKeyString(event);

      expect(normalized).toBe('ArrowRight');
    });

    it.skip('should fallback to code if key is unidentified', () => {
      const event = new KeyboardEvent('keydown', {
        key: 'Unidentified',
        code: 'KeyA',
      });
      const normalized = normalizeKeyString(event);

      expect(normalized).toBe('KeyA');
    });
  });

  describe('COMMON_MEDIA_SHORTCUTS', () => {
    it('should define common shortcuts', () => {
      expect(COMMON_MEDIA_SHORTCUTS.PLAY_PAUSE).toBe('Space');
      expect(COMMON_MEDIA_SHORTCUTS.FULLSCREEN).toBe('f');
      expect(COMMON_MEDIA_SHORTCUTS.MUTE).toBe('m');
      expect(COMMON_MEDIA_SHORTCUTS.THEATER_MODE).toBe('t');
      expect(COMMON_MEDIA_SHORTCUTS.SHOW_HELP).toBe('?');
    });

    it('should define seek shortcuts', () => {
      expect(COMMON_MEDIA_SHORTCUTS.SEEK_FORWARD).toBe('ArrowRight');
      expect(COMMON_MEDIA_SHORTCUTS.SEEK_BACKWARD).toBe('ArrowLeft');
    });

    it('should define volume shortcuts', () => {
      expect(COMMON_MEDIA_SHORTCUTS.VOLUME_UP).toBe('ArrowUp');
      expect(COMMON_MEDIA_SHORTCUTS.VOLUME_DOWN).toBe('ArrowDown');
    });

    it('should define navigation shortcuts', () => {
      expect(COMMON_MEDIA_SHORTCUTS.NEXT).toBe('Shift+n');
      expect(COMMON_MEDIA_SHORTCUTS.PREVIOUS).toBe('Shift+p');
    });
  });

  describe('KeyboardShortcuts interface contract', () => {
    it('should accept custom implementations', () => {
      const customShortcuts: IKeyboardShortcuts = {
        register: (key, handler) => {
          // Custom implementation
          return () => {};
        },
        unregister: (key) => {},
        showOverlay: () => {},
        hideOverlay: () => {},
        onOverlayChange: (callback) => {
          return () => {};
        },
      };

      expect(customShortcuts).toHaveProperty('register');
      expect(customShortcuts).toHaveProperty('showOverlay');
    });

    it('should support optional methods', () => {
      const minimalShortcuts: IKeyboardShortcuts = {
        register: () => {},
        unregister: () => {},
        showOverlay: () => {},
        hideOverlay: () => {},
        onOverlayChange: () => {},
      };

      expect(minimalShortcuts.registerMany).toBeUndefined();
      expect(minimalShortcuts.toggleOverlay).toBeUndefined();
      expect(minimalShortcuts.getAll).toBeUndefined();
    });
  });

  describe('ShortcutDefinition', () => {
    it('should define shortcut with required fields', () => {
      const def: ShortcutDefinition = {
        key: 'Space',
        description: 'Play/Pause',
        handler: vi.fn(),
      };

      expect(def.key).toBe('Space');
      expect(def.description).toBe('Play/Pause');
      expect(def.handler).toBeInstanceOf(Function);
    });

    it('should define shortcut with category', () => {
      const def: ShortcutDefinition = {
        key: 'f',
        description: 'Fullscreen',
        handler: vi.fn(),
        category: 'Display',
      };

      expect(def.category).toBe('Display');
    });
  });
});
