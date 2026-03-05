import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import Head from 'docs/src/modules/components/Head';
import AppFooter from 'docs/src/layouts/AppFooter';
import AppHeader from 'docs/src/layouts/AppHeader';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GitHubIcon from '@mui/icons-material/GitHub';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import TerminalIcon from '@mui/icons-material/Terminal';
import ShieldIcon from '@mui/icons-material/Shield';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LayersIcon from '@mui/icons-material/Layers';
import BoltIcon from '@mui/icons-material/Bolt';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import BugReportIcon from '@mui/icons-material/BugReport';
import StorageIcon from '@mui/icons-material/Storage';
import DnsIcon from '@mui/icons-material/Dns';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MemoryIcon from '@mui/icons-material/Memory';
import ForkRightIcon from '@mui/icons-material/ForkRight';
import WarningIcon from '@mui/icons-material/Warning';
import CodeIcon from '@mui/icons-material/Code';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import FilterListIcon from '@mui/icons-material/FilterList';
import TimelineIcon from '@mui/icons-material/Timeline';
import SearchIcon from '@mui/icons-material/Search';
import DescriptionIcon from '@mui/icons-material/Description';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CancelIcon from '@mui/icons-material/Cancel';
import ArticleIcon from '@mui/icons-material/Article';
import Tooltip from '@mui/material/Tooltip';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SyncIcon from '@mui/icons-material/Sync';
import type { SxProps, Theme } from '@mui/material/styles';

// ─── Color Palette ───────────────────────────────────────────────────────────
const colors = {
  bg: '#0B1120',
  surface: 'rgba(15, 23, 42, 0.5)',
  surfaceSolid: '#0f172a',
  border: 'rgba(30, 41, 59, 0.5)',
  borderLight: '#334155',
  text: '#e2e8f0',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  teal: '#14b8a6',
  tealLight: '#2dd4bf',
  sky: '#0ea5e9',
  skyLight: '#38bdf8',
  blue: '#3b82f6',
  purple: '#a855f7',
  amber: '#f59e0b',
  red: '#ef4444',
  green: '#22c55e',
};

// ─── Reusable Components ─────────────────────────────────────────────────────
const gradientMap: Record<string, string> = {
  a: 'linear-gradient(to bottom, #0B1120, #02060e)',
  b: 'linear-gradient(to bottom, #02060e, #0B1120)',
  c: '#02060e',
  d: '#0B1120',
};

function SectionBlock({ children, sx, id, gradient }: { children: React.ReactNode; sx?: SxProps<Theme>; id?: string; gradient?: 'a' | 'b' | 'c' | 'd' }) {
  const bg = gradient ? gradientMap[gradient]  : undefined;
  return (
    <Box id={id} sx={{ py: { xs: 8, md: 12 }, px: { xs: 2, md: 3 }, position: 'relative', borderBottom: `1px solid ${colors.border}`, ...(bg ? { background: bg } : {}), ...sx }}>
      <Container maxWidth="lg">{children}</Container>
    </Box>
  );
}

function CardBlock({ children, sx }: { children: React.ReactNode; sx?: SxProps<Theme> }) {
  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 3,
        p: 3,
        transition: 'border-color 0.2s',
        '&:hover': { borderColor: colors.borderLight },
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}

function SectionNumber({ num }: { num: string }) {
  return (
    <Typography sx={{ fontSize: '4rem', fontWeight: 700, color: 'rgba(30,41,59,0.5)', position: 'absolute', top: -16, left: -12, zIndex: 0, userSelect: 'none', lineHeight: 1 }}>
      {num}
    </Typography>
  );
}

function MonoChip({ label, color, bgAlpha = 0.1, borderAlpha = 0.2 }: { label: string; color: string; bgAlpha?: number; borderAlpha?: number }) {
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        fontFamily: 'monospace',
        fontSize: '0.7rem',
        bgcolor: `${color}${Math.round(bgAlpha * 255).toString(16).padStart(2, '0')}`,
        color,
        border: `1px solid ${color}${Math.round(borderAlpha * 255).toString(16).padStart(2, '0')}`,
        borderRadius: '999px',
      }}
    />
  );
}

function BulletItem({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
      <Typography variant="body2" sx={{ color: colors.textMuted }}>{children}</Typography>
    </Box>
  );
}

