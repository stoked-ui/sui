import * as React from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import { SocialLinkFieldRow, PlatformIcon, PlatformLabel, PlatformInput } from './SocialLinks.styles';
import type { SocialPlatform, SocialPlatformKey } from './types';

export interface SocialLinkFieldProps {
  platform: SocialPlatform;
  value: string;
  onChange: (key: SocialPlatformKey, value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

function SocialLinkField(props: SocialLinkFieldProps) {
  const { platform, value, onChange, disabled, readOnly } = props;
  const Icon = platform.icon;

  return (
    <SocialLinkFieldRow data-testid={`social-link-field-${platform.key}`}>
      <PlatformIcon>
        <Icon fontSize="small" />
      </PlatformIcon>
      <PlatformLabel variant="body2">
        {platform.label}
      </PlatformLabel>
      <PlatformInput
        variant="outlined"
        size="small"
        fullWidth
        placeholder={platform.placeholder}
        value={value}
        onChange={(e) => onChange(platform.key, e.target.value)}
        disabled={disabled}
        inputProps={{ readOnly }}
        InputProps={
          platform.prefix
            ? {
                startAdornment: (
                  <InputAdornment position="start">
                    {platform.prefix}
                  </InputAdornment>
                ),
              }
            : undefined
        }
      />
    </SocialLinkFieldRow>
  );
}

export default SocialLinkField;
