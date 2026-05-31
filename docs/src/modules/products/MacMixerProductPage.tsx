import * as React from 'react';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import HeadphonesRoundedIcon from '@mui/icons-material/HeadphonesRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import RouteRoundedIcon from '@mui/icons-material/RouteRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import SettingsInputComponentRoundedIcon from '@mui/icons-material/SettingsInputComponentRounded';
import SpeakerRoundedIcon from '@mui/icons-material/SpeakerRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import NoSsr from '@mui/material/NoSsr';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { BrandingCssVarsProvider, Link } from '@stoked-ui/docs';
import AppHeaderBanner from 'docs/src/components/banner/AppHeaderBanner';
import NewsletterToast from 'docs/src/components/home/NewsletterToast';
import AppFooter from 'docs/src/layouts/AppFooter';
import AppHeader from 'docs/src/layouts/AppHeader';
import Head from 'docs/src/modules/components/Head';

const alphaInstallerUrl =
  'https://cdn.stokd.cloud/products/mac-mixer/releases/alpha/2.0.0-1/MacMixer-2.0.0-1.pkg';

const routes = [
  {
    app: 'Zoom',
    device: 'AirPods Pro',
    volume: 82,
    icon: <HeadphonesRoundedIcon fontSize="small" />,
  },
  {
    app: 'Spotify',
    device: 'Studio Display',
    volume: 35,
    icon: <SpeakerRoundedIcon fontSize="small" />,
  },
  {
    app: 'Chrome',
    device: 'HDMI Capture',
    volume: 58,
    icon: <SettingsInputComponentRoundedIcon fontSize="small" />,
  },
];

const featureGroups = [
  {
    icon: <RouteRoundedIcon />,
    title: 'Per-app routing',
    description: 'Drag a running app onto the output device that should play it, then keep that assignment across launches.',
  },
  {
    icon: <VolumeUpRoundedIcon />,
    title: 'Independent levels',
    description: 'Set an app volume and a device master volume without changing the rest of macOS audio.',
  },
  {
    icon: <TuneRoundedIcon />,
    title: 'Device control',
    description: 'Rename outputs, hide devices you do not use, and keep new apps on the default route.',
  },
  {
    icon: <SecurityRoundedIcon />,
    title: 'Local audio path',
    description: 'Audio stays on the Mac. Network calls are limited to licensing and optional product notices.',
  },
];

const docs = [
  {
    title: 'Overview',
    href: '/products/mac-mixer/docs/overview/',
    description: 'What Mac Mixer does, requirements, and current alpha scope.',
  },
  {
    title: 'Routing and volumes',
    href: '/products/mac-mixer/docs/app-volumes/',
    description: 'How apps move between devices and how volume is applied.',
  },
  {
    title: 'Installation',
    href: '/products/mac-mixer/docs/installation/',
    description: 'First launch, HAL plug-in install, and release channel notes.',
  },
  {
    title: 'Configuration',
    href: '/products/mac-mixer/docs/configuration/',
    description: 'The YAML config file and the runtime driver contract.',
  },
];

function RouteRow(props: { app: string; device: string; volume: number; icon: React.ReactNode }) {
  const { app, device, volume, icon } = props;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '32px 1fr auto',
        gap: 1.5,
        alignItems: 'center',
        py: 1.25,
        px: 1.5,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1,
          display: 'grid',
          placeItems: 'center',
          color: '#0b4d3a',
          bgcolor: '#d8f3e6',
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" fontWeight={700} noWrap>
          {app}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {device}
        </Typography>
      </Box>
      <Stack direction="row" spacing={0.75} alignItems="center">
        <Box
          aria-hidden
          sx={{
            width: 54,
            height: 6,
            borderRadius: 999,
            bgcolor: 'divider',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ width: `${volume}%`, height: '100%', bgcolor: '#18a777' }} />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ width: 30, textAlign: 'right' }}>
          {volume}%
        </Typography>
      </Stack>
    </Box>
  );
}

