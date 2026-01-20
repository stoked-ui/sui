import { describe, it, expect } from 'vitest';
import { NoOpQueue, noOpQueue, createInMemoryQueue } from '../Queue';
import type { IQueue, IQueueItem } from '../Queue';

describe('Queue Abstraction', () => {
  const mockItem1: IQueueItem = {
    id: 'item-1',
    type: 'video',
    title: 'Video 1',
    src: '/video1.mp4',
  };

  const mockItem2: IQueueItem = {
    id: 'item-2',
    type: 'audio',
    title: 'Audio 1',
    src: '/audio1.mp3',
  };

  const mockItem3: IQueueItem = {
    id: 'item-3',
    type: 'video',
    title: 'Video 2',
    src: '/video2.mp4',
  };

  describe('NoOpQueue', () => {
    it('should create a new instance', () => {
      const queue = new NoOpQueue();
      expect(queue).toBeInstanceOf(NoOpQueue);
    });

    it('should implement IQueue interface', () => {
      const queue: IQueue = new NoOpQueue();
      expect(queue).toHaveProperty('items');
      expect(queue).toHaveProperty('currentIndex');
      expect(queue).toHaveProperty('addItem');
      expect(queue).toHaveProperty('removeItem');
      expect(queue).toHaveProperty('clearQueue');
      expect(queue).toHaveProperty('setCurrentIndex');
      expect(queue).toHaveProperty('getCurrentItem');
      expect(queue).toHaveProperty('getNextItem');
      expect(queue).toHaveProperty('getPreviousItem');
    });

    it('should have empty items array', () => {
      const queue = new NoOpQueue();
      expect(queue.items).toEqual([]);
      expect(queue.items).toHaveLength(0);
    });

    it('should have zero current index', () => {
      const queue = new NoOpQueue();
      expect(queue.currentIndex).toBe(0);
    });

    it('should do nothing on addItem', () => {
      const queue = new NoOpQueue();
      queue.addItem(mockItem1);
      expect(queue.items).toHaveLength(0);
    });

    it('should do nothing on removeItem', () => {
      const queue = new NoOpQueue();
      queue.removeItem('item-1');
      expect(queue.items).toHaveLength(0);
    });

    it('should do nothing on clearQueue', () => {
      const queue = new NoOpQueue();
      queue.clearQueue();
      expect(queue.items).toHaveLength(0);
    });

    it('should do nothing on setCurrentIndex', () => {
      const queue = new NoOpQueue();
      queue.setCurrentIndex(5);
      expect(queue.currentIndex).toBe(0);
    });

    it('should return null for getCurrentItem', () => {
      const queue = new NoOpQueue();
      expect(queue.getCurrentItem()).toBeNull();
    });

    it('should return null for getNextItem', () => {
      const queue = new NoOpQueue();
      expect(queue.getNextItem()).toBeNull();
    });

    it('should return null for getPreviousItem', () => {
      const queue = new NoOpQueue();
      expect(queue.getPreviousItem()).toBeNull();
    });

    it('should return false for next', () => {
      const queue = new NoOpQueue();
      expect(queue.next?.()).toBe(false);
    });

    it('should return false for previous', () => {
      const queue = new NoOpQueue();
      expect(queue.previous?.()).toBe(false);
    });

    it('should do nothing on shuffle', () => {
      const queue = new NoOpQueue();
      queue.shuffle?.();
      expect(queue.items).toHaveLength(0);
    });

    it('should do nothing on reorder', () => {
      const queue = new NoOpQueue();
      queue.reorder?.(0, 1);
      expect(queue.items).toHaveLength(0);
    });
  });

  describe('noOpQueue singleton', () => {
    it('should provide a singleton instance', () => {
      expect(noOpQueue).toBeInstanceOf(NoOpQueue);
    });

    it('should be the same instance on multiple accesses', () => {
      const ref1 = noOpQueue;
      const ref2 = noOpQueue;
      expect(ref1).toBe(ref2);
    });
  });

  describe('createInMemoryQueue', () => {
    it('should create an empty queue by default', () => {
      const queue = createInMemoryQueue();
      expect(queue.items).toEqual([]);
      expect(queue.currentIndex).toBe(0);
    });

    it('should create a queue with initial items', () => {
      const queue = createInMemoryQueue([mockItem1, mockItem2]);
      expect(queue.items).toHaveLength(2);
      expect(queue.items[0]).toEqual(mockItem1);
      expect(queue.items[1]).toEqual(mockItem2);
    });

    it('should add items to the end by default', () => {
      const queue = createInMemoryQueue([mockItem1]);
      queue.addItem(mockItem2);

      expect(queue.items).toHaveLength(2);
      expect(queue.items[1]).toEqual(mockItem2);
    });

    it('should add items at specific position', () => {
      const queue = createInMemoryQueue([mockItem1, mockItem3]);
      queue.addItem(mockItem2, 1);

      expect(queue.items).toHaveLength(3);
      expect(queue.items[0]).toEqual(mockItem1);
      expect(queue.items[1]).toEqual(mockItem2);
      expect(queue.items[2]).toEqual(mockItem3);
    });

    it('should add multiple items', () => {
      const queue = createInMemoryQueue();
      queue.addItems?.([mockItem1, mockItem2]);

      expect(queue.items).toHaveLength(2);
    });

    it('should add multiple items at specific position', () => {
      const queue = createInMemoryQueue([mockItem1]);
      queue.addItems?.([mockItem2, mockItem3], 0);

      expect(queue.items).toHaveLength(3);
      expect(queue.items[0]).toEqual(mockItem2);
      expect(queue.items[1]).toEqual(mockItem3);
      expect(queue.items[2]).toEqual(mockItem1);
    });

    it('should remove items by id', () => {
      const queue = createInMemoryQueue([mockItem1, mockItem2, mockItem3]);
      queue.removeItem('item-2');

      expect(queue.items).toHaveLength(2);
      expect(queue.items.find(item => item.id === 'item-2')).toBeUndefined();
    });

    it('should adjust currentIndex when removing current item', () => {
      const queue = createInMemoryQueue([mockItem1, mockItem2, mockItem3]);
      queue.setCurrentIndex(2);
      queue.removeItem('item-3');

      expect(queue.currentIndex).toBe(1);
    });

    it('should clear all items', () => {
      const queue = createInMemoryQueue([mockItem1, mockItem2]);
      queue.clearQueue();

      expect(queue.items).toHaveLength(0);
      expect(queue.currentIndex).toBe(0);
    });

    it('should set current index', () => {
      const queue = createInMemoryQueue([mockItem1, mockItem2, mockItem3]);
      queue.setCurrentIndex(1);

      expect(queue.currentIndex).toBe(1);
    });

    it('should not set invalid index', () => {
      const queue = createInMemoryQueue([mockItem1, mockItem2]);
      queue.setCurrentIndex(5);

      expect(queue.currentIndex).toBe(0);
    });

    it('should get current item', () => {
      const queue = createInMemoryQueue([mockItem1, mockItem2]);
      queue.setCurrentIndex(1);

      const current = queue.getCurrentItem();
      expect(current).toEqual(mockItem2);
    });

    it('should get next item', () => {
      const queue = createInMemoryQueue([mockItem1, mockItem2, mockItem3]);
      queue.setCurrentIndex(0);

      const next = queue.getNextItem();
      expect(next).toEqual(mockItem2);
    });

    it('should return null for next item at end of queue', () => {
      const queue = createInMemoryQueue([mockItem1, mockItem2]);
      queue.setCurrentIndex(1);

      const next = queue.getNextItem();
      expect(next).toBeNull();
    });

    it('should get previous item', () => {
      const queue = createInMemoryQueue([mockItem1, mockItem2, mockItem3]);
      queue.setCurrentIndex(2);

      const previous = queue.getPreviousItem();
      expect(previous).toEqual(mockItem2);
    });

    it('should return null for previous item at start of queue', () => {
      const queue = createInMemoryQueue([mockItem1, mockItem2]);
      queue.setCurrentIndex(0);

      const previous = queue.getPreviousItem();
      expect(previous).toBeNull();
    });

    it('should move to next item', () => {
      const queue = createInMemoryQueue([mockItem1, mockItem2, mockItem3]);

      const moved = queue.next?.();
      expect(moved).toBe(true);
      expect(queue.currentIndex).toBe(1);
    });

    it('should return false when trying to move beyond end', () => {
      const queue = createInMemoryQueue([mockItem1, mockItem2]);
      queue.setCurrentIndex(1);

      const moved = queue.next?.();
      expect(moved).toBe(false);
      expect(queue.currentIndex).toBe(1);
    });

    it('should move to previous item', () => {
      const queue = createInMemoryQueue([mockItem1, mockItem2, mockItem3]);
      queue.setCurrentIndex(2);

      const moved = queue.previous?.();
      expect(moved).toBe(true);
      expect(queue.currentIndex).toBe(1);
    });

    it('should return false when trying to move before start', () => {
      const queue = createInMemoryQueue([mockItem1, mockItem2]);

      const moved = queue.previous?.();
      expect(moved).toBe(false);
      expect(queue.currentIndex).toBe(0);
    });

    it('should shuffle items', () => {
      const items = Array.from({ length: 10 }, (_, i) => ({
        id: `item-${i}`,
        title: `Item ${i}`,
      }));
      const queue = createInMemoryQueue(items);

      queue.shuffle?.();

      // Items should still be the same, just in different order
      expect(queue.items).toHaveLength(10);
      expect(queue.items.every(item => items.some(i => i.id === item.id))).toBe(true);
    });

    it('should preserve current item when shuffling', () => {
      const queue = createInMemoryQueue([mockItem1, mockItem2, mockItem3]);
      queue.setCurrentIndex(1);

      queue.shuffle?.(true);

      const current = queue.getCurrentItem();
      expect(current?.id).toBe('item-2');
    });

    it('should reorder items', () => {
      const queue = createInMemoryQueue([mockItem1, mockItem2, mockItem3]);
      queue.reorder?.(0, 2);

      expect(queue.items[0]).toEqual(mockItem2);
      expect(queue.items[1]).toEqual(mockItem3);
      expect(queue.items[2]).toEqual(mockItem1);
    });

    it('should update currentIndex when reordering current item', () => {
      const queue = createInMemoryQueue([mockItem1, mockItem2, mockItem3]);
      queue.setCurrentIndex(0);
      queue.reorder?.(0, 2);

      expect(queue.currentIndex).toBe(2);
    });

    it('should handle reordering around current item', () => {
      const queue = createInMemoryQueue([mockItem1, mockItem2, mockItem3]);
      queue.setCurrentIndex(1);
      queue.reorder?.(0, 2);

      expect(queue.currentIndex).toBe(0);
    });
  });

  describe('Queue interface contract', () => {
    it('should accept custom queue implementations', () => {
      let items: IQueueItem[] = [mockItem1];
      let index = 0;

      const customQueue: IQueue = {
        get items() { return items; },
        get currentIndex() { return index; },
        addItem: (item) => { items.push(item); },
        removeItem: (id) => { items = items.filter(i => i.id !== id); },
        clearQueue: () => { items = []; index = 0; },
        setCurrentIndex: (i) => { index = i; },
        getCurrentItem: () => items[index] ?? null,
        getNextItem: () => items[index + 1] ?? null,
        getPreviousItem: () => items[index - 1] ?? null,
      };

      expect(customQueue.items).toHaveLength(1);
      customQueue.addItem(mockItem2);
      expect(customQueue.items).toHaveLength(2);
      customQueue.removeItem('item-1');
      expect(customQueue.items).toHaveLength(1);
    });
  });

  describe('IQueueItem interface', () => {
    it('should support minimal queue item', () => {
      const minimalItem: IQueueItem = {
        id: 'item-1',
      };

      expect(minimalItem.id).toBe('item-1');
    });

    it('should support full queue item', () => {
      const fullItem: IQueueItem = {
        id: 'item-1',
        type: 'video',
        title: 'Test Video',
        src: '/test.mp4',
        thumbnail: '/thumb.jpg',
        duration: 120,
        metadata: {
          resolution: '1080p',
          codec: 'h264',
        },
      };

      expect(fullItem.id).toBe('item-1');
      expect(fullItem.type).toBe('video');
      expect(fullItem.duration).toBe(120);
      expect(fullItem.metadata?.resolution).toBe('1080p');
    });
  });
});
