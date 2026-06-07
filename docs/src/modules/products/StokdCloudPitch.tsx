import * as React from 'react';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import GitHubIcon from '@mui/icons-material/GitHub';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import HistoryEduRoundedIcon from '@mui/icons-material/HistoryEduRounded';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import RuleRoundedIcon from '@mui/icons-material/RuleRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import SendToMobileRoundedIcon from '@mui/icons-material/SendToMobileRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  STOKD_CLOUD_APP_URL,
  STOKD_CLOUD_INSTALL_URL,
  stokdCloudArtifact,
  stokdCloudComparisonRows,
  stokdCloudComparisonTitles,
  stokdCloudDocLinks,
  stokdCloudFeatures,
  stokdCloudHero,
  stokdCloudPillars,
  stokdCloudPricingTiers,
  stokdCloudTrustItems,
} from './stokdCloudContent';

const featureIcons = [
  <ScienceRoundedIcon />,
  <HubRoundedIcon />,
  <TerminalRoundedIcon />,
  <SendToMobileRoundedIcon />,
  <BoltRoundedIcon />,
  <InsightsRoundedIcon />,
  <GitHubIcon />,
  <GroupsRoundedIcon />,
  <PaidRoundedIcon />,
];

const pillarIcons = [<RuleRoundedIcon />, <HistoryEduRoundedIcon />];

const trustIcons = [
  <AccountTreeRoundedIcon />,
  <GavelRoundedIcon />,
  <ShieldRoundedIcon />,
  <CheckCircleRoundedIcon />,
];

function AxiomArtifactCard() {
  return (
    <Box sx={{ width: '100%', maxWidth: 780, mx: 'auto', mt: { xs: 5, md: 6 } }}>
      <Typography
        variant="body2"
        sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.72)', mb: 1.5 }}
      >
        {stokdCloudArtifact.caption}
      </Typography>
      <Box
        sx={{
          overflow: 'hidden',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.16)',
          bgcolor: '#0b0e14',
          boxShadow: '0 22px 80px rgba(2, 8, 20, 0.55)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1.25,
            borderBottom: '1px solid rgba(255,255,255,0.12)',
            bgcolor: 'rgba(255,255,255,0.04)',
          }}
        >
          <Box sx={{ display: 'flex', gap: 0.75 }}>
            <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: '#ff5f56' }} />
            <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
            <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: '#27c93f' }} />
          </Box>
          <Typography
            variant="caption"
            sx={{ ml: 1, fontFamily: 'monospace', color: 'rgba(255,255,255,0.6)' }}
          >
            {stokdCloudArtifact.filename}
          </Typography>
        </Box>
        <Box
          component="pre"
          sx={{
            m: 0,
            p: 2.5,
            overflowX: 'auto',
            fontSize: 13,
            lineHeight: 1.6,
            fontFamily: 'monospace',
            color: 'rgba(255,255,255,0.88)',
          }}
        >
          <code>{stokdCloudArtifact.code}</code>
        </Box>
      </Box>
      <Stack
        direction="row"
        spacing={1}
        alignItems="flex-start"
        justifyContent="center"
        sx={{ mt: 2, maxWidth: 640, mx: 'auto' }}
      >
        <ShieldRoundedIcon sx={{ fontSize: 18, color: '#27c93f', mt: '2px' }} />
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.72)' }}>
          {stokdCloudArtifact.footnote}
        </Typography>
      </Stack>
    </Box>
  );
}

