import * as React from 'react';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import SocialLinkField from './SocialLinkField';
import { PLATFORM_REGISTRY } from './platformRegistry';
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
 * Supports both controlled (value + onChange) and uncontrolled (defaultValue) patterns.
 */
function SocialLinks(props: SocialLinksProps) {
  const { platforms, value, defaultValue, onChange, disabled, readOnly, sx } = props;

  // Track whether component is controlled (determined on first render)
  const isControlled = React.useRef(value !== undefined).current;

  // Internal state for uncontrolled mode
  const [internalValues, setInternalValues] = React.useState<SocialLinkValues>(
    defaultValue ?? {}
  );

  // Source of truth depends on mode
  const currentValues = isControlled ? (value ?? {}) : internalValues;

  // Determine active platforms
  const activePlatforms = React.useMemo(() => {
    if (platforms && platforms.length > 0) {
      return platforms
        .map((key) => PLATFORM_REGISTRY.find((p) => p.key === key))
        .filter((p): p is typeof PLATFORM_REGISTRY[number] => p !== undefined);
    }
    return PLATFORM_REGISTRY;
  }, [platforms]);

  const handleFieldChange = React.useCallback(
    (key: SocialPlatformKey, fieldValue: string) => {
      const next = { ...currentValues, [key]: fieldValue };
      // Remove key if value is empty string (keep object clean)
      if (fieldValue === '') {
        delete next[key];
      }
      if (!isControlled) {
        setInternalValues(next);
      }
      onChange?.(next);
    },
    [currentValues, isControlled, onChange]
  );

  return (
    <Box data-testid="social-links-root" sx={sx}>
      {activePlatforms.map((platform) => (
        <SocialLinkField
          key={platform.key}
          platform={platform}
          value={currentValues[platform.key] ?? ''}
          onChange={handleFieldChange}
          disabled={disabled}
          readOnly={readOnly}
        />
      ))}
    </Box>
  );
}

export default SocialLinks;
