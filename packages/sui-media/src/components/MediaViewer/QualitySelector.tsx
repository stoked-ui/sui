/**
 * QualitySelector Component
 *
 * Gear icon + dropdown menu for manual video quality selection.
 * Only renders when adaptive bitrate is active (2+ tracks).
 */

import SettingsIcon from '@mui/icons-material/Settings';
import CheckIcon from '@mui/icons-material/Check';
import { Box, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { styled } from '@mui/system';
import * as React from 'react';
import type { QualityState } from './MediaViewer.types';

// ============================================================================
// Styled Components
// ============================================================================

const GearButton = styled(IconButton)({
  position: 'absolute',
  bottom: 56,
  right: 12,
  color: 'white',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 10,
  transition: 'opacity 0.3s ease-in-out',
  '&.controls-hidden': {
    opacity: 0,
    pointerEvents: 'none',
  },
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
});

// ============================================================================
// Props
// ============================================================================

export interface QualitySelectorProps {
  qualityState: QualityState;
  onSelectTrack: (index: number) => void;
  onEnableAutoMode: () => void;
  showControls: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function QualitySelector({
  qualityState,
  onSelectTrack,
  onEnableAutoMode,
  showControls,
}: QualitySelectorProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAutoClick = () => {
    onEnableAutoMode();
    handleClose();
  };

  const handleTrackClick = (index: number) => {
    onSelectTrack(index);
    handleClose();
  };

  const { mode, activeTrackIndex, availableTracks, activeTrack } = qualityState;

  // Auto label shows current auto-selected resolution
  const autoLabel = mode === 'auto'
    ? `Auto (${activeTrack.label})`
    : 'Auto';

  return (
    <Box>
      <GearButton
        className={!showControls ? 'controls-hidden' : ''}
        onClick={handleOpen}
        aria-label="Quality settings"
        size="small"
      >
        <SettingsIcon fontSize="small" />
      </GearButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: 'rgba(28, 28, 28, 0.95)',
              color: '#fff',
              minWidth: 160,
            },
          },
        }}
      >
        <MenuItem onClick={handleAutoClick} selected={mode === 'auto'}>
          <ListItemIcon sx={{ minWidth: 28 }}>
            {mode === 'auto' ? <CheckIcon fontSize="small" sx={{ color: '#fff' }} /> : null}
          </ListItemIcon>
          <ListItemText>{autoLabel}</ListItemText>
        </MenuItem>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />

        {availableTracks.map((track, idx) => (
          <MenuItem
            key={track.label}
            onClick={() => handleTrackClick(idx)}
            selected={mode === 'manual' && activeTrackIndex === idx}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              {mode === 'manual' && activeTrackIndex === idx ? (
                <CheckIcon fontSize="small" sx={{ color: '#fff' }} />
              ) : null}
            </ListItemIcon>
            <ListItemText>{track.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

export default QualitySelector;
