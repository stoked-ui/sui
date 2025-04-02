import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link } from '@stoked-ui/docs';
import { useTranslate } from 'docs/src/modules/utils/i18n';

const NativeLink = styled('a')(({ theme }) => ({
  boxSizing: 'border-box', // TODO have CssBaseline in the Next.js layout
  width: '100%',
  height: 45,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 12,
  border: '1px solid',
  borderColor: theme.palette.divider,
  transition: theme.transitions.create(['color', 'border-color']),
  boxShadow: `${alpha(theme.palette.grey[100], 0.3)} 0 -2px 0 inset`,
  '&:hover': {
    backgroundColor: theme.palette.grey[50],
  },
  '&:focus-visible': {
    outline: `3px solid ${alpha(theme.palette.primary[500], 0.5)}`,
    outlineOffset: '2px',
  },
  '& img': {
    display: 'inline-block',
  },
  ...theme.applyDarkStyles({
    boxShadow: `${alpha(theme.palette.primaryDark[600], 0.1)} 0 2px 0 inset, ${theme.palette.common.black} 0 -2px 0 inset`,
    '&:hover': {
      backgroundColor: theme.palette.primaryDark[800],
      borderColor: theme.palette.primary[900],
    },
  }),
}));

export default function DiamondSponsors() {
  const t = useTranslate();

  return (
    <Stack direction="column" mt={2} spacing={1} useFlexGap>
      <NativeLink
        data-ga-event-category="sponsor"
        data-ga-event-action="docs-premium"
        data-ga-event-label="consulting"
        href="/consulting"
        rel="noopener sponsored"
        target="_blank"
        sx={{ textDecoration: 'none', fontDirection: '700'}}
      >
        <Box
          component="img"
          height="32px"
          width="32px"
          src="/static/logo-no-padding.svg"
          alt="brian stoker"
          title="B STOKED"
          loading="lazy"
        />
        <Typography
          component="h6"
          color="text.primary"
          variant="body2" sx={{
            flexDirection: 'column',
            display: 'flex',
            fontSize: '12px',
            fontWeight: 500,
            textDecoration: 'none',
            textTransform: 'uppercase',
            marginLeft: '10px',
          }}>
          {/* eslint-disable-next-line stoked-ui/no-hardcoded-labels */}
          <div>consulting</div>
          {/* eslint-disable-next-line stoked-ui/no-hardcoded-labels */}
          <div>$70 / hr</div>
        </Typography>
      </NativeLink>
      <NativeLink
        data-ga-event-category="sponsor"
        data-ga-event-action="docs-premium"
        data-ga-event-label="brianstoker.com"
        href="https://www.brianstoker.com/drums"
        rel="noopener sponsored"
        target="_blank"
      >
        <Box
          component="img"
          height="27px"
          width="90px"
          src="/static/images/bs.logo.svg"
          alt="brian stoker"
          title="b stoked"
          loading="lazy"
          sx={(theme) =>
            theme.applyDarkStyles({
              content: `url(/static/images/bs.logo.dark.svg)`,
            })
          }
        />
      </NativeLink>
      <Link
        href="/material-ui/discover-more/backers/#diamond-sponsors"
        sx={(theme) => ({
          p: 1.5,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 1,
          border: '1px dashed',
          transition: theme.transitions.create(['color', 'border-color', 'background-color']),
          backgroundColor: alpha(theme.palette.grey[50], 0.5),
          borderColor: theme.palette.grey[300],
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary[100], 0.5),
            borderColor: theme.palette.primary[300],
          },
          ...theme.applyDarkStyles({
            backgroundColor: alpha(theme.palette.primaryDark[700], 0.2),
            borderColor: theme.palette.primaryDark[700],
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary[700], 0.2),
              borderColor: theme.palette.primary[800],
            },
          }),
        })}
      >
        <Typography variant="caption" fontWeight="semiBold" textAlign="center">
          {t('becomeADiamondSponsor')}
        </Typography>
        {/* <Typography variant="caption" fontWeight="regular" color="text.secondary">
              {t('diamondSponsorVacancies')}
            </Typography> */}
      </Link>
    </Stack>
  );
}

