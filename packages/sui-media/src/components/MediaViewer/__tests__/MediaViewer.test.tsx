/**
 * MediaViewer Component Tests
 *
 * Basic tests for MediaViewer component and its sub-components.
 */

import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MediaViewer } from '../index';
import type { MediaItem } from '../MediaViewer.types';
import { createMockAuth } from '../../../abstractions/Auth';
import { createInMemoryQueue } from '../../../abstractions/Queue';
import { createInMemoryKeyboardShortcuts } from '../../../abstractions/KeyboardShortcuts';

describe('MediaViewer', () => {
  const mockItem: MediaItem = {
    id: 'test-1',
    title: 'Test Video',
    description: 'Test Description',
    url: 'https://example.com/video.mp4',
    mediaType: 'video',
    width: 1920,
    height: 1080,
  };

  const mockAuth = createMockAuth({
    user: { id: 'user-1', username: 'testuser' },
  });

  const mockQueue = createInMemoryQueue();
  const mockKeyboard = createInMemoryKeyboardShortcuts();

  it('should render when open', () => {
    const { container } = render(
      <MediaViewer
        item={mockItem}
        open={true}
        onClose={vi.fn()}
        auth={mockAuth}
        queue={mockQueue}
        keyboard={mockKeyboard}
      />
    );

    expect(container).toBeTruthy();
  });

  it('should not render when closed', () => {
    const { container } = render(
      <MediaViewer
        item={mockItem}
        open={false}
        onClose={vi.fn()}
        auth={mockAuth}
        queue={mockQueue}
        keyboard={mockKeyboard}
      />
    );

    // Dialog should not render content when closed
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).toBeFalsy();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <MediaViewer
        item={mockItem}
        open={true}
        onClose={onClose}
        auth={mockAuth}
        queue={mockQueue}
        keyboard={mockKeyboard}
      />
    );

    const closeButton = screen.getByLabelText('Close');
    closeButton.click();

    expect(onClose).toHaveBeenCalled();
  });

  it('should render media item title', () => {
    render(
      <MediaViewer
        item={mockItem}
        open={true}
        onClose={vi.fn()}
        auth={mockAuth}
        queue={mockQueue}
        keyboard={mockKeyboard}
      />
    );

    expect(screen.getByText('Test Video')).toBeTruthy();
  });

  it('should handle navigation when multiple items provided', () => {
    const onNavigate = vi.fn();
    const items = [
      mockItem,
      { ...mockItem, id: 'test-2', title: 'Test Video 2' },
      { ...mockItem, id: 'test-3', title: 'Test Video 3' },
    ];

    render(
      <MediaViewer
        item={mockItem}
        mediaItems={items}
        currentIndex={0}
        open={true}
        onClose={vi.fn()}
        onNavigate={onNavigate}
        auth={mockAuth}
        queue={mockQueue}
        keyboard={mockKeyboard}
      />
    );

    const nextButton = screen.getByLabelText('Next');
    expect(nextButton).toBeTruthy();
  });
});
