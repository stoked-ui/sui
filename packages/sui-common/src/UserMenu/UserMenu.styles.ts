import { styled, alpha } from '@mui/material/styles';
import ButtonBase from '@mui/material/ButtonBase';
import type { ButtonBaseProps } from '@mui/material/ButtonBase';
import type { FC } from 'react';

export const UserMenuButton: FC<ButtonBaseProps> = styled(ButtonBase)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5, 1),
  transition: theme.transitions.create('background-color', {
    duration: theme.transitions.duration.shortest,
  }),
  '&:hover': {
    backgroundColor: alpha(theme.palette.action.hover, 0.08),
  },
})) as FC<ButtonBaseProps>;
