import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import GitHubIcon from '@mui/icons-material/GitHub';
import Slack from '../icons/Slack';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import SvgSuiLogotype from 'docs/src/icons/SvgSuiLogotype';
import EmailSubscribe from 'docs/src/components/footer/EmailSubscribe';
import ROUTES from 'docs/src/route';
import DiscordIcon from 'docs/src/icons/DiscordIcon';
import { Link } from '@mui/docs/Link';
import SvgStackOverflow from 'docs/src/icons/SvgStackOverflow';
import { PRODUCTS } from "../products";

interface AppFooterProps {
  stackOverflowUrl?: string;
}

export default function AppFooter(props: AppFooterProps) {
  const { stackOverflowUrl } = props;

  return (
    <Container component="footer">
      <Box
        sx={{
          py: { xs: 4, sm: 8 },
          display: 'grid',
          gridAutoColumns: '1fr',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 4,
          gridTemplateColumns: { xs: '1fr', sm: '1fr', md: '1fr 1.75fr', lg: '1fr 1fr' },
          gridTemplateRows: 'auto',
          '& a:not(.MuiIconButton-root)': {
            pt: 0.5,
            pb: 0.5,
            color: 'text.secondary',
            typography: 'body2',
            '&:hover': {
              color: 'primary.main',
              textDecoration: 'underline',
            },
          },
        }}
      >
        <div>
          <Link prefetch={false} href="/" aria-label="Go to homepage" sx={{ mb: 2 }}>
            <SvgSuiLogotype height={28} width={91} />
          </Link>
          <Typography variant="body2" fontWeight="semiBold" gutterBottom>
            Keep up to date
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Join our newsletter for regular updates. No spam ever.
          </Typography>
          <EmailSubscribe />
        </div>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
            gridAutoColumns: '1fr',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography fontWeight="semiBold" variant="body2" sx={{ mb: 0.5 }}>
              Products
            </Typography>
            <Link prefetch={false} href={PRODUCTS.index['stoked-ui'].url('product')}>
              Stoked UI
            </Link>
            <Link prefetch={false} href={PRODUCTS.getFeatureUrl('stoked-ui', 'file-explorer', 'doc')}>
              File Explorer
            </Link>
            <Link prefetch={false} href={PRODUCTS.getFeatureUrl('stoked-ui', 'media-selector', 'doc')}>
              Media Selector
            </Link>
            <Link prefetch={false} href={PRODUCTS.index['stoked-consulting'].url('product')}>
              Consulting
            </Link>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography fontWeight="semiBold" variant="body2" sx={{ mb: 0.5 }}>
              Explore
            </Typography>
            <Link prefetch={false} href={ROUTES.documentation}>
              Documentation
            </Link>
            <Link prefetch={false} href={ROUTES.blog}>
              Blog
            </Link>
            <Link prefetch={false} href={ROUTES.showcase}>
              Showcase
            </Link>
            <Link prefetch={false} href={ROUTES.coreRoadmap}>
              Roadmap
            </Link>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography fontWeight="semiBold" variant="body2" sx={{ mb: 0.5 }}>
              Company
            </Typography>
            <Link prefetch={false} href={ROUTES.about}>
              About
            </Link>
            <Link prefetch={false} href={ROUTES.vision}>
              Vision
            </Link>
            <Link prefetch={false} href={ROUTES.support}>
              Support
            </Link>
            <Link prefetch={false} href={ROUTES.privacyPolicy}>
              Privacy policy
            </Link>
            <Link prefetch={false} target="_blank" rel="noopener" href="mailto:contact@mui.com">
              Contact us
            </Link>
          </Box>
        </Box>
      </Box>
      <Divider />
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems="center"
        justifyContent={{ sm: 'space-between' }}
        gap={{ xs: 2, sm: 1 }}
        sx={{ my: 4 }}
      >
        <Typography color="text.tertiary" variant="caption" fontWeight={400}>
          Copyright © {new Date().getFullYear()} Stoked UI
        </Typography>
        <Stack spacing={1} direction="row" flexWrap="wrap" useFlexGap>
          <IconButton
            target="_blank"
            rel="noopener"
            href="https://github.com/mui"
            aria-label="github"
            title="GitHub"
            size="small"
          >
            <GitHubIcon fontSize="small" />
          </IconButton>
          <IconButton
            target="_blank"
            rel="noopener"
            href={ROUTES.rssFeed}
            aria-label="RSS Feed"
            title="RSS Feed"
            size="small"
          >
            <RssFeedIcon fontSize="small" />
          </IconButton>
          <IconButton
            target="_blank"
            rel="noopener"
            href="https://stokedconsulting.slack.com"
            aria-label="slack"
            title="Slack"
            size="small"
          >
            <Slack sx={{ color: 'white' }} variant={'monochrome'} fontSize="small" />
          </IconButton>
          <IconButton
            target="_blank"
            rel="noopener"
            href="https://www.linkedin.com/company/mui/"
            aria-label="linkedin"
            title="LinkedIn"
            size="small"
          >
            <LinkedInIcon fontSize="small" />
          </IconButton>
          <IconButton
            target="_blank"
            rel="noopener"
            href="https://www.youtube.com/@MUI_hq"
            aria-label="YouTube"
            title="YouTube"
            size="small"
          >
            <YouTubeIcon fontSize="small" />
          </IconButton>
          <IconButton
            target="_blank"
            rel="noopener"
            href="https://stoked-ui.github.io/r/discord/"
            aria-label="Discord"
            title="Discord"
            size="small"
          >
            <DiscordIcon fontSize="small" />
          </IconButton>
          {stackOverflowUrl ? (
            <IconButton
              target="_blank"
              rel="noopener"
              href={stackOverflowUrl}
              aria-label="Stack Overflow"
              title="Stack Overflow"
              size="small"
            >
              <SvgStackOverflow fontSize="small" />
            </IconButton>
          ) : null}
        </Stack>
      </Stack>
    </Container>
  );
}
