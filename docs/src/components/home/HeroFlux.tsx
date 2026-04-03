import * as React from 'react';
import ReactDOM from 'react-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import VolumeOffRounded from '@mui/icons-material/VolumeOffRounded';
import VolumeUpRounded from '@mui/icons-material/VolumeUpRounded';
import GradientText from 'docs/src/components/typography/GradientText';
import SectionHeadline from 'docs/src/components/typography/SectionHeadline';
import Section from 'docs/src/layouts/Section';
import GetStartedButtons from 'docs/src/components/home/GetStartedButtons';

const features = [
  {
    label: 'Multi-Monitor Support',
    description: 'Set different websites as wallpapers on each display with independent controls.',
  },
  {
    label: 'Interactive Browsing Mode',
    description: 'Click through and interact with your wallpaper website directly from the desktop.',
  },
  {
    label: 'Custom CSS & JavaScript',
    description: 'Inject custom styles and scripts to tailor any website to your desktop aesthetic.',
  },
  {
    label: 'Shortcuts Automation',
    description: 'Trigger wallpaper changes and actions with Apple Shortcuts and URL schemes.',
  },
  {
    label: 'Fluid Simulation Wallpaper',
    description:
      'Built-in interactive fluid dynamics wallpaper with mouse tracking for mesmerizing effects.',
  },
];

const EASE = 'cubic-bezier(.4,0,.2,1)';
const TRANSITION = `top .4s ${EASE}, left .4s ${EASE}, width .4s ${EASE}, height .4s ${EASE}`;

function getExpandedRect() {
  const pad = 40;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const maxW = Math.min(vw - pad * 2, 1920);
  const maxH = Math.min(vh - pad * 2, 1080);
  const w = Math.min(maxW, maxH * (16 / 9));
  const h = w * (9 / 16);
  return { top: (vh - h) / 2, left: (vw - w) / 2, width: w, height: h };
}

