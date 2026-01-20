/**
 * NowPlayingIndicator - Shows when current media was consumed from queue
 *
 * Displays a subtle indicator when the user is viewing media that was
 * auto-advanced from their queue, showing queue status.
 *
 * Framework-agnostic component using only MUI dependencies.
 */

import * as React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { styled, keyframes } from '@mui/system';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';

// ============================================================================
// Types
// ============================================================================

export interface NowPlayingIndicatorProps {
  /** Whether the current item was played from the queue */
  isFromQueue: boolean;
  /** Title of the current media */
  title?: string;
  /** Number of items remaining in the queue */
  queueRemaining: number;
  /** Optional className for styling */
  className?: string;
}

// ============================================================================
// Animations
// ============================================================================

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
`;

// ============================================================================
// Styled Components
// ============================================================================

const IndicatorContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 12px',
  borderRadius: '8px',
  backgroundColor: 'rgba(33, 150, 243, 0.15)',
  border: '1px solid rgba(33, 150, 243, 0.3)',
  animation: `${fadeIn} 0.3s ease-out`,
});

const QueueIcon = styled(QueueMusicIcon)({
  fontSize: '18px',
  color: 'rgba(33, 150, 243, 0.9)',
  animation: `${pulse} 2s ease-in-out infinite`,
});

const TextContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  flex: 1,
});

const NowPlayingLabel = styled(Typography)({
  fontSize: '10px',
  fontWeight: 600,
  color: 'rgba(33, 150, 243, 0.9)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
});

const TitleText = styled(Typography)({
  fontSize: '12px',
  fontWeight: 500,
  color: 'rgba(255, 255, 255, 0.9)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '200px',
});

const QueueStatus = styled(Chip)({
  height: '20px',
  fontSize: '10px',
  fontWeight: 600,
  backgroundColor: 'rgba(33, 150, 243, 0.2)',
  color: 'rgba(33, 150, 243, 1)',
  border: '1px solid rgba(33, 150, 243, 0.4)',
  '& .MuiChip-label': {
    padding: '0 8px',
  },
});

// ============================================================================
// Component
// ============================================================================

export function NowPlayingIndicator({
  isFromQueue,
  title,
  queueRemaining,
  className,
}: NowPlayingIndicatorProps) {
  // Don't render if not from queue
  if (!isFromQueue) return null;

  const remainingText =
    queueRemaining === 0
      ? 'Queue empty'
      : queueRemaining === 1
        ? '1 more in queue'
        : `${queueRemaining} more in queue`;

  return (
    <IndicatorContainer className={className} data-testid="now-playing-indicator">
      <QueueIcon />
      <TextContainer>
        <NowPlayingLabel>From Queue</NowPlayingLabel>
        {title && <TitleText>{title}</TitleText>}
      </TextContainer>
      <QueueStatus label={remainingText} size="small" />
    </IndicatorContainer>
  );
}

export default NowPlayingIndicator;
