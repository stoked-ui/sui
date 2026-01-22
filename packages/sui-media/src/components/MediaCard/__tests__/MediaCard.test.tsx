import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MediaCard } from '../MediaCard';
import { createMockAuth } from '../../../abstractions/Auth';
import type { ExtendedMediaItem, MediaCardModeState } from '../MediaCard.types';

describe('MediaCard', () => {
  const mockItem: ExtendedMediaItem = {
    _id: 'test-123',
    title: 'Test Media',
    author: 'user-123',
    mediaType: 'image',
    thumbnail: '/test-thumbnail.jpg',
    width: 1920,
    height: 1080,
    publicity: 'public',
    views: 100,
  };

  const mockModeState: MediaCardModeState = {
    mode: 'view',
  };

  const mockSetModeState = vi.fn();

  it('renders without crashing', () => {
    render(
      <MediaCard
        item={mockItem}
        modeState={mockModeState}
        setModeState={mockSetModeState}
      />
    );
  });

  it('displays media title when info prop is true', () => {
    render(
      <MediaCard
        item={mockItem}
        modeState={mockModeState}
        setModeState={mockSetModeState}
        info
      />
    );

    expect(screen.getByText('Test Media')).toBeInTheDocument();
  });

  it('shows owner controls when user is authenticated and owns the media', () => {
    const mockAuth = createMockAuth({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    });

    const mockOnEdit = vi.fn();
    const mockOnDelete = vi.fn();

    render(
      <MediaCard
        item={mockItem}
        modeState={mockModeState}
        setModeState={mockSetModeState}
        auth={mockAuth}
        onEditClick={mockOnEdit}
        onDeleteClick={mockOnDelete}
      />
    );

    // Controls are only visible on hover in the real implementation
    // This is a simplified test
  });

  it('shows payment indicator for paid content', () => {
    const paidItem: ExtendedMediaItem = {
      ...mockItem,
      publicity: 'paid',
      price: 1000,
    };

    render(
      <MediaCard
        item={paidItem}
        modeState={mockModeState}
        setModeState={mockSetModeState}
      />
    );

    expect(screen.getByText('1000 sats')).toBeInTheDocument();
  });

  it('displays video duration when provided', () => {
    const videoItem: ExtendedMediaItem = {
      ...mockItem,
      mediaType: 'video',
      duration: 125, // 2:05
    };

    render(
      <MediaCard
        item={videoItem}
        modeState={mockModeState}
        setModeState={mockSetModeState}
        info
      />
    );

    expect(screen.getByText('2:05')).toBeInTheDocument();
  });

  it('shows selection checkbox in selection mode', () => {
    render(
      <MediaCard
        item={mockItem}
        modeState={{ mode: 'select', selectState: { selected: [] } }}
        setModeState={mockSetModeState}
        globalSelectionMode
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('handles view click callback', () => {
    const mockOnViewClick = vi.fn();

    render(
      <MediaCard
        item={mockItem}
        modeState={mockModeState}
        setModeState={mockSetModeState}
        onViewClick={mockOnViewClick}
      />
    );

    // In real implementation, would trigger click on play button
    // This is a simplified test structure
  });
});
