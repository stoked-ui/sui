/**
 * Queue abstraction for sui-media components
 *
 * This abstraction provides a framework-agnostic interface for managing media playback
 * queues, allowing components to work with any state management solution (Redux, Zustand,
 * Context API, etc.) or storage backend.
 *
 * @example
 * ```typescript
 * // Implementation with Zustand
 * import create from 'zustand';
 *
 * const useQueueStore = create<IQueue>((set, get) => ({
 *   items: [],
 *   currentIndex: 0,
 *
 *   addItem: (item) => set((state) => ({
 *     items: [...state.items, item]
 *   })),
 *
 *   removeItem: (id) => set((state) => ({
 *     items: state.items.filter(item => item.id !== id)
 *   })),
 *
 *   clearQueue: () => set({ items: [], currentIndex: 0 }),
 *
 *   setCurrentIndex: (index) => set({ currentIndex: index }),
 *
 *   getCurrentItem: () => {
 *     const state = get();
 *     return state.items[state.currentIndex] ?? null;
 *   },
 *
 *   getNextItem: () => {
 *     const state = get();
 *     return state.items[state.currentIndex + 1] ?? null;
 *   },
 *
 *   getPreviousItem: () => {
 *     const state = get();
 *     return state.items[state.currentIndex - 1] ?? null;
 *   },
 * }));
 *
 * // Pass to media components
 * <MediaViewer queue={useQueueStore()} />
 * ```
 */

/**
 * Queue item interface representing a media item in the queue
 */
export interface IQueueItem {
  /**
   * Unique identifier for the queue item
   */
  id: string;

  /**
   * Type of media (video, audio, image, etc.)
   */
  type?: string;

  /**
   * Media title
   */
  title?: string;

  /**
   * Media source URL
   */
  src?: string;

  /**
   * Thumbnail URL
   */
  thumbnail?: string;

  /**
   * Duration in seconds (for audio/video)
   */
  duration?: number;

  /**
   * Additional metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Queue interface for managing media playback queues
 */
export interface IQueue {
  /**
   * All items in the queue
   */
  items: IQueueItem[];

  /**
   * Index of the currently playing item
   */
  currentIndex: number;

  /**
   * Add an item to the queue
   * @param item - The item to add
   * @param position - Optional position to insert at (default: end of queue)
   */
  addItem: (item: IQueueItem, position?: number) => void;

  /**
   * Add multiple items to the queue
   * @param items - The items to add
   * @param position - Optional position to insert at (default: end of queue)
   */
  addItems?: (items: IQueueItem[], position?: number) => void;

  /**
   * Remove an item from the queue
   * @param id - The ID of the item to remove
   */
  removeItem: (id: string) => void;

  /**
   * Clear all items from the queue
   */
  clearQueue: () => void;

  /**
   * Set the current playback position in the queue
   * @param index - The index to set as current
   */
  setCurrentIndex: (index: number) => void;

  /**
   * Get the currently playing item
   * @returns The current queue item or null if queue is empty
   */
  getCurrentItem: () => IQueueItem | null;

  /**
   * Get the next item in the queue
   * @returns The next queue item or null if at end of queue
   */
  getNextItem: () => IQueueItem | null;

  /**
   * Get the previous item in the queue
   * @returns The previous queue item or null if at start of queue
   */
  getPreviousItem: () => IQueueItem | null;

  /**
   * Move to the next item in the queue
   * @returns True if moved to next item, false if at end of queue
   */
  next?: () => boolean;

  /**
   * Move to the previous item in the queue
   * @returns True if moved to previous item, false if at start of queue
   */
  previous?: () => boolean;

  /**
   * Shuffle the queue
   * @param preserveCurrent - Whether to keep the current item at index 0
   */
  shuffle?: (preserveCurrent?: boolean) => void;