function ProductPreview() {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 780,
        mx: 'auto',
        mt: { xs: 5, md: 6 },
        overflow: 'hidden',
        borderRadius: '8px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        color: 'text.primary',
        boxShadow: '0 22px 80px rgba(2, 10, 8, 0.38)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.25,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            component="img"
            src="/static/mac-mixer/mac-mixer-logo-cropped.png"
            alt=""
            sx={{ width: 28, height: 28, objectFit: 'contain' }}
          />
          <Typography variant="body2" fontWeight={800}>
            Mac Mixer
          </Typography>
        </Stack>
        <Chip label="3 active routes" size="small" color="success" variant="outlined" />
      </Box>
      <Box sx={{ px: { xs: 1.5, sm: 2 }, py: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', overflow: 'hidden', height: '100%' }}>
              <Box sx={{ p: 1.5, bgcolor: '#eef7f1' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <HeadphonesRoundedIcon fontSize="small" color="success" />
                  <Typography variant="body2" fontWeight={800}>
                    AirPods Pro
                  </Typography>
                </Stack>
              </Box>
              <RouteRow {...routes[0]} />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', overflow: 'hidden', height: '100%' }}>
              <Box sx={{ p: 1.5, bgcolor: '#fff7de' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <SpeakerRoundedIcon fontSize="small" sx={{ color: '#9a6500' }} />
                  <Typography variant="body2" fontWeight={800}>
                    Studio Display
                  </Typography>
                </Stack>
              </Box>
              <RouteRow {...routes[1]} />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', overflow: 'hidden', height: '100%' }}>
              <Box sx={{ p: 1.5, bgcolor: '#eef3ff' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <SettingsInputComponentRoundedIcon fontSize="small" sx={{ color: '#3157a4' }} />
                  <Typography variant="body2" fontWeight={800}>
                    HDMI Capture
                  </Typography>
                </Stack>
              </Box>
              <RouteRow {...routes[2]} />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

function FeatureCard(props: { icon: React.ReactNode; title: string; description: string }) {
  const { icon, title, description } = props;

  return (
    <Paper variant="outlined" sx={{ height: '100%', p: 2.5, borderRadius: '8px' }}>
      <Box sx={{ color: 'primary.main', mb: 1 }}>{icon}</Box>
      <Typography variant="h6" component="h3" fontWeight={800} gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Paper>
  );
}

export default function MacMixerProductPage() {
  return (
    <BrandingCssVarsProvider>
      <Head
        title="Mac Mixer - Per-app audio routing for macOS"
        description="Mac Mixer routes each Mac app to the output device you choose, with independent app volume and local CoreAudio processing."
        card="/static/mac-mixer/mac-mixer-logo-cropped.png"
      />
      <NoSsr>
        <NewsletterToast />
      </NoSsr>
      <AppHeaderBanner />
      <AppHeader />
      <main id="main-content">
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            bgcolor: '#0c1110',
            color: '#fff',
            borderBottom: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <Box
            component="img"
            src="/static/mac-mixer/mac-mixer-logo-cropped.png"
            alt=""
            sx={{
              position: 'absolute',
              top: { xs: 28, md: -40 },
              right: { xs: -150, md: '8%' },
              width: { xs: 420, md: 620 },
              maxWidth: 'none',
              opacity: 0.16,
              filter: 'saturate(0.8)',
              pointerEvents: 'none',
            }}
          />
          <Container sx={{ position: 'relative', py: { xs: 7, md: 9 } }}>
            <Stack spacing={2.5} sx={{ maxWidth: 820 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label="macOS 13+" size="small" sx={{ bgcolor: '#d8f3e6', color: '#0b4d3a', fontWeight: 700 }} />
                <Chip label="30-day trial" size="small" sx={{ bgcolor: '#fff1c7', color: '#6b4c00', fontWeight: 700 }} />
                <Chip label="Private alpha" size="small" sx={{ bgcolor: '#e8edff', color: '#273b78', fontWeight: 700 }} />
              </Stack>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: 48, sm: 64, md: 76 },
                  lineHeight: 0.95,
                  letterSpacing: 0,
                  fontWeight: 900,
                  color: '#fff',
                  textShadow: '0 2px 28px rgba(0,0,0,0.52)',
                }}
              >
                Mac Mixer
              </Typography>
              <Typography
                variant="h4"
                component="p"
                sx={{
                  maxWidth: 760,
                  color: 'rgba(255,255,255,0.82)',
                  fontWeight: 500,
                  lineHeight: 1.25,
                }}
              >
                Route each Mac app to the output device where it belongs, then set app-level and device-level volume from the menu bar.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 1, maxWidth: { xs: 360, sm: 'none' } }}>
                <Button
                  component={Link}
                  href={alphaInstallerUrl}
                  variant="contained"
                  size="large"
                  startIcon={<DownloadRoundedIcon />}
                >
                  Download alpha
                </Button>
                <Button
                  component={Link}
                  href="/products/mac-mixer/docs/installation/"
                  variant="outlined"
                  size="large"
                  startIcon={<MenuBookRoundedIcon />}
                  sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.42)' }}
                >
                  Install instructions
                </Button>
              </Stack>
            </Stack>
            <ProductPreview />
          </Container>
        </Box>

        <Box sx={{ bgcolor: 'background.default', py: { xs: 7, md: 9 } }}>
          <Container>
            <Grid container spacing={3}>
              {featureGroups.map((feature) => (
                <Grid item xs={12} sm={6} md={3} key={feature.title}>
                  <FeatureCard {...feature} />
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        <Divider />

        <Box sx={{ py: { xs: 7, md: 9 } }}>
          <Container>
            <Grid container spacing={5} alignItems="flex-start">
              <Grid item xs={12} md={5}>
                <Typography variant="overline" color="primary.main" fontWeight={800}>
                  How it works
                </Typography>
                <Typography variant="h3" component="h2" fontWeight={900} sx={{ mt: 1, mb: 2 }}>
                  A virtual output device backed by a native menu-bar router.
                </Typography>
                <Typography color="text.secondary">
                  Mac Mixer installs a CoreAudio HAL plug-in that appears as the system output device. The companion app reads its loopback buses and forwards each app stream to the physical output selected in the popover.
                </Typography>
              </Grid>
              <Grid item xs={12} md={7}>
                <Grid container spacing={2}>
                  {[
                    ['Virtual device', 'Mac Mixer becomes the default output so app audio can be captured and separated.'],
                    ['Eight output routes', 'The current driver exposes eight loopback buses for simultaneous physical output destinations.'],
                    ['YAML persistence', 'Routes, custom device names, enabled outputs, and volume settings are stored in Application Support.'],
                    ['Licensing ready', 'The direct alpha supports a Stripe license path and local trial state.'],
                  ].map(([title, description]) => (
                    <Grid item xs={12} sm={6} key={title}>
                      <Box sx={{ borderTop: '2px solid', borderColor: 'primary.main', pt: 2 }}>
                        <Typography variant="h6" component="h3" fontWeight={800}>
                          {title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                          {description}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Container>
        </Box>

        <Box sx={{ bgcolor: 'background.default', py: { xs: 7, md: 9 } }}>
          <Container>
            <Stack spacing={1.5} sx={{ maxWidth: 760, mb: 4 }}>
              <Typography variant="overline" color="primary.main" fontWeight={800}>
                Documentation
              </Typography>
              <Typography variant="h3" component="h2" fontWeight={900}>
                Build notes, setup, and user docs are in one place.
              </Typography>
            </Stack>
            <Grid container spacing={2}>
              {docs.map((doc) => (
                <Grid item xs={12} md={6} key={doc.href}>
                  <Paper
                    component={Link}
                    href={doc.href}
                    variant="outlined"
                    sx={{
                      display: 'block',
                      height: '100%',
                      p: 2.5,
                      borderRadius: '8px',
                      textDecoration: 'none',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <GraphicEqRoundedIcon color="primary" />
                      <div>
                        <Typography variant="h6" component="h3" fontWeight={800} color="text.primary">
                          {doc.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {doc.description}
                        </Typography>
                      </div>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        <Box sx={{ py: { xs: 7, md: 9 } }}>
          <Container>
            <Paper
              variant="outlined"
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: '8px',
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', md: '1fr auto' },
                alignItems: 'center',
              }}
            >
              <div>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <BoltRoundedIcon color="primary" />
                  <Typography variant="h4" component="h2" fontWeight={900}>
                    Alpha release status
                  </Typography>
                </Stack>
                <Typography color="text.secondary">
                  The current build is focused on per-app output routing, volume control, device management, and the direct license flow. The alpha installer is signed, notarized, and ready for Stripe/direct-license testers.
                </Typography>
              </div>
              <Button
                component={Link}
                href={alphaInstallerUrl}
                variant="contained"
                startIcon={<DownloadRoundedIcon />}
              >
                Download installer
              </Button>
            </Paper>
          </Container>
        </Box>
      </main>
      <Divider />
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