function Hero() {
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#0c1020',
        color: '#fff',
        borderBottom: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      <Container sx={{ position: 'relative', py: { xs: 7, md: 9 } }}>
        <Stack spacing={2.5} alignItems="center" textAlign="center" sx={{ maxWidth: 860, mx: 'auto' }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="center">
            <Chip
              label="Alpha"
              size="small"
              sx={{ bgcolor: '#ffe1e1', color: '#7d1f1f', fontWeight: 700 }}
            />
            <Chip
              label={stokdCloudHero.badge}
              size="small"
              sx={{ bgcolor: '#dde7ff', color: '#23396b', fontWeight: 700 }}
            />
          </Stack>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: 42, sm: 56, md: 68 },
              lineHeight: 1.02,
              fontWeight: 900,
              color: '#fff',
            }}
          >
            {stokdCloudHero.headlinePart1}{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(90deg, #66b2ff 0%, #4dd0e1 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {stokdCloudHero.headlinePart2}
            </Box>
          </Typography>
          <Typography
            variant="h6"
            component="p"
            sx={{ maxWidth: 720, color: 'rgba(255,255,255,0.8)', fontWeight: 400, lineHeight: 1.5 }}
          >
            {stokdCloudHero.subheading}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 1 }}>
            <Button href={STOKD_CLOUD_APP_URL} variant="contained" size="large">
              Get started
            </Button>
            <Button
              href={STOKD_CLOUD_INSTALL_URL}
              variant="outlined"
              size="large"
              startIcon={<TerminalRoundedIcon />}
              sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.42)' }}
            >
              Install local tools
            </Button>
            <Button
              href="/products/stokd-cloud/docs/overview/"
              variant="outlined"
              size="large"
              startIcon={<MenuBookRoundedIcon />}
              sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.42)' }}
            >
              Read the docs
            </Button>
          </Stack>
          <Grid container spacing={2} sx={{ pt: 3, maxWidth: 760 }}>
            {stokdCloudHero.stats.map((stat) => (
              <Grid item xs={12} sm={4} key={stat.label}>
                <Box
                  sx={{
                    border: '1px solid rgba(255,255,255,0.16)',
                    borderRadius: '8px',
                    px: 2,
                    py: 1.5,
                    bgcolor: 'rgba(255,255,255,0.04)',
                  }}
                >
                  <Typography variant="body2" fontWeight={800} sx={{ color: '#fff' }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.64)' }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Stack>
        <AxiomArtifactCard />
      </Container>
    </Box>
  );
}

function Pillars() {
  return (
    <Box sx={{ py: { xs: 7, md: 9 } }}>
      <Container>
        <Stack spacing={1.5} sx={{ maxWidth: 820, mx: 'auto', mb: 5, textAlign: 'center' }}>
          <Typography variant="overline" color="primary.main" fontWeight={800}>
            Why Stokd
          </Typography>
          <Typography variant="h3" component="h2" fontWeight={900}>
            The two things that make an engineer trustworthy — now given to your agents
          </Typography>
          <Typography color="text.secondary">
            A senior engineer knows what must never break, and remembers why every line is there.
            Out of the box, a frontier model has neither. Stokd checks both into your repository.
          </Typography>
        </Stack>
        <Grid container spacing={3}>
          {stokdCloudPillars.map((pillar, index) => (
            <Grid item xs={12} md={6} key={pillar.tag}>
              <Paper variant="outlined" sx={{ height: '100%', p: { xs: 2.5, md: 3.5 }, borderRadius: '8px' }}>
                <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2 }}>
                  <Box sx={{ color: 'primary.main', display: 'inline-flex' }}>{pillarIcons[index]}</Box>
                  <Typography variant="overline" color="primary.main" fontWeight={800}>
                    {pillar.tag}
                  </Typography>
                </Stack>
                <Typography variant="h5" component="h3" fontWeight={800} gutterBottom>
                  {pillar.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                  {pillar.description}
                </Typography>
                <Stack spacing={1.25}>
                  {pillar.points.map((point) => (
                    <Stack direction="row" spacing={1} alignItems="flex-start" key={point}>
                      <CheckRoundedIcon color="success" sx={{ fontSize: 18, mt: '2px' }} />
                      <Typography variant="body2">{point}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

function Comparison() {
  return (
    <Box sx={{ bgcolor: 'background.default', py: { xs: 7, md: 9 } }}>
      <Container>
        <Stack spacing={1.5} sx={{ maxWidth: 820, mx: 'auto', mb: 5, textAlign: 'center' }}>
          <Typography variant="overline" color="primary.main" fontWeight={800}>
            Before & after
          </Typography>
          <Typography variant="h3" component="h2" fontWeight={900}>
            What Stokd adds on top of your coding agent
          </Typography>
          <Typography color="text.secondary">
            Claude Code, Codex, Gemini, and Grok are excellent at writing code in the moment. Stokd
            is the layer that makes them trustworthy on a codebase you have to keep running for
            years.
          </Typography>
        </Stack>
        <Paper variant="outlined" sx={{ borderRadius: '8px', overflow: 'hidden' }}>
          <Grid container sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Grid item md={6} sx={{ p: 2, borderRight: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" fontWeight={800} color="text.secondary">
                {stokdCloudComparisonTitles.raw}
              </Typography>
            </Grid>
            <Grid item md={6} sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight={800} color="primary.main">
                {stokdCloudComparisonTitles.stokd}
              </Typography>
            </Grid>
          </Grid>
          {stokdCloudComparisonRows.map((row) => (
            <Grid
              container
              key={row.stokd}
              sx={{ borderTop: '1px solid', borderColor: 'divider' }}
            >
              <Grid
                item
                xs={12}
                md={6}
                sx={{ p: 2, borderRight: { md: '1px solid' }, borderColor: { md: 'divider' } }}
              >
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <CloseRoundedIcon color="error" sx={{ fontSize: 18, mt: '2px' }} />
                  <Typography variant="body2" color="text.secondary">
                    {row.raw}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6} sx={{ p: 2 }}>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <CheckRoundedIcon color="success" sx={{ fontSize: 18, mt: '2px' }} />
                  <Typography variant="body2">{row.stokd}</Typography>
                </Stack>
              </Grid>
            </Grid>
          ))}
        </Paper>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          Stokd orchestrates the agents you already use — it doesn&apos;t replace them.
        </Typography>
      </Container>
    </Box>
  );
}

function Features() {
  return (
    <Box sx={{ py: { xs: 7, md: 9 } }}>
      <Container>
        <Stack spacing={1.5} sx={{ maxWidth: 820, mb: 5 }}>
          <Typography variant="overline" color="primary.main" fontWeight={800}>
            Platform
          </Typography>
          <Typography variant="h3" component="h2" fontWeight={900}>
            A platform built around the agents, not bolted onto them
          </Typography>
          <Typography color="text.secondary">
            The control plane, governance, and observability that turn a single coding session into
            a fleet you can actually run in production.
          </Typography>
        </Stack>
        <Grid container spacing={3}>
          {stokdCloudFeatures.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={feature.title}>
              <Paper variant="outlined" sx={{ height: '100%', p: 2.5, borderRadius: '8px' }}>
                <Box sx={{ color: 'primary.main', mb: 1 }}>{featureIcons[index]}</Box>
                <Typography variant="h6" component="h3" fontWeight={800} gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

function Trust() {
  return (
    <Box sx={{ bgcolor: 'background.default', py: { xs: 7, md: 9 } }}>
      <Container>
        <Grid container spacing={5} alignItems="flex-start">
          <Grid item xs={12} md={5}>
            <Typography variant="overline" color="primary.main" fontWeight={800}>
              Governance
            </Typography>
            <Typography variant="h3" component="h2" fontWeight={900} sx={{ mt: 1, mb: 2 }}>
              Autonomy you stay in control of
            </Typography>
            <Typography color="text.secondary">
              Turning a frontier model loose on your repo only works if it can&apos;t surprise you.
              Stokd makes every run bounded, reviewable, and reversible — so you steer the calls
              that matter and skip the babysitting.
            </Typography>
          </Grid>
          <Grid item xs={12} md={7}>
            <Grid container spacing={2}>
              {stokdCloudTrustItems.map((item, index) => (
                <Grid item xs={12} sm={6} key={item.title}>
                  <Box sx={{ borderTop: '2px solid', borderColor: 'primary.main', pt: 2, height: '100%' }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                      <Box sx={{ color: 'primary.main', display: 'inline-flex' }}>
                        {trustIcons[index]}
                      </Box>
                      <Typography variant="h6" component="h3" fontWeight={800}>
                        {item.title}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

function Pricing() {
  return (
    <Box sx={{ py: { xs: 7, md: 9 } }}>
      <Container>
        <Stack spacing={1.5} sx={{ maxWidth: 760, mx: 'auto', mb: 5, textAlign: 'center' }}>
          <Typography variant="overline" color="primary.main" fontWeight={800}>
            Pricing
          </Typography>
          <Typography variant="h3" component="h2" fontWeight={900}>
            Simple, transparent pricing
          </Typography>
          <Typography color="text.secondary">
            Choose the plan that&apos;s right for you. No hidden fees.
          </Typography>
        </Stack>
        <Grid container spacing={3} justifyContent="center">
          {stokdCloudPricingTiers.map((tier) => (
            <Grid item xs={12} sm={6} md={5} key={tier.name}>
              <Paper
                variant="outlined"
                sx={{
                  height: '100%',
                  p: 3,
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  ...(tier.highlighted && { borderColor: 'primary.main', borderWidth: 2 }),
                }}
              >
                {tier.highlighted && (
                  <Chip
                    label="Most popular"
                    color="primary"
                    size="small"
                    sx={{ alignSelf: 'flex-start', mb: 1.5, fontWeight: 700 }}
                  />
                )}
                <Typography variant="h5" component="h3" fontWeight={800}>
                  {tier.name}
                </Typography>
                <Typography variant="h6" color="primary.main" fontWeight={800} sx={{ mb: 0.5 }}>
                  {tier.price}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {tier.description}
                </Typography>
                <Stack spacing={1} sx={{ mb: 3 }}>
                  {tier.features.map((feature) => (
                    <Stack direction="row" spacing={1} alignItems="flex-start" key={feature}>
                      <CheckRoundedIcon color="success" sx={{ fontSize: 18, mt: '2px' }} />
                      <Typography variant="body2">{feature}</Typography>
                    </Stack>
                  ))}
                </Stack>
                <Button
                  href={tier.href}
                  variant={tier.highlighted ? 'contained' : 'outlined'}
                  sx={{ mt: 'auto' }}
                >
                  {tier.cta}
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
          All plans include GitHub OAuth, real-time WebSocket updates, and full REST API access.
        </Typography>
      </Container>
    </Box>
  );
}

function DocsLinks() {
  return (
    <Box sx={{ bgcolor: 'background.default', py: { xs: 7, md: 9 } }}>
      <Container>
        <Stack spacing={1.5} sx={{ maxWidth: 760, mb: 4 }}>
          <Typography variant="overline" color="primary.main" fontWeight={800}>
            Documentation
          </Typography>
          <Typography variant="h3" component="h2" fontWeight={900}>
            Architecture, setup, and reference docs in one place.
          </Typography>
        </Stack>
        <Grid container spacing={2}>
          {stokdCloudDocLinks.map((doc) => (
            <Grid item xs={12} sm={6} md={4} key={doc.href}>
              <Paper
                component="a"
                href={doc.href}
                variant="outlined"
                sx={{
                  display: 'block',
                  height: '100%',
                  p: 2.5,
                  borderRadius: '8px',
                  textDecoration: 'none',
                  '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <MenuBookRoundedIcon color="primary" />
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
  );
}

function FinalCta() {
  return (
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
                Run your first governed agent today
              </Typography>
            </Stack>
            <Typography color="text.secondary">
              Sign in with GitHub, connect a repository, and dispatch your first task — with the
              spec gate, TDD enforcement, and live observability on from the very first run. Stokd
              Cloud is in alpha; early adopters shape the roadmap.
            </Typography>
          </div>
          <Button href={STOKD_CLOUD_APP_URL} variant="contained" size="large">
            Get started
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}

/**
 * The full Stokd Cloud sales pitch, header/footer-free so it can be embedded
 * and rendered standalone (including in tests).
 */
export default function StokdCloudPitch() {
  return (
    <React.Fragment>
      <Hero />
      <Pillars />
      <Comparison />
      <Features />
      <Trust />
      <Pricing />
      <DocsLinks />
      <Divider />
      <FinalCta />
    </React.Fragment>
  );
}
