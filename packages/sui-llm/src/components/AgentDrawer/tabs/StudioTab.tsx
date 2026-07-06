import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
  Card,
} from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';

export interface StudioTabProps {
  className?: string;
}

const StudioTab: React.FC<StudioTabProps> = ({ className }) => {
  return (
    <Card
      className={className}
      data-testid="studio-tab"
      sx={{
        border: '2px dashed',
        borderColor: 'rgba(255,255,255,0.1)',
        bgcolor: '#0b0c10',
        backgroundColor: 'rgba(11, 12, 16, 0.4)',
        textAlign: 'center',
        p: 4,
        minHeight: 300,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          mb: 3,
          width: 60,
          height: 60,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(255, 255, 255, 0.05)',
        }}
      >
        <PaletteIcon sx={{ fontSize: 30, color: 'rgba(255, 255, 255, 0.6)' }} />
      </Box>
      <Typography variant="h3" gutterBottom sx={{ color: '#f1f5f9', mb: 2 }}>
        Agent Studio
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: 'rgba(255, 255, 255, 0.7)',
          maxWidth: 500,
          mb: 4,
          lineHeight: 1.6,
        }}
      >
        This space serves as an interface construction environment. Future iterations will support interactive dashboard layout tools, canvas workspaces, and dynamic HUD modifications.
      </Typography>
      <Stack direction="row" spacing={2}>
        <Chip
          label="Node Grid: Offline"
          sx={{
            bgcolor: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
            color: 'rgba(255, 255, 255, 0.8)',
          }}
        />
        <Chip
          label="Layout Canvas: Standby"
          sx={{
            bgcolor: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
            color: 'rgba(255, 255, 255, 0.8)',
          }}
        />
      </Stack>
    </Card>
  );
};

export default StudioTab;