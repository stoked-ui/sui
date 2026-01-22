/**
 * NextUpHeader - Header component for Next Up section
 *
 * Displays "Next Up" title with queue count badge showing
 * how many items are in the user's queue.
 *
 * Framework-agnostic component using only MUI dependencies.
 */

import * as React from 'react';
import { Box, Typography, Chip, Tooltip } from '@mui/material';
import { styled } from '@mui/system';
import QueueIcon from '@mui/icons-material/QueueMusic';

// ============================================================================
// Types
// ============================================================================

export interface NextUpHeaderProps {
  /** Number of items in user's queue */
  queueCount: number;
  /** Total number of items displayed in Next Up */
  totalCount?: number;
  /** Whether to show the header (for conditional rendering) */
  show?: boolean;
  /** Callback when queue badge is clicked */
  onQueueClick?: () => void;
}

// ============================================================================
// Styled Components
// ============================================================================

const HeaderContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '4px 8px',
  marginBottom: '6px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
});

const TitleSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const Title = styled(Typography)({
  fontSize: '13px',
  fontWeight: 600,
  color: 'rgba(255, 255, 255, 0.9)',
  letterSpacing: '0.3px',
});

const QueueBadge = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'hasQueue' && prop !== 'clickable',
})<{ hasQueue?: boolean; clickable?: boolean }>(({ hasQueue, clickable }) => ({
  height: '22px',
  fontSize: '11px',
  fontWeight: 600,
  backgroundColor: hasQueue ? 'rgba(33, 150, 243, 0.85)' : 'rgba(255, 255, 255, 0.15)',
  color: '#fff',
  cursor: clickable ? 'pointer' : 'default',
  '& .MuiChip-icon': {
    fontSize: '14px',
    color: '#fff',
    marginLeft: '6px',
  },
  '& .MuiChip-label': {
    padding: '0 8px 0 4px',
  },
  transition: 'background-color 0.2s ease',
  '&:hover': clickable
    ? {
        backgroundColor: hasQueue ? 'rgba(33, 150, 243, 1)' : 'rgba(255, 255, 255, 0.25)',
      }
    : {},
}));

// ============================================================================
// Component
// ============================================================================

export function NextUpHeader({
  queueCount,
  totalCount,
  show = true,
  onQueueClick,
}: NextUpHeaderProps) {
  if (!show) return null;

  const hasQueue = queueCount > 0;
  const isClickable = !!onQueueClick;
  const tooltipText = hasQueue
    ? `${queueCount} item${queueCount !== 1 ? 's' : ''} in your queue${isClickable ? ' - Click to manage' : ''}`
    : 'No items queued - add items with the + button';

  return (
    <HeaderContainer className="next-up-header" data-testid="next-up-header">
      <TitleSection>
        <Title variant="subtitle2">Next Up</Title>
      </TitleSection>

      <Tooltip title={tooltipText} placement="left" arrow>
        <QueueBadge
          icon={<QueueIcon />}
          label={`Queue: ${queueCount}`}
          size="small"
          hasQueue={hasQueue}
          clickable={isClickable}
          onClick={onQueueClick}
          data-testid="queue-count-badge"
        />
      </Tooltip>
    </HeaderContainer>
  );
}

export default NextUpHeader;
