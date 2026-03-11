import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import KeyIcon from '@mui/icons-material/KeyOutlined';
import CreditCardIcon from '@mui/icons-material/CreditCardOutlined';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import type { UserMenuProps } from './UserMenu.types';
import { UserMenuButton } from './UserMenu.styles';

export default function UserMenu(props: UserMenuProps) {
  const { name, role, avatarUrl, onSettings, onLicenses, onBilling, onSignOut, sx } = props;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    handleClose();
    onSignOut();
  };

  const handleMenuAction = (handler?: () => void) => () => {
    handleClose();
    handler?.();
  };

  const menuId = 'user-menu';

  return (
    <React.Fragment>
      <UserMenuButton
        onClick={handleClick}
        aria-controls={open ? menuId : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        sx={sx}
      >
        <Avatar src={avatarUrl} alt={name} sx={{ width: 32, height: 32 }}>
          {name.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ display: { xs: 'none', sm: 'block' }, lineHeight: 1.2, textAlign: 'left' }}>
          <Typography
            variant="body2"
            color="text.primary"
            sx={{ whiteSpace: 'nowrap', fontWeight: 600, fontSize: '0.8125rem' }}
          >
            {name}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ whiteSpace: 'nowrap', fontSize: '0.6875rem', textTransform: 'capitalize' }}
          >
            {role}
          </Typography>
        </Box>
      </UserMenuButton>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {onSettings && (
          <MenuItem onClick={handleMenuAction(onSettings)}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </MenuItem>
        )}
        {onLicenses && (
          <MenuItem onClick={handleMenuAction(onLicenses)}>
            <ListItemIcon>
              <KeyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Licenses</ListItemText>
          </MenuItem>
        )}
        {onBilling && (
          <MenuItem onClick={handleMenuAction(onBilling)}>
            <ListItemIcon>
              <CreditCardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Billing</ListItemText>
          </MenuItem>
        )}
        {(onSettings || onLicenses || onBilling) && <Divider />}
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sign Out</ListItemText>
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}
