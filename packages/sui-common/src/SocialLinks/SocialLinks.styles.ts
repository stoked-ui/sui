import { styled, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

/**
 * Root container for the SocialLinks component.
 * Dark background with rounded corners and vertical flex layout.
 */
export const SocialLinksRoot = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

/**
 * Row container for a single social link field.
 * Horizontal flex with consistent spacing and hover highlight.
 */
export const SocialLinkFieldRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(1, 1.5),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.action.hover, 0.04),
  },
}));

/**
 * Wrapper for platform icon with fixed width for alignment.
 */
export const PlatformIcon = styled(Box)(({ theme }) => ({
  width: 40,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
}));

/**
 * Platform label with fixed width for vertical alignment of inputs.
 * Hidden at xs breakpoint for responsive design.
 */
export const PlatformLabel = styled(Typography)(({ theme }) => ({
  width: 120,
  flexShrink: 0,
  color: theme.palette.text.primary,
  fontWeight: 500,
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

/**
 * Styled text field for platform input.
 * Flex-grow to fill remaining space.
 */
export const PlatformInput = styled(TextField)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  '& .MuiInputBase-root': {
    color: theme.palette.text.primary,
    backgroundColor: alpha(theme.palette.background.default, 0.5),
  },
  '& .MuiInputAdornment-root': {
    color: theme.palette.text.secondary,
  },
}));
