import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
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
    <Box
      data-testid={`social-link-field-${platform.key}`}
      sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
    >
      <Icon fontSize="small" />
      <Typography variant="body2" sx={{ width: 120, flexShrink: 0 }}>
        {platform.label}
      </Typography>
      <TextField
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
    </Box>
  );
}

export default SocialLinkField;