  /**
   * Reorder items in the queue
   * @param fromIndex - The index to move from
   * @param toIndex - The index to move to
   */
  reorder?: (fromIndex: number, toIndex: number) => void;
}

/**
 * No-op queue implementation with empty queue
 *
 * Use this as a default queue provider for applications that don't need queue functionality,
 * or as a placeholder during development/testing.
 *
 * @example
 * ```typescript
 * import { NoOpQueue } from '@stoked-ui/sui-media';
 *
 * // Use as default when queue is optional
 * function MediaViewer({ queue = NoOpQueue }) {
 *   // Component will work but queue operations won't do anything
 * }
 * ```
 */
export class NoOpQueue implements IQueue {
  items: IQueueItem[] = [];
  currentIndex: number = 0;

  addItem(item: IQueueItem, position?: number): void {
    // No-op: does nothing
  }

  addItems(items: IQueueItem[], position?: number): void {
    // No-op: does nothing
  }

  removeItem(id: string): void {
    // No-op: does nothing
  }

  clearQueue(): void {
    // No-op: does nothing
  }

  setCurrentIndex(index: number): void {
    // No-op: does nothing
  }

  getCurrentItem(): IQueueItem | null {
    return null;
  }

  getNextItem(): IQueueItem | null {
    return null;
  }

  getPreviousItem(): IQueueItem | null {
    return null;
  }

  next(): boolean {
    return false;
  }

  previous(): boolean {
    return false;
  }

  shuffle(preserveCurrent?: boolean): void {
    // No-op: does nothing
  }

  reorder(fromIndex: number, toIndex: number): void {
    // No-op: does nothing
  }
}

/**
 * Singleton instance of NoOpQueue for convenience
 */
export const noOpQueue = new NoOpQueue();

/**
 * In-memory queue implementation for testing and simple use cases
 *
 * @example
 * ```typescript
 * import { createInMemoryQueue } from '@stoked-ui/sui-media';
 *
 * const queue = createInMemoryQueue([
 *   { id: '1', title: 'Video 1', src: '/video1.mp4' },
 *   { id: '2', title: 'Video 2', src: '/video2.mp4' },
 * ]);
 *
 * // Use in components or tests
 * <MediaViewer queue={queue} />
 * ```
 */
export function createInMemoryQueue(initialItems: IQueueItem[] = []): IQueue {
  let items = [...initialItems];
  let currentIndex = 0;

  return {
    get items() { return items; },
    get currentIndex() { return currentIndex; },

    addItem(item, position) {
      if (position !== undefined && position >= 0 && position <= items.length) {
        items.splice(position, 0, item);
      } else {
        items.push(item);
      }
    },

    addItems(newItems, position) {
      if (position !== undefined && position >= 0 && position <= items.length) {
        items.splice(position, 0, ...newItems);
      } else {
        items.push(...newItems);
      }
    },

    removeItem(id) {
      const index = items.findIndex(item => item.id === id);
      if (index !== -1) {
        items.splice(index, 1);
        if (currentIndex >= items.length && items.length > 0) {
          currentIndex = items.length - 1;
        }
      }
    },

    clearQueue() {
      items = [];
      currentIndex = 0;
    },

    setCurrentIndex(index) {
      if (index >= 0 && index < items.length) {
        currentIndex = index;
      }
    },

    getCurrentItem() {
      return items[currentIndex] ?? null;
    },

    getNextItem() {
      return items[currentIndex + 1] ?? null;
    },

    getPreviousItem() {
      return items[currentIndex - 1] ?? null;
    },

    next() {
      if (currentIndex < items.length - 1) {
        currentIndex++;
        return true;
      }
      return false;
    },

    previous() {
      if (currentIndex > 0) {
        currentIndex--;
        return true;
      }
      return false;
    },

    shuffle(preserveCurrent = true) {
      const current = preserveCurrent ? items[currentIndex] : null;

      // Fisher-Yates shuffle
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }

      if (current) {
        currentIndex = items.findIndex(item => item.id === current.id);
      }
    },

    reorder(fromIndex, toIndex) {
      if (fromIndex >= 0 && fromIndex < items.length && toIndex >= 0 && toIndex < items.length) {
        const [item] = items.splice(fromIndex, 1);
        items.splice(toIndex, 0, item);

        // Update current index if needed
        if (currentIndex === fromIndex) {
          currentIndex = toIndex;
        } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
          currentIndex--;
        } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
          currentIndex++;
        }
      }
    },
  };
}
