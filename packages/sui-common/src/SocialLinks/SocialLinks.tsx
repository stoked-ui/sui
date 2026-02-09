import * as React from 'react';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import type { SocialPlatformKey, SocialLinkValues } from './types';

/**
 * Props for the SocialLinks component.
 *
 * @example
 * ```tsx
 * <SocialLinks
 *   platforms={['instagram', 'x', 'youtube']}
 *   value={{ instagram: 'myuser' }}
 *   onChange={(values) => console.log(values)}
 * />
 * ```
 */
export interface SocialLinksProps {
  /** Array of platform keys to display. Defaults to all platforms. */
  platforms?: SocialPlatformKey[];
  /** Controlled value: map of platform key to input string. */
  value?: SocialLinkValues;
  /** Uncontrolled default value. */
  defaultValue?: SocialLinkValues;
  /** Callback fired when any platform input changes. */
  onChange?: (values: SocialLinkValues) => void;
  /** If true, all inputs are disabled. */
  disabled?: boolean;
  /** If true, all inputs are read-only. */
  readOnly?: boolean;
  /** MUI sx prop for root container styling overrides. */
  sx?: SxProps<Theme>;
}

/**
 * SocialLinks component - displays social media platform input fields.
 * This is a Phase 1 shell that renders a placeholder container.
 */
function SocialLinks(props: SocialLinksProps) {
  const { sx } = props;
  return (
    <Box data-testid="social-links-root" sx={sx} />
  );
}

export default SocialLinks;