// ─── Title Section ───────────────────────────────────────────────────────────
function TitleSection() {
  return (
    <SectionBlock id="title" sx={{ textAlign: 'center', minHeight: '80vh', display: 'flex', alignItems: 'center', background: '#fff1' }}>
      <div>
        <Chip label="CONSULTING DELIVERABLES REVIEW" size="small" sx={{ mb: 4, fontFamily: 'monospace', fontSize: '0.75rem', bgcolor: 'rgba(30,41,59,0.5)', color: colors.skyLight, border: `1px solid ${colors.borderLight}` }} />
        <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1, mb: 3 }}>
          XFERALL Platform <br />
          <Box component="span" sx={{ background: `linear-gradient(90deg, ${colors.skyLight}, ${colors.tealLight})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Engineering Deliverables
          </Box>
        </Typography>
        <Typography variant="h5" sx={{ color: colors.textMuted, fontWeight: 300, maxWidth: 700, mx: 'auto', mb: 6 }}>
          Infrastructure, Developer Experience & Analytics Platform
        </Typography>
        <Box sx={{ width: 64, height: 4, background: `linear-gradient(90deg, ${colors.sky}, ${colors.teal})`, borderRadius: 2, mx: 'auto', mb: 3 }} />
        <Typography variant="body2" sx={{ fontFamily: 'monospace', color: colors.textDim }}>MARCH 2026</Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', color: colors.textMuted }}>BRIAN STOKER</Typography>
      </div>
    </SectionBlock>
  );
}

// ─── Overview Section ────────────────────────────────────────────────────────
const deliverables = [
  { title: 'Directory Constants', desc: 'Code cleanup, bug fix', status: 'Complete', icon: <CheckCircleIcon />, color: colors.teal, sectionId: 'directory-constants' },
  { title: 'Environment Bootstrap', desc: 'Dev onboarding automation', status: 'Complete', icon: <CheckCircleIcon />, color: colors.teal, sectionId: 'environment-bootstrap' },
  { title: 'Db Seed / Initialization', desc: 'Auto db seed and initialization on first run', status: 'Complete', icon: <CheckCircleIcon />, color: colors.teal, sectionId: 'db-seed' },
  { title: 'Dev Onboarding', desc: 'Initial hires immediately onboarded with git and aws access', status: 'Complete', icon: <CheckCircleIcon />, color: colors.teal, sectionId: 'dev-onboarding' },
  { title: 'Dev Workflow', desc: 'Unified dev commands + TUI', status: 'Complete (PR #2159)', icon: <CheckCircleIcon />, color: colors.teal, sectionId: 'dev-workflow' },
  { title: 'Generator Service', desc: 'Capture and simulate real world environments based on their database metadata', status: 'Complete', icon: <CheckCircleIcon />, color: colors.teal, sectionId: 'generator-service' },
  { title: 'Redshift Platform', desc: 'Dual-database analytics', status: 'In Progress', icon: <CheckCircleIcon />, color: colors.teal, sectionId: 'redshift-platform' },
];

const branches = ['main', 'fix/consolidate-directory-constants', 'feature/env-bootstrap', 'feature/dev-workflow', 'feature/redshift'];

function OverviewSection() {
  return (
    <SectionBlock id="overview" gradient="a">
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', mb: 1 }}>Executive Overview</Typography>
      <Typography sx={{ color: colors.textMuted, mb: 4 }}>High-level status of key engineering initiatives</Typography>

      <Grid container spacing={3} sx={{ mb: 8 }}>
        {deliverables.map((item, i) => (
          <Grid item xs={12} md={6} key={i}>
            <Box
              component="a"
              href={`#${item.sectionId}`}
              sx={{ textDecoration: 'none', display: 'block', cursor: 'pointer' }}
            >
              <CardBlock sx={{ justifyContent: 'space-between', display: 'flex', flexDirection: 'row', gap: 1, '&:hover': { borderColor: item.color, boxShadow: `0 0 20px ${item.color}1a` } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${item.color}1a`,  height: '24px', color: item.color, display: 'flex' }}>{item.icon}</Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, px: 1 }}>
                     <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 0.5 }}>{item.title}</Typography>
                     <Typography variant="body2" sx={{ color: colors.textMuted }}>{item.desc}</Typography>
                  </Box>
                </Box>
                <MonoChip label={item.status} color={item.color} />
              </CardBlock>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ borderColor: colors.border, mb: 4 }} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, color: colors.textMuted }}>
        <GitHubIcon sx={{ fontSize: 20 }} />
        <Typography variant="caption" sx={{ fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 2 }}>Branch Timeline</Typography>
      </Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" sx={{ flexWrap: 'wrap' }}>
        {branches.map((branch, i) => (
          <React.Fragment key={i}>
            <Stack alignItems="center" spacing={1}>
              <Box sx={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid', borderColor: i === 0 ? colors.sky : colors.textDim, bgcolor: i === 0 ? colors.sky : colors.bg, boxShadow: `0 0 0 4px ${colors.bg}` }} />
              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: colors.textDim, bgcolor: colors.surfaceSolid, px: 1, py: 0.5, borderRadius: 1, border: `1px solid ${colors.border}` }}>{branch}</Typography>
            </Stack>
            {i < branches.length - 1 && <ArrowForwardIcon sx={{ color: colors.textDim, display: { xs: 'none', md: 'block' } }} />}
          </React.Fragment>
        ))}
      </Stack>
    </SectionBlock>
  );
}

// ─── Directory Constants Section ─────────────────────────────────────────────
function DirectoryConstantsSection() {
  return (
    <SectionBlock id="directory-constants" gradient="c">
      <Grid container spacing={6}>
        <Grid item xs={12} lg={4}>
          <Box sx={{ position: 'relative' }}>
            <SectionNumber num="01" />
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', mb: 3, position: 'relative', zIndex: 1 }}>Directory Constants</Typography>

            <CardBlock sx={{ bgcolor: `${colors.red}0d`, borderColor: `${colors.red}1a`, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <DeleteIcon sx={{ fontSize: 16, color: colors.red }} />
                <Typography sx={{ color: colors.red, fontWeight: 600, fontSize: '0.9rem' }}>Problem</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: colors.textMuted, lineHeight: 1.7 }}>
                3 environment variables duplicated across 4 files in API and Worker services. Inconsistent paths led to temp directory bugs in production.
              </Typography>
            </CardBlock>

            <CardBlock sx={{ bgcolor: `${colors.teal}0d`, borderColor: `${colors.teal}1a` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckIcon sx={{ fontSize: 16, color: colors.teal }} />
                <Typography sx={{ color: colors.teal, fontWeight: 600, fontSize: '0.9rem' }}>Solution</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: colors.textMuted, lineHeight: 1.7 }}>
                Consolidated all path logic to{' '}
                <Box component="code" sx={{ color: colors.tealLight, bgcolor: `${colors.teal}1a`, px: 0.5, borderRadius: 0.5 }}>@xferall/core</Box>.
                Single source of truth for all file system operations.
              </Typography>
            </CardBlock>
          </Box>
        </Grid>

        <Grid item xs={12} lg={8}>
          <CardBlock sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
              <Typography sx={{ color: '#fff', fontWeight: 500 }}>Impact Analysis</Typography>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: colors.textDim }}>PR #2148</Typography>
            </Box>
            <Grid container spacing={3}>
              {[
                { value: '18', label: 'Files Changed', color: '#fff' },
                { value: '-48', label: 'Net Lines Removed', color: colors.teal },
                { value: '0', label: 'Regressions', color: colors.sky },
              ].map((stat, i) => (
                <Grid item xs={4} key={i}>
                  <Box sx={{ p: 2, bgcolor: 'rgba(30,41,59,0.5)', borderRadius: 2, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: stat.color, mb: 0.5 }}>{stat.value}</Typography>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: colors.textMuted }}>{stat.label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardBlock>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <Box sx={{ p: 3, border: `1px solid ${colors.border}`, borderRadius: 3, bgcolor: colors.surface, textAlign: 'center', height: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: `${colors.red}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, color: colors.red }}>
                  <InsertDriveFileIcon />
                </Box>
                {['/api/utils/paths.ts', '/worker/config/dirs.ts', '/shared/constants.ts'].map((f, i) => (
                  <Typography key={i} variant="body2" sx={{ color: colors.textDim, textDecoration: 'line-through' }}>{f}</Typography>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={2} sx={{ textAlign: 'center' }}>
              <ArrowForwardIcon sx={{ color: colors.textDim, fontSize: 32 }} />
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ p: 3, border: `1px solid ${colors.teal}4d`, borderRadius: 3, bgcolor: `${colors.teal}0d`, textAlign: 'center', height: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: `${colors.teal}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, color: colors.teal }}>
                  <InsertDriveFileIcon />
                </Box>
                <Typography sx={{ fontFamily: 'monospace', color: '#fff', fontSize: '.6rem' }}> PUBLIC_DIR, STATIC_DIR, and TEMP_DIR</Typography>
                <Typography sx={{ fontFamily: 'monospace', color: '#fff', fontSize: '1.1rem' }}>@xferall/core</Typography>
                <Typography variant="caption" sx={{ color: `${colors.teal}b3` }}>Single Source of Truth</Typography>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </SectionBlock>
  );
}

// ─── Environment Bootstrap Section ───────────────────────────────────────────
function EnvironmentBootstrapSection() {
  const steps = [
    { label: 'Clone Repo', icon: 'git clone', highlight: false },
    { label: 'Install Deps', icon: 'yarn', highlight: false },
    { label: 'Bootstrap', icon: 'yarn bootstrap:env', highlight: true },
    { label: 'Build', icon: 'yarn build', highlight: false },
  ];

  return (
    <SectionBlock id="environment-bootstrap" gradient="b">
      <Box sx={{ textAlign: 'center', mb: 6, position: 'relative' }}>
        <Typography sx={{ fontSize: '4rem', fontWeight: 700, color: 'rgba(30,41,59,0.3)', position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', zIndex: 0 }}>02</Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', mb: 2, position: 'relative' }}>Environment Bootstrap</Typography>
        <Typography sx={{ color: colors.textMuted, maxWidth: 600, mx: 'auto' }}>
          Automated secret management and environment configuration. Reduced onboarding time from hours to minutes.
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={6}>
          <CardBlock sx={{ bgcolor: `${colors.red}0d`, borderColor: `${colors.red}1a` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <ShieldIcon sx={{ color: colors.red }} />
              <Typography sx={{ color: colors.red, fontWeight: 600 }}>The Old Way</Typography>
            </Box>
            {['7+ different .env files to manage manually', 'Secrets shared insecurely via Slack/Notes', 'No validation or synchronization'].map((item, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Typography sx={{ color: colors.red }}>×</Typography>
                <Typography variant="body2" sx={{ color: colors.textMuted }}>{item}</Typography>
              </Box>
            ))}
          </CardBlock>
        </Grid>
        <Grid item xs={12} md={6}>
          <CardBlock sx={{ bgcolor: `${colors.teal}0d`, borderColor: `${colors.teal}1a` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TerminalIcon sx={{ color: colors.teal }} />
              <Typography sx={{ color: colors.teal, fontWeight: 600 }}>The New Way</Typography>
            </Box>
            {[
              'AWS SSM Parameter Store integration',
              <>Single script <Box component="code" sx={{ bgcolor: colors.surfaceSolid, px: 0.5, borderRadius: 0.5, fontSize: '0.75rem' }}>bootstrap-env.sh</Box></>,
              'Auto-populates all service .env files',
            ].map((item, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Typography sx={{ color: colors.teal }}>✓</Typography>
                <Typography variant="body2" sx={{ color: colors.text }}>{item}</Typography>
              </Box>
            ))}
          </CardBlock>
        </Grid>
      </Grid>

      <CardBlock sx={{ position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: 16, right: 16, opacity: 0.15 }}>
          <AccessTimeIcon sx={{ fontSize: 96, color: colors.teal }} />
        </Box>
        <Typography sx={{ color: '#fff', fontWeight: 500, mb: 4 }}>New Developer Flow</Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="space-between" sx={{ position: 'relative', zIndex: 1 }}>
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <Stack alignItems="center" sx={{ transform: step.highlight ? 'scale(1.1)' : 'none' }}>
                <Box sx={{
                  height: 48, px: 2, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: '0.85rem', border: '1px solid', mb: 1, whiteSpace: 'nowrap',
                  ...(step.highlight
                    ? { bgcolor: `${colors.teal}33`, borderColor: colors.teal, color: colors.tealLight, boxShadow: `0 0 15px ${colors.teal}4d` }
                    : { bgcolor: 'rgba(30,41,59,0.5)', borderColor: colors.borderLight, color: colors.textMuted }),
                }}>
                  {step.icon}
                </Box>
                <Typography variant="caption" sx={{ color: step.highlight ? colors.teal : colors.textDim, fontWeight: step.highlight ? 700 : 400 }}>{step.label}</Typography>
              </Stack>
              {i < steps.length - 1 && <ArrowForwardIcon sx={{ color: colors.textDim, display: { xs: 'none', md: 'block' } }} />}
            </React.Fragment>
          ))}
        </Stack>
        <Divider sx={{ borderColor: colors.border, my: 3 }} />
        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
          {['--workspace', '--force', '--dry-run'].map((flag, i) => (
            <Chip key={i} label={flag} size="small" sx={{ fontFamily: 'monospace', fontSize: '0.7rem', bgcolor: 'rgba(30,41,59,0.5)', color: colors.textMuted, border: `1px solid ${colors.borderLight}` }} />
          ))}
          <Typography variant="caption" sx={{ color: colors.textDim, display: 'flex', alignItems: 'center', ml: 1 }}>514 lines of Bash automation</Typography>
        </Stack>
      </CardBlock>
    </SectionBlock>
  );
}

// ─── Db Seed / Initialization Section ────────────────────────────────────────
function DbSeedSection() {
  return (
    <SectionBlock id="db-seed" gradient="d">
      <Grid container spacing={6}>
        <Grid item xs={12} lg={4}>
          <Box sx={{ position: 'relative' }}>
            <SectionNumber num="03" />
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', mb: 3, position: 'relative', zIndex: 1 }}>Db Seed / Initialization</Typography>

            <CardBlock sx={{ bgcolor: `${colors.red}0d`, borderColor: `${colors.red}1a`, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <DeleteIcon sx={{ fontSize: 16, color: colors.red }} />
                <Typography sx={{ color: colors.red, fontWeight: 600, fontSize: '0.9rem' }}>Problem</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: colors.textMuted, lineHeight: 1.7 }}>
                New developers had no local data after setup. Seeding was manual, inconsistent, and often broke foreign key constraints.
              </Typography>
            </CardBlock>

            <CardBlock sx={{ bgcolor: `${colors.teal}0d`, borderColor: `${colors.teal}1a` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckIcon sx={{ fontSize: 16, color: colors.teal }} />
                <Typography sx={{ color: colors.teal, fontWeight: 600, fontSize: '0.9rem' }}>Solution</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: colors.textMuted, lineHeight: 1.7 }}>
                Automated seed script that detects empty databases on first run, populates reference data, and creates consistent development datasets.
              </Typography>
            </CardBlock>
          </Box>
        </Grid>

        <Grid item xs={12} lg={8}>
          <CardBlock sx={{ mb: 3 }}>
            <Typography sx={{ color: '#fff', fontWeight: 500, mb: 4 }}>Initialization Pipeline</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
              {[
                { label: 'Detect Empty DB', icon: <StorageIcon />, color: colors.sky },
                { label: 'Run Migrations', icon: <SyncIcon />, color: colors.blue },
                { label: 'Seed Reference Data', icon: <LayersIcon />, color: colors.purple },
                { label: 'Generate Test Data', icon: <RocketLaunchIcon />, color: colors.teal },
              ].map((step, i) => (
                <React.Fragment key={i}>
                  <Stack alignItems="center" spacing={1}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${step.color}1a`, border: `1px solid ${step.color}4d`, color: step.color, display: 'flex' }}>{step.icon}</Box>
                    <Typography variant="caption" sx={{ color: colors.textMuted, textAlign: 'center', maxWidth: 100 }}>{step.label}</Typography>
                  </Stack>
                  {i < 3 && <ArrowForwardIcon sx={{ color: colors.textDim, display: { xs: 'none', md: 'block' } }} />}
                </React.Fragment>
              ))}
            </Stack>
          </CardBlock>

          <Grid container spacing={2}>
            {[
              { value: 'Auto', label: 'First-run Detection', color: colors.teal },
              { value: 'FK-safe', label: 'Constraint Ordering', color: colors.sky },
              { value: 'Idempotent', label: 'Re-runnable Seeds', color: colors.purple },
            ].map((stat, i) => (
              <Grid item xs={4} key={i}>
                <Box sx={{ p: 2, bgcolor: 'rgba(30,41,59,0.5)', borderRadius: 2, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: stat.color, mb: 0.5 }}>{stat.value}</Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: colors.textMuted }}>{stat.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </SectionBlock>
  );
}

