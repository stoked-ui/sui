import * as React from 'react';
import { styled, useTheme, Theme } from '@mui/material/styles';
import Drawer, { DrawerProps } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import CloseIcon from '@mui/icons-material/Close';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useColorSchemeShim, useChangeTheme } from '../components/ThemeContext';
import { useTranslate } from '@mui/docs/i18n';

interface AppSettingsDrawerProps extends DrawerProps {
  onClose: () => void;
  open?: boolean;
}

const Heading = styled(Typography)(({ theme }: { theme: Theme }) => ({
  margin: '16px 0 8px',
  fontWeight: theme.typography.fontWeightBold,
  fontSize: theme.typography.pxToRem(11),
  textTransform: 'uppercase',
  letterSpacing: '.1rem',
  color: theme.palette.text.tertiary,
}));

const IconToggleButton = styled(ToggleButton)({
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
  '& > *': {
    marginRight: '8px',
  },
});

function AppSettingsDrawer({ onClose, open = false, ...other }: AppSettingsDrawerProps) {
  const t = useTranslate();
  const upperTheme = useTheme();
  const changeTheme = useChangeTheme();
  const { mode, setMode } = useColorSchemeShim();

  const handleChangeThemeMode = (event: React.MouseEvent<HTMLElement>, paletteMode: any) => {
    if (paletteMode === null) {
      return;
    }

    setMode(paletteMode);
  };

  const handleChangeDirection = (event: React.MouseEvent<HTMLElement>, direction: any) => {
    if (direction === null) {
      direction = upperTheme.direction;
    }

    changeTheme({ direction });
  };

  return (
    <Drawer {...other} anchor="right" onClose={onClose} open={open} PaperProps={{
      elevation: 0,
      sx: {
        width: { xs: 310, sm: 360 },
        borderRadius: '10px 0px 0px 10px',
        border: '1px solid',
        borderColor: 'divider',
      },
    }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        px: 2,
        py: 1,
      }}>
        <Typography variant="body1" fontWeight="medium">{t('settings.settings')}</Typography>
        <IconButton color="inherit" onClick={onClose} edge="end" aria-label={t('close')}>
          <CloseIcon color="primary" fontSize="small" />
        </IconButton>
      </Box>
      <Divider />
      <Box sx={{ pl: 2, pr: 2 }}>
        <Heading gutterBottom id="settings-mode">{t('settings.mode')}</Heading>
        <ToggleButtonGroup aria-labelledby="settings-mode" color="primary" exclusive={true} fullWidth={true} onChange={handleChangeThemeMode} value={mode}>
          <IconToggleButton
            value="light"
            aria-label={t('settings.light')}
            data-ga-event-category="settings"
            data-ga-event-action="light"
          >
            <LightModeIcon fontSize="small" />
            {t('settings.light')}
          </IconToggleButton>
          // Rest of your code...
        </ToggleButtonGroup>
      </Box>
    </Drawer>
  );
}
export default AppSettingsDrawer;
