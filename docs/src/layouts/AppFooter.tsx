import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import { useRouter } from 'next/router';
import SvgSuiLogotype from 'docs/src/icons/SvgSuiLogotype';
import SvgStokedConsultingLogotype from 'docs/src/icons/SvgStokedConsultingLogotype';
import EmailSubscribe from 'docs/src/components/footer/EmailSubscribe';
import ROUTES from 'docs/src/route';
import DiscordIcon from 'docs/src/icons/DiscordIcon';
import { Link } from '@stoked-ui/docs';
import SvgStackOverflow from 'docs/src/icons/SvgStackOverflow';
import Slack from '../icons/Slack';
import { useAllProducts } from "../products";

interface AppFooterProps {
  stackOverflowUrl?: string;
}

export default function AppFooter(props: AppFooterProps) {
  const { stackOverflowUrl } = props;
  const allProducts = useAllProducts();
  const router = useRouter();
  const isConsultingPage = router.pathname.startsWith('/consulting');

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
            {isConsultingPage ? (
              <React.Fragment>
                <SvgStokedConsultingLogotype
                  layout="inline"
                  height={28}
                  width={210}
                  sx={{ display: { xs: 'none', md: 'block' } }}
                />
                <SvgStokedConsultingLogotype
                  layout="stacked"
                  height={28}
                  width={105}
                  sx={{ display: { xs: 'block', md: 'none' } }}
                />
              </React.Fragment>
            ) : (
              <SvgSuiLogotype height={28} width={91} />
            )}
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
            gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr 1fr' },
            gridAutoColumns: '1fr',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography fontWeight="semiBold" variant="body2" sx={{ mb: 0.5 }}>
              Products
            </Typography>
            {allProducts.live.map((product) => (
              <Link key={product.id} prefetch={false} href={product.url('product')}>
                {product.name}
              </Link>
            ))}
            {/* {PRODUCTS.live.map((product) => (
              <Link key={product.id} prefetch={false} href={product.url('product')}>
                {product.name}
              </Link>
            ))} */}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography fontWeight="semiBold" variant="body2" sx={{ mb: 0.5 }}>
              Consulting
            </Typography>
            <Link prefetch={false} href="/consulting/">
              Overview
            </Link>
            <Link prefetch={false} href="/consulting/front-end/">
              Front End
            </Link>
            <Link prefetch={false} href="/consulting/back-end/">
              Back End
            </Link>
            <Link prefetch={false} href="/consulting/devops/">
              Devops
            </Link>
            <Link prefetch={false} href="/consulting/ai/">
              AI
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
            {/*   <Link prefetch={false} href={ROUTES.showcase}>
              Showcase
            </Link> */}
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
            <Link prefetch={false} target="_blank" rel="noopener" href="mailto:b@stokedconsulting.com">
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
          Copyright © {new Date().getFullYear()} Stoked Consulting
        </Typography>
        <Stack spacing={1} direction="row" flexWrap="wrap" useFlexGap>
          <IconButton
            target="_blank"
            rel="noopener"
            href="https://github.com/stoked-ui/sui"
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
            <Slack sx={[(theme) => ({ color: 'grey' }), (theme) => theme.applyDarkStyles({ color: '#FFF' })]} variant={'hover-color'} fontSize="small" />
          </IconButton>
          <IconButton
            target="_blank"
            rel="noopener"
            href="https://www.linkedin.com/in/brian-stoker/"
            aria-label="linkedin"
            title="LinkedIn"
            size="small"
          >
            <LinkedInIcon fontSize="small" />
          </IconButton>
          <IconButton
            target="_blank"
            rel="noopener"
            href="https://discord.gg/YHpSwttm"
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