export default function HeroFlux() {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  // placeholderRef: always in-flow — provides origin/destination rect
  const placeholderRef = React.useRef<HTMLDivElement>(null);
  // wrapperRef: the div rendered into the portal (direct child of document.body)
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  // portalRef: the container we append to document.body
  const portalRef = React.useRef<HTMLDivElement | null>(null);
  const [portalReady, setPortalReady] = React.useState(false);
  const [muted, setMuted] = React.useState(true);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [backdropOpacity, setBackdropOpacity] = React.useState(0);
  const busyRef = React.useRef(false);

  // Create portal container in document.body on mount (client only)
  React.useEffect(() => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    portalRef.current = div;
    setPortalReady(true);
    return () => {
      document.body.removeChild(div);
      portalRef.current = null;
    };
  }, []);

  // Set initial imperative styles once wrapper is mounted in portal
  React.useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    el.style.position = 'fixed';
    el.style.zIndex = '10';
    el.style.lineHeight = '0';
    el.style.cursor = 'zoom-in';
    el.style.borderRadius = '8px';
    el.style.overflow = 'hidden';
    el.style.maxHeight = '1080px';
    el.style.maxWidth = '1920px';
  }, [portalReady]);

  // Sync portal wrapper to placeholder position after every render (idle only)
  React.useLayoutEffect(() => {
    if (lightboxOpen || !wrapperRef.current || !placeholderRef.current) return;
    const { top, left, width, height } = placeholderRef.current.getBoundingClientRect();
    const el = wrapperRef.current;
    el.style.top = `${top}px`;
    el.style.left = `${left}px`;
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;
  }); // intentionally no dep array — runs after every render

  // Scroll / resize tracking while idle
  React.useEffect(() => {
    if (lightboxOpen) return;
    const sync = () => {
      if (!wrapperRef.current || !placeholderRef.current) return;
      const { top, left, width, height } = placeholderRef.current.getBoundingClientRect();
      const el = wrapperRef.current;
      el.style.top = `${top}px`;
      el.style.left = `${left}px`;
      el.style.width = `${width}px`;
      el.style.height = `${height}px`;
    };
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      window.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [lightboxOpen]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const next = !muted;
      videoRef.current.muted = next;
      setMuted(next);
    }
  };

  const handleExpand = () => {
    if (!wrapperRef.current || lightboxOpen || busyRef.current) return;
    busyRef.current = true;
    const el = wrapperRef.current;

    // Wrapper is already at placeholder's position from the sync effect
    el.style.transition = 'none';
    el.style.zIndex = '2000';
    el.style.cursor = 'zoom-out';
    setLightboxOpen(true);

    // Force the browser to commit the starting style before we apply the transition
    el.getBoundingClientRect();

    requestAnimationFrame(() => {
      const exp = getExpandedRect();
      el.style.transition = TRANSITION;
      el.style.top = `${exp.top}px`;
      el.style.left = `${exp.left}px`;
      el.style.width = `${exp.width}px`;
      el.style.height = `${exp.height}px`;
      el.style.borderRadius = '4px';
      setBackdropOpacity(1);
      setTimeout(() => { busyRef.current = false; }, 420);
    });
  };

  const handleCollapse = React.useCallback(() => {
    if (!placeholderRef.current || !wrapperRef.current || !lightboxOpen || busyRef.current) return;
    busyRef.current = true;
    const { top, left, width, height } = placeholderRef.current.getBoundingClientRect();
    const el = wrapperRef.current;

    setBackdropOpacity(0);
    el.style.transition = TRANSITION;
    el.style.top = `${top}px`;
    el.style.left = `${left}px`;
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;
    el.style.borderRadius = '8px';

    setTimeout(() => {
      setLightboxOpen(false);
      el.style.transition = 'none';
      el.style.zIndex = '10';
      el.style.cursor = 'zoom-in';
      busyRef.current = false;
    }, 420);
  }, [lightboxOpen]);

  React.useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleCollapse(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, handleCollapse]);

  /*
   * The video lives in a portal attached directly to document.body.
   * This guarantees position:fixed is relative to the viewport — not to any
   * backdropFilter/transform ancestor inside the hero layout.
   */
  const videoPortal =
    portalReady && portalRef.current
      ? ReactDOM.createPortal(
          <div ref={wrapperRef} onClick={handleExpand}>
            <Box
              ref={videoRef}
              component="video"
              src="https://cdn.stokedconsulting.com/products/flux/assets/flux-preview_en.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              sx={{
                display: 'block',
                width: '100%',
                aspectRatio: '16 / 9',
                height: 'auto',
                objectFit: 'cover',
              }}
            />
            <IconButton
              onClick={toggleMute}
              size="small"
              aria-label={muted ? 'Unmute video' : 'Mute video'}
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                bgcolor: 'rgba(0, 0, 0, 0.45)',
                color: 'white',
                backdropFilter: 'blur(4px)',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.65)' },
              }}
            >
              {muted ? <VolumeOffRounded fontSize="small" /> : <VolumeUpRounded fontSize="small" />}
            </IconButton>
          </div>,
          portalRef.current,
        )
      : null;

  return (
    <React.Fragment>
      <Box
        sx={(theme) => ({
          overflow: 'hidden',
          background: `radial-gradient(circle at top center, ${theme.palette.primary[50]} 0%, ${theme.palette.grey[50]} 55%, ${theme.palette.background.default} 100%)`,
          ...theme.applyDarkStyles({
            background: `radial-gradient(circle at top center, rgba(25, 118, 210, 0.18) 0%, ${theme.palette.primaryDark[900]} 55%, ${theme.palette.background.default} 100%)`,
          }),
        })}
      >
        <Container
          sx={{
            pt: { xs: 8, md: 6 },
            pb: { xs: 6, md: 8 },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 4, md: 6 },
            }}
          >
            <Box
              sx={(theme) => ({
                width: '100%',
                borderRadius: { xs: 3, md: 4 },
                px: { xs: 1.25, sm: 1.75, md: 2.5 },
                py: { xs: 1.25, sm: 1.75, md: 2.5 },
                bgcolor: 'rgba(255, 255, 255, 0.38)',
                backdropFilter: 'blur(12px)',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 24px 80px rgba(15, 23, 42, 0.12)',
                ...theme.applyDarkStyles({
                  bgcolor: 'rgba(2, 8, 23, 0.45)',
                  boxShadow: '0 28px 90px rgba(0, 0, 0, 0.45)',
                }),
              })}
            >
              <Box
                sx={{
                  width: '100%',
                  maxWidth: { md: 1080, xl: 1160 },
                  mx: 'auto',
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'common.black',
                }}
              >
                {/*
                 * Placeholder: stays in-flow so it reserves space in the layout
                 * and gives us the correct getBoundingClientRect() at all times.
                 * The actual video is rendered in the portal above.
                 */}
                <Box
                  ref={placeholderRef}
                  sx={{ width: '100%', aspectRatio: '16 / 9', maxWidth: '100%', mx: 'auto' }}
                />
              </Box>
            </Box>

            <Box
              sx={{
                maxWidth: 720,
                textAlign: { xs: 'center', md: 'left' },
                mx: { xs: 'auto', md: 0 },
              }}
            >
              <Typography variant="h1" mb={1}>
                <GradientText>Flux</GradientText>
              </Typography>
              <Typography
                variant="h2"
                mb={1}
                sx={{ fontSize: 'clamp(1.25rem, 0.8rem + 1.2vw, 1.75rem)' }}
              >
                Make any website your Mac desktop wallpaper
              </Typography>
              <Typography color="text.secondary" mb={3}>
                Flux is a Mac OSX app that turns any website into a live, interactive desktop
                wallpaper. Browse the web on your desktop, inject custom CSS and JavaScript, automate
                with Shortcuts, and enjoy built-in fluid simulations with mouse tracking -- all with
                full multi-monitor support.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                <GetStartedButtons
                  primaryLabel="Download Flux"
                  primaryUrl="https://cdn.stokedconsulting.com/products/flux/installers/Flux-3.1.0-mac.pkg"
                  primaryUrlTarget="_blank"
                />
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Video rendered in portal — completely outside any backdropFilter ancestor */}
      {videoPortal}

      {/* Backdrop */}
      {lightboxOpen && (
        <Box
          onClick={handleCollapse}
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 1999,
            opacity: backdropOpacity,
            transition: 'opacity 0.35s ease',
            cursor: 'zoom-out',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        />
      )}

      <Divider />
      <Section bg="comfort" cozy>
        <SectionHeadline
          alwaysCenter
          overline="Features"
          title={
            <Typography variant="h2" component="h2">
              Everything you need for a <GradientText>living desktop</GradientText>
            </Typography>
          }
          description="Flux turns your Mac desktop into a dynamic canvas powered by the web."
        />
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={index < 3 ? 4 : 6} key={feature.label}>
                <Box
                  sx={(theme) => ({
                    p: 3,
                    height: '100%',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    ...theme.applyDarkStyles({
                      bgcolor: 'primaryDark.800',
                      borderColor: 'primaryDark.600',
                    }),
                  })}
                >
                  <Chip
                    label={feature.label}
                    color="primary"
                    size="small"
                    variant="outlined"
                    sx={{ mb: 1.5, fontWeight: 'bold' }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Section>
    </React.Fragment>
  );
}
