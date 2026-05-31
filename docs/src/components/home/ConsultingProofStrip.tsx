import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Section from 'docs/src/layouts/Section';

const BRANDS: Array<{ name: string; line: string }> = [
  { name: '911inform', line: 'Active shooter alert SaaS — solo build, $17M valuation in 5 months' },
  { name: 'NextGen Healthcare', line: 'Hospital billing & HIPAA-grade systems, real-time perf monitoring' },
  { name: 'BMC Software', line: 'TrueSight Intelligence — 3x ingestion, 89.5% test coverage' },
  { name: 'Curb Energy', line: 'Energy scoring tools + open-source AWS infra CLI (cenv)' },
  { name: 'Aristocrat Games', line: 'Internal knowledge & video editing platform' },
  { name: 'AAA Games', line: 'Silent Hill: Homecoming, Age of Empires 3, GI Joe, Green Lantern' },
];

const NUMBERS: Array<{ value: string; label: string }> = [
  { value: '25+', label: 'years shipping production software' },
  { value: '12+', label: 'years based in Austin' },
  { value: '$17M', label: 'valuation, solo SaaS build, 5 months' },
  { value: '$12B/yr', label: 'processed by systems Brian led' },
  { value: '60%', label: 'REST API perf improvement at NextGen' },
  { value: '89.5%', label: 'test coverage at BMC — top in division' },
];

export default function ConsultingProofStrip() {
  return (
    <Section sx={{ py: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">
        <Typography
          variant="overline"
          sx={{ color: '#3399ff', fontWeight: 700, letterSpacing: 2, display: 'block', textAlign: 'center', mb: 1 }}
        >
          REAL SHIPS, REAL BRANDS
        </Typography>
        <Typography
          variant="h3"
          sx={{
            textAlign: 'center',
            fontWeight: 700,
            fontSize: { xs: '1.5rem', md: '2rem' },
            mb: 4,
            maxWidth: 820,
            mx: 'auto',
            lineHeight: 1.25,
          }}
        >
          Two and a half decades of production work — now pointed at AI.
        </Typography>

        <Grid container spacing={2} sx={{ mb: 5 }}>
          {BRANDS.map((b) => (
            <Grid item xs={12} sm={6} md={4} key={b.name}>
              <Box
                sx={[
                  {
                    px: 2.5,
                    py: 2,
                    height: '100%',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                  },
                  (theme) => theme.applyDarkStyles({
                    bgcolor: 'primaryDark.800',
                    borderColor: 'primaryDark.700',
                  }),
                ]}
              >
                <Typography sx={{ fontWeight: 700, mb: 0.5, color: '#3399ff' }}>
                  {b.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {b.line}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2}>
          {NUMBERS.map((n) => (
            <Grid item xs={6} sm={4} md={2} key={n.label}>
              <Box sx={{ textAlign: 'center', px: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '1.5rem', md: '1.85rem' },
                    color: '#3399ff',
                    lineHeight: 1,
                    mb: 0.5,
                  }}
                >
                  {n.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.3 }}>
                  {n.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
