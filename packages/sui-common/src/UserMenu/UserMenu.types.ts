import type { SxProps, Theme } from '@mui/material/styles';

export interface UserMenuProps {
  /** Display name */
  name: string;
  /** Role label shown below name (e.g. 'admin', 'client') */
  role: string;
  /** Avatar image URL; falls back to first letter of name */
  avatarUrl?: string;
  /** Called when "Sign Out" is clicked */
  onSignOut: () => void;
  /** Style overrides for the root button */
  sx?: SxProps<Theme>;
}
