import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export type ConsultingHeroDiscipline = 'front-end' | 'back-end' | 'devops' | 'full-stack';

const frameSx = [
  {
    width: 'min(100%, 420px)',
    minWidth: 320,
    maxWidth: 420,
    border: 1,
    borderColor: 'divider',
    borderRadius: '12px',
    overflow: 'hidden',
    bgcolor: 'background.paper',
    boxShadow: '0 18px 40px -24px rgba(15, 23, 42, 0.45)',
    '& ::selection': {
      backgroundColor: 'rgba(51, 153, 255, 0.28)',
    },
  },
  (theme: { applyDarkStyles: (styles: Record<string, unknown>) => Record<string, unknown> }) =>
    theme.applyDarkStyles({
      bgcolor: 'primaryDark.800',
      borderColor: 'primaryDark.700',
      boxShadow: '0 18px 40px -24px rgba(0, 0, 0, 0.7)',
    }),
];

function Frame({
  visual,
  title,
  children,
}: {
  visual: ConsultingHeroDiscipline;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box data-hero-visual={visual} sx={frameSx}>
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Box
          aria-hidden
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: '#3399ff',
            boxShadow: '0 0 0 4px rgba(51, 153, 255, 0.18)',
          }}
        />
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ p: 2.5 }}>{children}</Box>
    </Box>
  );
}

function FrontEndStill() {
  const tools = ['React', 'Next.js', 'TypeScript', 'MUI'];
  return (
    <Frame visual="front-end" title="Interface">
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: '1.35rem',
          letterSpacing: '-0.03em',
          lineHeight: 1.25,
          mb: 2,
          textWrap: 'balance',
        }}
      >
        Pixel-perfect, performant, accessible.
      </Typography>
      <Stack direction="row" useFlexGap spacing={1} sx={{ flexWrap: 'wrap' }}>
        {tools.map((tool) => (
          <Box
            key={tool}
            sx={[
              {
                px: 1.25,
                py: 0.5,
                borderRadius: 999,
                border: 1,
                borderColor: 'primary.200',
                bgcolor: 'primary.50',
                color: 'primary.800',
                fontSize: '0.8125rem',
                fontWeight: 600,
              },
              (theme) =>
                theme.applyDarkStyles({
                  borderColor: 'primary.700',
                  bgcolor: 'primaryDark.700',
                  color: 'primary.200',
                }),
            ]}
          >
            {tool}
          </Box>
        ))}
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, maxWidth: '38ch' }}>
        WCAG 2.1 AA, responsive layout, and Core Web Vitals — the same bar as the engagement.
      </Typography>
    </Frame>
  );
}

function BackEndStill() {
  return (
    <Frame visual="back-end" title="Service">
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25 }}>
        Example
      </Typography>
      <Box
        component="pre"
        sx={[
          {
            m: 0,
            p: 1.75,
            borderRadius: 1.5,
            bgcolor: 'grey.50',
            color: 'text.primary',
            fontFamily: 'Menlo, Consolas, monospace',
            fontSize: 13,
            lineHeight: 1.55,
            overflow: 'auto',
            whiteSpace: 'pre',
          },
          (theme) =>
            theme.applyDarkStyles({
              bgcolor: 'primaryDark.900',
            }),
        ]}
      >
        {`GET /v1/services
200 OK

{
  "api": "graphql",
  "store": "postgres",
  "live": "websocket"
}`}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, maxWidth: '38ch' }}>
        REST, GraphQL, and realtime systems — the shape of the back end, not a live trace.
      </Typography>
    </Frame>
  );
}

const PIPELINE = [
  { name: 'Infrastructure', detail: 'AWS, GCP, Terraform, CDK' },
  { name: 'Pipeline', detail: 'Build, test, and deploy' },
  { name: 'Observe', detail: 'Logs, traces, and alerts' },
];

function FullStackStill() {
  const layers = [
    { name: 'Interface', detail: 'React, Next.js, Angular' },
    { name: 'Service', detail: 'Node.js, Python, C#' },
    { name: 'Cloud', detail: 'AWS, GCP, and IaC' },
  ];
  return (
    <Frame visual="full-stack" title="Stack">
      <Stack spacing={1.75}>
        {layers.map((layer) => (
          <Box key={layer.name}>
            <Typography sx={{ fontWeight: 600, letterSpacing: '-0.02em' }}>{layer.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {layer.detail}
            </Typography>
          </Box>
        ))}
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, maxWidth: '38ch' }}>
        Greenfield builds and legacy modernization, one team across the stack since 2010.
      </Typography>
    </Frame>
  );
}

function DevopsStill() {
  return (
    <Frame visual="devops" title="Delivery">
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '16px 1fr',
          columnGap: 1.5,
          rowGap: 2,
        }}
      >
        {PIPELINE.map((stage, index) => (
          <React.Fragment key={stage.name}>
            <Box sx={{ position: 'relative' }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: '#3399ff',
                  mt: '5px',
                }}
              />
              {index < PIPELINE.length - 1 ? (
                <Box
                  sx={{
                    position: 'absolute',
                    left: '4px',
                    top: 18,
                    bottom: -18,
                    width: '1px',
                    bgcolor: 'divider',
                  }}
                />
              ) : null}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 600, letterSpacing: '-0.02em' }}>{stage.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {stage.detail}
              </Typography>
            </Box>
          </React.Fragment>
        ))}
      </Box>
    </Frame>
  );
}

const STILLS = {
  'front-end': FrontEndStill,
  'back-end': BackEndStill,
  devops: DevopsStill,
  'full-stack': FullStackStill,
};

export default function ConsultingHeroStill({
  discipline,
}: {
  discipline: ConsultingHeroDiscipline;
}) {
  const Still = STILLS[discipline];
  return <Still />;
}
