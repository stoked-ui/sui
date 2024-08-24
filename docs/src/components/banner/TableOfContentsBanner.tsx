import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { Link } from '@mui/docs/Link';
import FEATURE_TOGGLE from 'docs/src/featureToggle';

export default function TableOfContentsBanner() {
  return FEATURE_TOGGLE.enable_toc_banner ? (
    <Link
      href="https://en.wikipedia.org/wiki/Grumpy_Cat"
      target="_blank"
      sx={[
        (theme) => ({
          mb: 2,
          mx: 0.5,
          p: 1,
          pl: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: alpha(theme.palette.grey[50], 0.4),
          border: '1px solid',
          borderColor: theme.palette.divider,
          borderRadius: 1,
          transitionProperty: 'all',
          transitionTiming: 'cubic-bezier(0.4, 0, 0.2, 1)',
          transitionDuration: '150ms',
          '&:hover, &:focus-visible': {
            backgroundColor: theme.palette.primary[50],
            borderColor: theme.palette.primary[200],
          },
        }),
        (theme) =>
          theme.applyDarkStyles({
            backgroundColor: alpha(theme.palette.primary[900], 0.2),
            '&:hover, &:focus-visible': {
              backgroundColor: alpha(theme.palette.primary[900], 0.4),
              borderColor: theme.palette.primary[900],
            },
          }),
      ]}
    >
      <Box sx={{ borderRadius: '3px', overflow: 'auto', width: 'fit-content', flexShrink: 0 }}>
        <img
          src="/static/images/avatar/grumpy-cat.svg"
          alt=""
          width={40}
          height={40}
          style={{ verticalAlign: 'middle' }}
        />
      </Box>
      <Typography component="span" variant="caption" fontWeight="medium" color="text.secondary">
        Stoked UI stands with Grumpy Cat.
      </Typography>
    </Link>
  ) : null;
}