// ─── Dev Onboarding Section ──────────────────────────────────────────────────
function DevOnboardingSection() {
  return (
    <SectionBlock id="dev-onboarding" gradient="a">
      <Box sx={{ textAlign: 'center', mb: 6, position: 'relative' }}>
        <Typography sx={{ fontSize: '4rem', fontWeight: 700, color: 'rgba(30,41,59,0.3)', position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', zIndex: 0 }}>04</Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', mb: 2, position: 'relative' }}>Dev Onboarding</Typography>
        <Typography sx={{ color: colors.textMuted, maxWidth: 600, mx: 'auto' }}>
          New hires get Git and AWS access automatically. From zero to productive in under an hour.
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={6}>
          <CardBlock sx={{ bgcolor: `${colors.red}0d`, borderColor: `${colors.red}1a` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AccessTimeIcon sx={{ color: colors.red }} />
              <Typography sx={{ color: colors.red, fontWeight: 600 }}>Before</Typography>
            </Box>
            {['Multi-day manual setup process', 'IT tickets for each access request', 'Inconsistent environment configurations'].map((item, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Typography sx={{ color: colors.red }}>×</Typography>
                <Typography variant="body2" sx={{ color: colors.textMuted }}>{item}</Typography>
              </Box>
            ))}
          </CardBlock>
        </Grid>
        <Grid item xs={12} md={6}>
          <CardBlock sx={{ bgcolor: `${colors.teal}0d`, borderColor: `${colors.teal}1a` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <GroupAddIcon sx={{ color: colors.teal }} />
              <Typography sx={{ color: colors.teal, fontWeight: 600 }}>After</Typography>
            </Box>
            {[
              'Automated IAM role provisioning',
              'Git repo access via team membership',
              'Pre-configured dev environment on first boot',
            ].map((item, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Typography sx={{ color: colors.teal }}>✓</Typography>
                <Typography variant="body2" sx={{ color: colors.text }}>{item}</Typography>
              </Box>
            ))}
          </CardBlock>
        </Grid>
      </Grid>

      <CardBlock>
        <Typography sx={{ color: '#fff', fontWeight: 500, mb: 3 }}>Onboarding Flow</Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          {[
            { label: 'Add to GitHub Team', icon: <GitHubIcon />, time: 'Instant' },
            { label: 'AWS SSO Access', icon: <VpnKeyIcon />, time: '< 5 min' },
            { label: 'Bootstrap Environment', icon: <TerminalIcon />, time: '< 10 min' },
            { label: 'First Build & Run', icon: <RocketLaunchIcon />, time: '< 30 min' },
          ].map((step, i) => (
            <React.Fragment key={i}>
              <Stack alignItems="center" spacing={1}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(30,41,59,0.5)', border: `1px solid ${colors.borderLight}`, color: colors.textMuted, display: 'flex' }}>{step.icon}</Box>
                <Typography variant="caption" sx={{ color: colors.text, fontWeight: 500, textAlign: 'center' }}>{step.label}</Typography>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: colors.teal, fontSize: '0.65rem' }}>{step.time}</Typography>
              </Stack>
              {i < 3 && <ArrowForwardIcon sx={{ color: colors.textDim, display: { xs: 'none', md: 'block' } }} />}
            </React.Fragment>
          ))}
        </Stack>
      </CardBlock>
    </SectionBlock>
  );
}

// ─── Developer Workflow Section ──────────────────────────────────────────────
function DeveloperWorkflowSection() {
  return (
    <SectionBlock id="dev-workflow" gradient="b">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 6, flexWrap: 'wrap', gap: 2, position: 'relative' }}>
        <Box sx={{ position: 'relative' }}>
          <SectionNumber num="05" />
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', mb: 1, position: 'relative', zIndex: 1 }}>Developer Workflow</Typography>
          <Typography sx={{ color: colors.textMuted }}>Unified command structure with Turbo TUI</Typography>
        </Box>
        <Tooltip
          arrow
          placement="bottom-end"
          componentsProps={{
            tooltip: {
              sx: {
                bgcolor: colors.surfaceSolid,
                border: `1px solid ${colors.amber}33`,
                borderRadius: 2,
                p: 2.5,
                maxWidth: 480,
                '& .MuiTooltip-arrow': { color: colors.surfaceSolid },
              },
            },
          }}
          title={
            <Box>
              <Typography sx={{ color: colors.amber, fontWeight: 700, mb: 1.5, fontSize: '0.9rem' }}>Email Package Build-Time Env Inlining Bug</Typography>
              <Typography variant="body2" sx={{ color: colors.textMuted, mb: 1.5 }}>
                The email package&apos;s <Box component="code" sx={{ color: colors.amber, bgcolor: `${colors.amber}1a`, px: 0.5, borderRadius: 0.5 }}>tsup.config.ts</Box> had:
              </Typography>
              <Box sx={{ bgcolor: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 1, p: 1.5, fontFamily: 'monospace', fontSize: '0.75rem', color: colors.textDim, mb: 1.5, whiteSpace: 'pre-wrap' }}>
                {`env: dotenv.config().parsed`}
                <Box component="span" sx={{ color: colors.textDim, fontStyle: 'italic' }}>{`  // inlined at BUILD time`}</Box>
              </Box>
              <Typography variant="body2" sx={{ color: colors.textMuted, mb: 1.5 }}>
                This baked <Box component="code" sx={{ color: colors.text, bgcolor: `${colors.border}`, px: 0.5, borderRadius: 0.5, fontSize: '0.75rem' }}>AWS_REGION</Box> and <Box component="code" sx={{ color: colors.text, bgcolor: `${colors.border}`, px: 0.5, borderRadius: 0.5, fontSize: '0.75rem' }}>AWS_SES_CONFIG_SET_NAME_EXEC_DASH</Box> into compiled JS during <Box component="code" sx={{ color: colors.text, bgcolor: `${colors.border}`, px: 0.5, borderRadius: 0.5, fontSize: '0.75rem' }}>yarn build</Box>. Runtime env changes were ignored.
              </Typography>
              <Typography variant="body2" sx={{ color: colors.teal, fontWeight: 600, mb: 1 }}>The fix (across multiple commits):</Typography>
              <Box component="ol" sx={{ pl: 2, m: 0, '& li': { color: colors.text, fontSize: '0.8rem', mb: 0.5 } }}>
                <li>Removed <code>env: dotenv.config().parsed</code> from tsup.config.ts</li>
                <li>Added sensible defaults in <code>packages/email/src/constants/index.ts</code></li>
                <li>Fixed .env path resolution for monorepo workspace execution</li>
              </Box>
              <Typography variant="body2" sx={{ color: colors.green, mt: 1.5, fontStyle: 'italic', fontSize: '0.8rem' }}>
                Email package now builds cleanly without .env and reads env vars at runtime.
              </Typography>
            </Box>
          }
        >
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5, px: 2, py: 1, bgcolor: `${colors.amber}1a`, border: `1px solid ${colors.amber}33`, borderRadius: 2, cursor: 'pointer', '&:hover': { borderColor: `${colors.amber}66` } }}>
            <BugReportIcon sx={{ color: colors.amber }} />
            <Box>
              <Typography variant="body2" sx={{ color: colors.amber, fontWeight: 500 }}>Bug Fixed</Typography>
              <Typography variant="caption" sx={{ color: `${colors.amber}b3` }}>Email package build-time env inlining</Typography>
            </Box>
          </Box>
        </Tooltip>
      </Box>

      <Grid container spacing={4} sx={{ mb: 6 }}>
        {/* yarn dev */}
        <Grid item xs={12} md={6}>
          <CardBlock sx={{ borderColor: `${colors.sky}4d`, background: `linear-gradient(to bottom, ${colors.sky}0d, ${colors.surface})` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LayersIcon sx={{ color: colors.sky }} />
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>yarn dev</Typography>
              </Box>
              <Chip label="FULL STACK" size="small" sx={{ fontFamily: 'monospace', fontSize: '0.7rem', bgcolor: `${colors.sky}33`, color: colors.skyLight }} />
            </Box>
            {['UI + Dashboard + Portal', 'API Services', 'Worker Processes'].map((item, i) => (
              <Box key={i} sx={{ p: 1.5, bgcolor: 'rgba(15,23,42,0.8)', borderRadius: 1, border: `1px solid ${colors.border}`, mb: 1, fontFamily: 'monospace', fontSize: '0.85rem', color: colors.text }}>{item}</Box>
            ))}
            <Typography variant="body2" sx={{ color: colors.textMuted, mt: 2 }}>
              Complete environment running in Turbo TUI. Best for integration testing and full feature development.
            </Typography>
          </CardBlock>
        </Grid>

        {/* yarn dev:slim */}
        <Grid item xs={12} md={6}>
          <CardBlock sx={{ borderColor: `${colors.teal}4d`, background: `linear-gradient(to bottom, ${colors.teal}0d, ${colors.surface})` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BoltIcon sx={{ color: colors.teal }} />
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>yarn dev:slim</Typography>
              </Box>
              <Chip label="LIGHTWEIGHT" size="small" sx={{ fontFamily: 'monospace', fontSize: '0.7rem', bgcolor: `${colors.teal}33`, color: colors.tealLight }} />
            </Box>
            <Box sx={{ p: 1.5, bgcolor: 'rgba(15,23,42,0.8)', borderRadius: 1, border: `1px solid ${colors.border}`, mb: 1, fontFamily: 'monospace', fontSize: '0.85rem', color: colors.text }}>UI Application</Box>
            <Box sx={{ p: 1.5, bgcolor: 'rgba(15,23,42,0.8)', borderRadius: 1, border: `1px solid ${colors.border}`, mb: 1, fontFamily: 'monospace', fontSize: '0.85rem', color: colors.text, display: 'flex', justifyContent: 'space-between' }}>
              API Services <Typography component="span" variant="caption" sx={{ color: colors.textDim, fontStyle: 'italic' }}>Inline Worker</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 1, border: `1px dashed ${colors.border}`, mb: 1, fontFamily: 'monospace', fontSize: '0.85rem', color: colors.textDim, fontStyle: 'italic' }}>No external workers</Box>
            <Typography variant="body2" sx={{ color: colors.textMuted, mt: 2 }}>
              Rapid iteration mode. Reduced memory footprint and faster HMR for frontend-focused tasks.
            </Typography>
          </CardBlock>
        </Grid>

        {/* yarn dev:full */}
        <Grid item xs={12} md={6}>
          <CardBlock sx={{ borderColor: `${colors.purple}4d`, background: `linear-gradient(to bottom, ${colors.purple}0d, ${colors.surface})` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VisibilityIcon sx={{ color: colors.purple }} />
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>yarn dev:full</Typography>
              </Box>
              <Chip label="FULL STACK + OBSERVABILITY" size="small" sx={{ fontFamily: 'monospace', fontSize: '0.65rem', bgcolor: `${colors.purple}33`, color: `${colors.purple}ee` }} />
            </Box>
            {['UI + Dashboard + Portal', 'API Services', 'Worker Processes', 'Observability Stack (Grafana, Prometheus, Loki, Tempo)'].map((item, i) => (
              <Box key={i} sx={{ p: 1.5, bgcolor: 'rgba(15,23,42,0.8)', borderRadius: 1, border: `1px solid ${i === 3 ? `${colors.purple}33` : colors.border}`, mb: 1, fontFamily: 'monospace', fontSize: '0.85rem', color: i === 3 ? `${colors.purple}ee` : colors.text }}>{item}</Box>
            ))}
            <Typography variant="body2" sx={{ color: colors.textMuted, mt: 2 }}>
              Everything in yarn dev plus the full monitoring stack via Docker Compose. Cleanup on exit tears down observability containers. Best for end-to-end development with metrics, tracing, and log aggregation.
            </Typography>
          </CardBlock>
        </Grid>

        {/* yarn dev:redshift */}
        <Grid item xs={12} md={6}>
          <CardBlock sx={{ borderColor: `${colors.amber}4d`, background: `linear-gradient(to bottom, ${colors.amber}0d, ${colors.surface})` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CompareArrowsIcon sx={{ color: colors.amber }} />
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>yarn dev:redshift</Typography>
              </Box>
              <Chip label="COMPARISON" size="small" sx={{ fontFamily: 'monospace', fontSize: '0.7rem', bgcolor: `${colors.amber}33`, color: colors.amber }} />
            </Box>
            {['Dual API Instances (PostgreSQL :3000 + Redshift :3010)', 'Dashboard with /compare view', 'Observability Stack'].map((item, i) => (
              <Box key={i} sx={{ p: 1.5, bgcolor: 'rgba(15,23,42,0.8)', borderRadius: 1, border: `1px solid ${colors.border}`, mb: 1, fontFamily: 'monospace', fontSize: '0.85rem', color: colors.text }}>{item}</Box>
            ))}
            <Typography variant="body2" sx={{ color: colors.textMuted, mt: 2 }}>
              Side-by-side PostgreSQL vs Redshift comparison mode. Dashboard highlights mismatches with numeric tolerance. Optional <Box component="code" sx={{ color: colors.amber, bgcolor: `${colors.amber}1a`, px: 0.5, borderRadius: 0.5, fontSize: '0.8rem' }}>--simulate</Box> flag starts the test data generator.
            </Typography>
          </CardBlock>
        </Grid>
      </Grid>

      <Divider sx={{ borderColor: colors.border, mb: 3 }} />
      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: colors.textDim, textTransform: 'uppercase', letterSpacing: 2, mb: 2, display: 'block' }}>Pre-flight Automation</Typography>
      <Grid container spacing={2}>
        {['Env Bootstrap', 'Docker Auto-start', 'Port Cleanup', 'DB Validation', 'Dev Onboarding', 'Auth0 Dev Account Creation', 'Database Initialization'].map((item, i) => (
          <Grid item xs={6} md={3} key={i}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: colors.text }}>
              <CheckBoxIcon sx={{ fontSize: 18, color: colors.teal }} />
              <Typography variant="body2">{item}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </SectionBlock>
  );
}

// ─── Generator Service Section ───────────────────────────────────────────────
function GeneratorServiceSection() {
  return (
    <SectionBlock id="generator-service" gradient="a">
      <Grid container spacing={6}>
        <Grid item xs={12} lg={5}>
          <Box sx={{ position: 'relative' }}>
            <SectionNumber num="06" />
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', mb: 3, position: 'relative', zIndex: 1 }}>Generator Service</Typography>
            <Typography sx={{ color: colors.textMuted, mb: 4 }}>
              Captures and simulates real-world environments by generating realistic data from database metadata and production patterns.
            </Typography>

            <CardBlock sx={{ bgcolor: `${colors.teal}0d`, borderColor: `${colors.teal}1a`, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <MemoryIcon sx={{ color: colors.teal }} />
                <Typography sx={{ color: colors.teal, fontWeight: 600 }}>Capabilities</Typography>
              </Box>
              {[
                'Introspects DB schema for realistic field generation',
                'Simulates multi-hospital traffic patterns',
                'Configurable volume, date ranges, and entity types',
                'Supports full lifecycle workflows (Admit → Transfer → Discharge)',
              ].map((item, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Typography sx={{ color: colors.teal }}>✓</Typography>
                  <Typography variant="body2" sx={{ color: colors.text }}>{item}</Typography>
                </Box>
              ))}
            </CardBlock>
          </Box>
        </Grid>

        <Grid item xs={12} lg={7}>
          <CardBlock sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: colors.textDim, textTransform: 'uppercase', letterSpacing: 2, display: 'block', textAlign: 'center', mb: 4 }}>Generation Pipeline</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="center">
              {[
                { label: 'Schema Introspection', icon: <StorageIcon />, color: colors.blue },
                { label: 'Pattern Analysis', icon: <TimelineIcon />, color: colors.purple },
                { label: 'Data Generation', icon: <SettingsIcon />, color: colors.teal },
                { label: 'Validation', icon: <CheckBoxIcon />, color: colors.green },
              ].map((step, i) => (
                <React.Fragment key={i}>
                  <Stack alignItems="center" spacing={1}>
                    <Box sx={{ p: 2, bgcolor: `${step.color}1a`, border: `1px solid ${step.color}4d`, borderRadius: 2, color: step.color, display: 'flex' }}>{step.icon}</Box>
                    <Typography variant="caption" sx={{ color: colors.textMuted, textAlign: 'center', maxWidth: 100 }}>{step.label}</Typography>
                  </Stack>
                  {i < 3 && <ArrowForwardIcon sx={{ color: colors.textDim, display: { xs: 'none', md: 'block' } }} />}
                </React.Fragment>
              ))}
            </Stack>
          </CardBlock>

          <Grid container spacing={2}>
            {[
              { icon: <PlayArrowIcon />, title: 'Simulate', desc: 'Continuous multi-hospital traffic', color: colors.teal, active: true },
              { icon: <CalendarTodayIcon />, title: 'Historical', desc: 'Backfill date ranges', color: colors.sky },
              { icon: <PeopleIcon />, title: 'Single', desc: 'CI/CD validation', color: colors.purple },
              { icon: <CancelIcon />, title: 'Decline', desc: 'Workflow testing', color: colors.amber },
            ].map((item, i) => (
              <Grid item xs={6} key={i}>
                <CardBlock sx={item.active ? { bgcolor: `${colors.teal}0d`, borderColor: `${colors.teal}33` } : {}}>
                  <Box sx={{ color: item.color, mb: 1.5 }}>{item.icon}</Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff' }}>{item.title}</Typography>
                  <Typography variant="caption" sx={{ color: item.active ? colors.textMuted : colors.textDim }}>{item.desc}</Typography>
                </CardBlock>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </SectionBlock>
  );
}

// ─── Redshift Platform Section ───────────────────────────────────────────────
function RedshiftPlatformSection() {
  return (
    <SectionBlock id="redshift-platform" gradient="b">
      <Grid container spacing={6}>
        <Grid item xs={12} lg={7}>
          <Box sx={{ position: 'relative', mb: 4 }}>
            <SectionNumber num="07" />
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', mb: 1, position: 'relative', zIndex: 1 }}>Redshift Platform</Typography>
            <Stack direction="row" spacing={3} sx={{ mt: 2, fontFamily: 'monospace', color: colors.textMuted, fontSize: '0.85rem' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><ArticleIcon sx={{ fontSize: 16 }} /> 160+ Files</Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><TimelineIcon sx={{ fontSize: 16 }} /> ~17,000 Lines</Box>
            </Stack>
          </Box>

          <CardBlock sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: colors.textDim, textTransform: 'uppercase', letterSpacing: 2, display: 'block', textAlign: 'center', mb: 4 }}>Data Pipeline Architecture</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="center">
              <Box sx={{ p: 2, bgcolor: `${colors.blue}1a`, border: `1px solid ${colors.blue}4d`, borderRadius: 2, textAlign: 'center', width: '100%' }}>
                <StorageIcon sx={{ fontSize: 32, color: colors.blue, mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: `${colors.blue}ee` }}>Aurora PG</Typography>
                <Typography variant="caption" sx={{ color: `${colors.blue}b3` }}>Primary OLTP</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: colors.textDim }}>Zero-ETL</Typography>
                <SwapHorizIcon sx={{ color: colors.textDim, display: 'block', mx: 'auto' }} />
              </Box>
              <Box sx={{ p: 2, bgcolor: `${colors.purple}1a`, border: `1px solid ${colors.purple}4d`, borderRadius: 2, textAlign: 'center', width: '100%' }}>
                <DnsIcon sx={{ fontSize: 32, color: colors.purple, mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: `${colors.purple}ee` }}>Redshift</Typography>
                <Typography variant="caption" sx={{ color: `${colors.purple}b3` }}>Serverless OLAP</Typography>
              </Box>
            </Stack>
            <Box sx={{ mt: 4, p: 1.5, bgcolor: colors.bg, borderRadius: 1, border: `1px solid ${colors.border}`, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: colors.teal, display: 'block', mb: 0.5 }}>Smart Routing Header</Typography>
              <Typography component="code" sx={{ fontSize: '0.85rem', color: colors.text }}>x-database-source: auto-fallback</Typography>
            </Box>
          </CardBlock>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {['Terraform IaC', 'K8s Config', 'CI/CD Pipelines', 'Diffy Comparison', 'Observability', 'Data Generator'].map((item, i) => (
              <Grid item xs={6} key={i}>
                <Box sx={{ p: 1.5, bgcolor: 'rgba(30,41,59,0.3)', border: `1px solid ${colors.border}`, borderRadius: 2, fontSize: '0.85rem', color: colors.text, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SettingsIcon sx={{ fontSize: 14, color: colors.textDim }} /> {item}
                </Box>
              </Grid>
            ))}
          </Grid>

          <CardBlock>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: `${colors.green}1a`, color: colors.green, display: 'flex' }}>
                <AttachMoneyIcon />
              </Box>
              <Box>
                <Typography sx={{ color: '#fff', fontWeight: 500 }}>Cost Efficiency</Typography>
                <Typography sx={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', mt: 0.5 }}>
                  $110-180<Typography component="span" variant="body2" sx={{ color: colors.textDim, fontWeight: 400, ml: 0.5 }}>/mo</Typography>
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textMuted, mt: 1 }}>Per development environment. Optimized via serverless auto-pausing.</Typography>
              </Box>
            </Box>
          </CardBlock>
        </Grid>
      </Grid>
    </SectionBlock>
  );
}

// ─── Infrastructure Section ──────────────────────────────────────────────────
const k8sServices = [
  { name: 'UI Application', url: 'red.xferdev.com', port: '443' },
  { name: 'API (Postgres)', url: 'api.xferdev.com', port: '3000' },
  { name: 'API (Redshift)', url: 'api-rs.xferdev.com', port: '3010' },
  { name: 'Dashboard', url: 'red-dashboard.xferdev.com', port: '443' },
  { name: 'Portal', url: 'internal-only', port: '8080' },
  { name: 'Redis', url: 'cluster-local', port: '6379' },
];

function InfrastructureSection() {
  return (
    <SectionBlock id="infrastructure" gradient="a">
      <Grid container spacing={6}>
        <Grid item xs={12} lg={7}>
          <Box sx={{ position: 'relative', mb: 4 }}>
            <SectionNumber num="08" />
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', mb: 1, position: 'relative', zIndex: 1 }}>AWS Infrastructure & Kubernetes</Typography>
            <Typography sx={{ color: colors.textMuted }}>Fully automated IaC with Terraform and Helm</Typography>
          </Box>

          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: colors.textDim, textTransform: 'uppercase', letterSpacing: 2, mb: 3, display: 'block' }}>Terraform Resources</Typography>

          {/* Aurora */}
          <CardBlock sx={{ bgcolor: `${colors.blue}0d`, borderColor: `${colors.blue}33`, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ p: 1, bgcolor: `${colors.blue}33`, borderRadius: 2, color: colors.blue, display: 'flex' }}><StorageIcon /></Box>
                <Box>
                  <Typography sx={{ color: '#fff', fontWeight: 600 }}>Aurora PostgreSQL</Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: `${colors.blue}b3` }}>db.t4g.medium · PG 16.4+</Typography>
                </Box>
              </Box>
              <MonoChip label="~$50/mo" color={colors.green} />
            </Box>
            <BulletItem color={colors.blue}>Logical replication enabled</BulletItem>
            <BulletItem color={colors.blue}>Encrypted at rest (KMS)</BulletItem>
            <BulletItem color={colors.blue}>Performance Insights enabled</BulletItem>
          </CardBlock>

          {/* Redshift */}
          <CardBlock sx={{ bgcolor: `${colors.purple}0d`, borderColor: `${colors.purple}33`, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ p: 1, bgcolor: `${colors.purple}33`, borderRadius: 2, color: colors.purple, display: 'flex' }}><DnsIcon /></Box>
                <Box>
                  <Typography sx={{ color: '#fff', fontWeight: 600 }}>Redshift Serverless</Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: `${colors.purple}b3` }}>8 RPU Base · Port 5439</Typography>
                </Box>
              </Box>
              <MonoChip label="~$30-100/mo" color={colors.green} />
            </Box>
            <BulletItem color={colors.purple}>Pay-per-query ($0.375/RPU-hr)</BulletItem>
            <BulletItem color={colors.purple}>Private VPC Access only</BulletItem>
            <BulletItem color={colors.purple}>Auto-pause after 15m inactivity</BulletItem>
          </CardBlock>

          {/* Zero-ETL */}
          <CardBlock sx={{ bgcolor: `${colors.teal}0d`, borderColor: `${colors.teal}33` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{ p: 1, bgcolor: `${colors.teal}33`, borderRadius: 2, color: colors.teal, display: 'flex' }}><SwapHorizIcon /></Box>
              <Box>
                <Typography sx={{ color: '#fff', fontWeight: 600 }}>Zero-ETL Integration</Typography>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: `${colors.teal}b3` }}>Real-time CDC</Typography>
              </Box>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6}><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: colors.textMuted, fontSize: '0.85rem' }}><BarChartIcon sx={{ fontSize: 16, color: colors.teal }} /> Auto-replicated</Box></Grid>
              <Grid item xs={6}><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: colors.textMuted, fontSize: '0.85rem' }}><TimelineIcon sx={{ fontSize: 16, color: colors.teal }} /> Lag &lt; 15s typical</Box></Grid>
            </Grid>
          </CardBlock>
        </Grid>

        <Grid item xs={12} lg={5}>
          <CardBlock sx={{ height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: colors.textDim, textTransform: 'uppercase', letterSpacing: 2 }}>Kubernetes Deployment</Typography>
              <Chip label="ns: redshift-dev" size="small" sx={{ fontFamily: 'monospace', fontSize: '0.65rem', bgcolor: 'rgba(30,41,59,0.5)', color: colors.textMuted, border: `1px solid ${colors.borderLight}` }} />
            </Box>

            <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
              <MonoChip label="AWS NLB" color={colors.sky} />
              <MonoChip label="ACM SSL" color={colors.amber} />
              <MonoChip label="EKS 1.29" color={colors.textMuted} />
            </Stack>

            {k8sServices.map((svc, i) => (
              <Box key={i} sx={{ p: 1.5, bgcolor: `${colors.bg}80`, borderRadius: 1, border: `1px solid ${colors.border}`, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', '&:hover': { borderColor: colors.borderLight } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: colors.green }} />
                  <Typography variant="body2" sx={{ color: colors.text, fontWeight: 500 }}>{svc.name}</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: colors.textDim, display: 'block' }}>{svc.url}</Typography>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '0.6rem', color: colors.textDim }}>:{svc.port}</Typography>
                </Box>
              </Box>
            ))}

            <Divider sx={{ borderColor: colors.border, my: 3 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: colors.textDim }}>Resources</Typography>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: colors.textDim }}>Requests / Limits</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', color: colors.textMuted, mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><MemoryIcon sx={{ fontSize: 16, color: colors.textDim }} /> CPU</Box>
              <Typography variant="body2">250m / 1000m</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', color: colors.textMuted }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><MemoryIcon sx={{ fontSize: 16, color: colors.textDim }} /> Memory</Box>
              <Typography variant="body2">512Mi / 1Gi</Typography>
            </Box>
          </CardBlock>
        </Grid>
      </Grid>
    </SectionBlock>
  );
}

// ─── Database Routing Section ────────────────────────────────────────────────
function DatabaseRoutingSection() {
  return (
    <SectionBlock id="database-routing" gradient="b">
      <Box sx={{ textAlign: 'center', mb: 6, position: 'relative' }}>
        <Typography sx={{ fontSize: '4rem', fontWeight: 700, color: 'rgba(30,41,59,0.3)', position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', zIndex: 0 }}>09</Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', mb: 2, position: 'relative' }}>Smart Database Routing</Typography>
        <Typography sx={{ color: colors.textMuted, maxWidth: 600, mx: 'auto' }}>Intelligent traffic shaping with automatic failover and client control</Typography>
      </Box>

      {/* Flow Diagram */}
      <CardBlock sx={{ mb: 6, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 2, background: `linear-gradient(90deg, ${colors.blue}, ${colors.purple}, ${colors.blue})`, opacity: 0.2 }} />
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center" justifyContent="center" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Client */}
          <Stack alignItems="center">
            <Box sx={{ height: 64, width: 120, bgcolor: 'rgba(30,41,59,0.5)', border: `1px solid ${colors.borderLight}`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', color: colors.text, fontSize: '0.85rem' }}>Client</Box>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: colors.textDim, mt: 1 }}>x-database-source</Typography>
          </Stack>
          <ArrowForwardIcon sx={{ color: colors.textDim, display: { xs: 'none', md: 'block' } }} />
          {/* API Server */}
          <Stack alignItems="center">
            <Box sx={{ height: 64, width: 120, bgcolor: 'rgba(30,41,59,0.5)', border: `1px solid ${colors.borderLight}`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', position: 'relative' }}>
              API Server
              <Box sx={{ position: 'absolute', top: -4, right: -4, width: 12, height: 12, bgcolor: colors.teal, borderRadius: '50%' }} />
            </Box>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: colors.teal, mt: 1 }}>dbType.ts</Typography>
          </Stack>
          <ArrowForwardIcon sx={{ color: colors.textDim, display: { xs: 'none', md: 'block' } }} />
          {/* Decision */}
          <Box sx={{ width: 48, height: 48, transform: 'rotate(45deg)', bgcolor: 'rgba(30,41,59,0.5)', border: `1px solid ${colors.borderLight}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ForkRightIcon sx={{ fontSize: 24, color: colors.textMuted, transform: 'rotate(-45deg)' }} />
          </Box>
          {/* Paths */}
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: `${colors.blue}0d`, border: `1px solid ${colors.blue}33`, borderRadius: 2, width: 180 }}>
              <StorageIcon sx={{ color: colors.blue }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: `${colors.blue}ee` }}>PostgreSQL</Typography>
                <Typography sx={{ fontSize: '0.6rem', color: `${colors.blue}b3` }}>Default Path</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: `${colors.purple}0d`, border: `1px solid ${colors.purple}33`, borderRadius: 2, width: 180 }}>
              <DnsIcon sx={{ color: colors.purple }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: `${colors.purple}ee` }}>Redshift</Typography>
                <Typography sx={{ fontSize: '0.6rem', color: `${colors.purple}b3` }}>Analytics Path</Typography>
              </Box>
            </Box>
          </Stack>
        </Stack>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Chip label="Override: REDSHIFT_FORCE=true" size="small" sx={{ fontFamily: 'monospace', fontSize: '0.7rem', bgcolor: colors.bg, color: colors.textDim, border: `1px solid ${colors.border}` }} />
        </Box>
      </CardBlock>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Stack spacing={3}>
            <CardBlock>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SettingsIcon sx={{ color: colors.textMuted }} />
                <Typography sx={{ color: '#fff', fontWeight: 500 }}>Redshift Client Specs</Typography>
              </Box>
              <Grid container spacing={2}>
                {[
                  { label: 'Max Connections', value: '5' },
                  { label: 'Connect Timeout', value: '10s' },
                  { label: 'Query Timeout', value: '60s' },
                  { label: 'Security', value: 'SSL' },
                ].map((spec, i) => (
                  <Grid item xs={6} key={i}>
                    <Box sx={{ p: 1.5, bgcolor: colors.bg, borderRadius: 1, border: `1px solid ${colors.border}` }}>
                      <Typography variant="caption" sx={{ color: colors.textDim }}>{spec.label}</Typography>
                      <Typography sx={{ fontFamily: 'monospace', color: '#fff', fontSize: '1.2rem' }}>{spec.value}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardBlock>

            <Box sx={{ bgcolor: colors.bg, borderRadius: 3, border: `1px solid ${colors.border}`, p: 2, fontFamily: 'monospace', fontSize: '0.85rem' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: colors.textDim, mb: 1.5, pb: 1, borderBottom: `1px solid ${colors.border}` }}>
                <CodeIcon sx={{ fontSize: 16 }} /> Response Headers
              </Box>
              {[
                { key: 'X-Database-Source:', val: '"redshift"', color: colors.purple },
                { key: 'X-Database-Fallback:', val: '"true"', color: colors.amber },
                { key: 'X-Database-Fallback-Reason:', val: '"timeout"', color: colors.textDim },
              ].map((h, i) => (
                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: h.color }}>{h.key}</Typography>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: colors.text }}>{h.val}</Typography>
                </Box>
              ))}
            </Box>
          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack spacing={3}>
            <CardBlock sx={{ bgcolor: `${colors.amber}0d`, borderColor: `${colors.amber}33` }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ p: 1, bgcolor: `${colors.amber}1a`, borderRadius: 2, color: colors.amber, display: 'flex', alignSelf: 'flex-start' }}><WarningIcon /></Box>
                <Box>
                  <Typography sx={{ color: '#fff', fontWeight: 500, mb: 0.5 }}>Connection Error</Typography>
                  <Typography variant="body2" sx={{ color: colors.textMuted, mb: 1.5 }}>If Redshift is paused or unreachable, the system automatically falls back to PostgreSQL.</Typography>
                  <Chip label="⚠ Toast Notification Triggered" size="small" sx={{ fontFamily: 'monospace', fontSize: '0.65rem', bgcolor: `${colors.amber}1a`, color: `${colors.amber}cc` }} />
                </Box>
              </Box>
            </CardBlock>

            <CardBlock sx={{ bgcolor: `${colors.red}0d`, borderColor: `${colors.red}33` }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ p: 1, bgcolor: `${colors.red}1a`, borderRadius: 2, color: colors.red, display: 'flex', alignSelf: 'flex-start' }}><WarningIcon /></Box>
                <Box>
                  <Typography sx={{ color: '#fff', fontWeight: 500, mb: 0.5 }}>Query Error</Typography>
                  <Typography variant="body2" sx={{ color: colors.textMuted, mb: 1.5 }}>SQL syntax errors or schema mismatches are surfaced directly to the client for debugging.</Typography>
                  <Chip label="🛑 500 Internal Server Error" size="small" sx={{ fontFamily: 'monospace', fontSize: '0.65rem', bgcolor: `${colors.red}1a`, color: `${colors.red}cc` }} />
                </Box>
              </Box>
            </CardBlock>
          </Stack>
        </Grid>
      </Grid>
    </SectionBlock>
  );
}

// ─── Diffy Section ───────────────────────────────────────────────────────────
const noiseSteps = [
  { step: 1, text: 'Send request to Primary → Response A' },
  { step: 2, text: 'Send same request to Candidate → Response B' },
  { step: 3, text: 'If A ≠ B → Potential difference detected', highlight: true },
  { step: 4, text: 'Send same request to Secondary → Response C' },
  { step: 5, text: 'If diff(A,B) appears in diff(A,C) → IGNORE (Noise)', dim: true },
  { step: 6, text: 'If diff only in A vs B → REAL REGRESSION', success: true },
] as const;

function DiffySection() {
  return (
    <SectionBlock id="diffy" gradient="a">
      <Grid container spacing={6}>
        <Grid item xs={12} lg={5}>
          <Box sx={{ position: 'relative' }}>
            <SectionNumber num="10" />
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', mb: 3, position: 'relative', zIndex: 1 }}>OpenDiffy: Automated API Comparison</Typography>
            <Typography sx={{ color: colors.textMuted, mb: 4 }}>
              Regression testing infrastructure that compares responses between PostgreSQL and Redshift backends in real-time.
            </Typography>

            {[
              { name: 'Diffy Admin UI', port: 'localhost:8888', icon: <TimelineIcon />, color: colors.sky },
              { name: 'Nginx Proxy', port: 'localhost:8880', icon: <SwapHorizIcon />, color: colors.teal },
              { name: 'Prometheus Metrics', port: '/metrics endpoint', icon: <TimelineIcon />, color: colors.purple },
            ].map((svc, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 3, mb: 2 }}>
                <Box sx={{ p: 1, bgcolor: `${svc.color}1a`, borderRadius: 1, color: svc.color, display: 'flex' }}>{svc.icon}</Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff' }}>{svc.name}</Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: colors.textDim }}>{svc.port}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Grid>

        <Grid item xs={12} lg={7}>
          <CardBlock sx={{ mb: 4 }}>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: colors.textDim, textTransform: 'uppercase', letterSpacing: 2, display: 'block', textAlign: 'center', mb: 4 }}>Three-Way Comparison Architecture</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="center">
              {/* Primary */}
              <Stack alignItems="center" spacing={1}>
                <Box sx={{ p: 2, bgcolor: `${colors.blue}1a`, border: `1px solid ${colors.blue}4d`, borderRadius: 2, textAlign: 'center', width: 120 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: `${colors.blue}ee` }}>Primary</Typography>
                  <Typography sx={{ fontSize: '0.6rem', color: `${colors.blue}b3` }}>Baseline</Typography>
                </Box>
                <Box sx={{ width: 2, height: 32, bgcolor: colors.borderLight }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><StorageIcon sx={{ fontSize: 12, color: colors.textDim }} /><Typography variant="caption" sx={{ color: colors.textDim }}>Postgres</Typography></Box>
              </Stack>

              {/* Diffy Core */}
              <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'rgba(30,41,59,0.5)', border: `2px solid ${colors.teal}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${colors.teal}33` }}>
                <CompareArrowsIcon sx={{ fontSize: 32, color: colors.teal }} />
              </Box>

              {/* Candidate */}
              <Stack alignItems="center" spacing={1}>
                <Box sx={{ p: 2, bgcolor: `${colors.purple}1a`, border: `1px solid ${colors.purple}4d`, borderRadius: 2, textAlign: 'center', width: 120 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: `${colors.purple}ee` }}>Candidate</Typography>
                  <Typography sx={{ fontSize: '0.6rem', color: `${colors.purple}b3` }}>New Code</Typography>
                </Box>
                <Box sx={{ width: 2, height: 32, bgcolor: colors.borderLight }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><DnsIcon sx={{ fontSize: 12, color: colors.textDim }} /><Typography variant="caption" sx={{ color: colors.textDim }}>Redshift</Typography></Box>
              </Stack>

              {/* Secondary */}
              <Stack alignItems="center" spacing={1} sx={{ opacity: 0.6 }}>
                <Box sx={{ p: 2, bgcolor: 'rgba(30,41,59,0.5)', border: `1px solid ${colors.borderLight}`, borderRadius: 2, textAlign: 'center', width: 120 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: colors.text }}>Secondary</Typography>
                  <Typography sx={{ fontSize: '0.6rem', color: colors.textDim }}>Noise Filter</Typography>
                </Box>
                <Box sx={{ width: 2, height: 32, bgcolor: colors.borderLight }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><StorageIcon sx={{ fontSize: 12, color: colors.textDim }} /><Typography variant="caption" sx={{ color: colors.textDim }}>Postgres</Typography></Box>
              </Stack>
            </Stack>
          </CardBlock>

          <CardBlock sx={{ bgcolor: `${colors.teal}0d`, borderColor: `${colors.teal}33` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <FilterListIcon sx={{ color: colors.teal }} />
              <Typography sx={{ color: '#fff', fontWeight: 500 }}>Noise Filtering Algorithm</Typography>
            </Box>
            {noiseSteps.map((item, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                <Box sx={{
                  width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, fontFamily: 'monospace', flexShrink: 0,
                  ...('success' in item && item.success ? { bgcolor: colors.red, color: '#fff' } : 'highlight' in item && item.highlight ? { bgcolor: colors.teal, color: colors.bg } : { bgcolor: 'rgba(30,41,59,0.5)', color: colors.textDim }),
                }}>
                  {item.step}
                </Box>
                <Typography sx={{
                  fontFamily: 'monospace', fontSize: '0.85rem',
                  ...('success' in item && item.success ? { color: colors.red, fontWeight: 700 } : 'highlight' in item && item.highlight ? { color: colors.tealLight } : 'dim' in item && item.dim ? { color: colors.textDim } : { color: colors.text }),
                }}>
                  {item.text}
                </Typography>
              </Box>
            ))}
          </CardBlock>
        </Grid>
      </Grid>
    </SectionBlock>
  );
}

// ─── Observability Section ───────────────────────────────────────────────────
const monitoringStack = [
  { name: 'Grafana', port: '3003', icon: <BarChartIcon />, desc: 'Visualization' },
  { name: 'Prometheus', port: '9090', icon: <TimelineIcon />, desc: 'Metrics' },
  { name: 'Loki', port: '3100', icon: <DescriptionIcon />, desc: 'Log Aggregation' },
  { name: 'Promtail', port: 'Agent', icon: <SearchIcon />, desc: 'Log Shipping' },
  { name: 'Tempo', port: '3200', icon: <AccessTimeIcon />, desc: 'Distributed Tracing' },
];

function ObservabilitySection() {
  return (
    <SectionBlock id="observability" gradient="b">
      <Box sx={{ textAlign: 'center', mb: 6, position: 'relative' }}>
        <Typography sx={{ fontSize: '4rem', fontWeight: 700, color: 'rgba(30,41,59,0.3)', position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', zIndex: 0 }}>11</Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', mb: 2, position: 'relative' }}>Observability & Test Data</Typography>
        <Typography sx={{ color: colors.textMuted, maxWidth: 600, mx: 'auto' }}>Full-stack visibility and realistic data simulation for robust testing</Typography>
      </Box>

      <Grid container spacing={6}>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <TimelineIcon sx={{ color: colors.sky }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>Monitoring Stack</Typography>
          </Box>

          <Box sx={{ bgcolor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 3, overflow: 'hidden', mb: 3 }}>
            {monitoringStack.map((svc, i) => (
              <Box key={i} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: i < monitoringStack.length - 1 ? `1px solid ${colors.border}` : 'none', '&:hover': { bgcolor: 'rgba(30,41,59,0.3)' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ p: 1, bgcolor: 'rgba(30,41,59,0.5)', borderRadius: 1, color: colors.textMuted, display: 'flex' }}>{svc.icon}</Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: colors.text, fontWeight: 500 }}>{svc.name}</Typography>
                    <Typography variant="caption" sx={{ color: colors.textDim }}>{svc.desc}</Typography>
                  </Box>
                </Box>
                <Chip label={`:${svc.port}`} size="small" sx={{ fontFamily: 'monospace', fontSize: '0.65rem', bgcolor: colors.bg, color: colors.textDim, border: `1px solid ${colors.border}` }} />
              </Box>
            ))}
          </Box>

          <Box sx={{ p: 2, bgcolor: `${colors.sky}0d`, border: `1px solid ${colors.sky}33`, borderRadius: 3 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: colors.sky, textTransform: 'uppercase', letterSpacing: 2, mb: 1.5, display: 'block' }}>Pre-built Dashboards</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
              {['API Route Performance', 'Worker Job Health', 'WebSocket Health', 'Diffy Monitoring'].map((d, i) => (
                <MonoChip key={i} label={d} color={colors.sky} />
              ))}
            </Stack>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <StorageIcon sx={{ color: colors.teal }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>Data Generator</Typography>
          </Box>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { icon: <PlayArrowIcon />, title: 'Simulate', desc: 'Continuous multi-hospital traffic', color: colors.teal, active: true },
              { icon: <CalendarTodayIcon />, title: 'Historical', desc: 'Backfill date ranges', color: colors.textMuted },
              { icon: <PeopleIcon />, title: 'Single', desc: 'CI/CD validation', color: colors.textMuted },
              { icon: <CancelIcon />, title: 'Decline', desc: 'Workflow testing', color: colors.textMuted },
            ].map((item, i) => (
              <Grid item xs={6} key={i}>
                <CardBlock sx={item.active ? { bgcolor: `${colors.teal}0d`, borderColor: `${colors.teal}33`, cursor: 'pointer', '&:hover': { borderColor: `${colors.teal}66` } } : { cursor: 'pointer' }}>
                  <Box sx={{ color: item.color, mb: 1.5 }}>{item.icon}</Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff' }}>{item.title}</Typography>
                  <Typography variant="caption" sx={{ color: item.active ? colors.textMuted : colors.textDim }}>{item.desc}</Typography>
                </CardBlock>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ bgcolor: colors.bg, borderRadius: 3, border: `1px solid ${colors.border}`, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: colors.textDim, textTransform: 'uppercase', letterSpacing: 2 }}>Generator Features</Typography>
              <Chip label="Interactive TUI" size="small" sx={{ fontFamily: 'monospace', fontSize: '0.65rem', bgcolor: `${colors.teal}33`, color: colors.teal }} />
            </Box>
            <BulletItem color={colors.teal}>Realistic patient demographics</BulletItem>
            <BulletItem color={colors.teal}>Market-aware facility selection</BulletItem>
            <BulletItem color={colors.teal}>Full lifecycle (Admit → Transfer → Discharge)</BulletItem>
          </Box>
        </Grid>
      </Grid>
    </SectionBlock>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function XferallPage() {
  return (
    <BrandingCssVarsProvider>
      <Head title="XFERALL Platform Engineering - Stoked Consulting" description="Executive deliverables presentation for XFERALL platform engineering" />
      <AppHeader />
      <Box component="main" id="main-content" sx={{ bgcolor: colors.bg, color: colors.text, minHeight: '100vh' }}>
        <TitleSection />
        <OverviewSection />
        <DirectoryConstantsSection />
        <EnvironmentBootstrapSection />
        <DbSeedSection />
        <DevOnboardingSection />
        <DeveloperWorkflowSection />
        <GeneratorServiceSection />
        <RedshiftPlatformSection />
        <InfrastructureSection />
        <DatabaseRoutingSection />
        <DiffySection />
        <ObservabilitySection />

        {/* Footer */}
        <Box sx={{ py: 6, textAlign: 'center', fontFamily: 'monospace', fontSize: '0.8rem', color: colors.textDim, borderTop: `1px solid ${colors.surfaceSolid}` }}>
          XFERALL PLATFORM ENGINEERING &bull; 2026
        </Box>
      </Box>
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
