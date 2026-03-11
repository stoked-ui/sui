import * as React from 'react';
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import { styled } from "@mui/material/styles";
import Section from "docs/src/layouts/Section";
import GradientText from "docs/src/components/typography/GradientText";
import HeroContainer from "docs/src/layouts/HeroContainer";

const ServiceCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  borderRadius: theme.spacing(2),
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    '& .service-title': {
      color: '#3399ff',
    },
  },
}));

export default function Main() {
  const services = [
    {
      title: 'React & Next.js Applications',
      description: 'Single-page apps, server-rendered marketing sites, and hybrid architectures. Component libraries, design system integration (Material UI, Tailwind, Shadcn), and state management (Redux, Zustand, Context API).',
    },
    {
      title: 'Performance Engineering',
      description: 'Core Web Vitals optimization, lazy loading strategies, bundle analysis, and lighthouse-driven performance tuning. We\'ve taken client sites from 30s load times to sub-second renders.',
    },
    {
      title: 'Responsive & Accessible Design',
      description: 'WCAG 2.1 AA compliance, mobile-first responsive layouts, and cross-browser compatibility. Every interface works for every user.',
    },
    {
      title: 'Design-to-Code Pipelines',
      description: 'Figma-to-React workflows, Storybook-driven component development, and visual regression testing. We bridge the gap between design and engineering.',
    },
    {
      title: 'Legacy Modernization',
      description: 'Migrating jQuery/Angular/Backbone apps to React or Next.js without breaking production. Incremental adoption strategies that minimize risk.',
    },
  ];

  const technologies = [
    { name: 'React / Next.js', detail: 'Modern app architectures' },
    { name: 'TypeScript', detail: 'Type-safe frontend development' },
    { name: 'Tailwind / MUI', detail: 'Utility and component styling' },
    { name: 'Shadcn/ui', detail: 'Modern accessible components' },
    { name: 'Vite / Webpack', detail: 'Fast and flexible build tools' },
    { name: 'Storybook', detail: 'UI development environment' },
    { name: 'Jest / Playwright', detail: 'Robust unit and E2E testing' },
    { name: 'Core Web Vitals', detail: 'Performance optimization' },
  ];

  return (
    <React.Fragment>
      <HeroContainer
        linearGradient
        left={
          <Box sx={{ textAlign: { xs: 'center', md: 'left' }, maxWidth: 500 }}>
            <Typography variant="h1" mb={1} color="text.primary">
              Interfaces That<br />
              <GradientText>Convert.</GradientText>
            </Typography>
            <Typography color="text.secondary" mb={3}>
              With 25+ years building for the web, Brian Stoker has shipped front-end
              experiences across every era of the browser — from early jQuery and Backbone.js
              to modern React, Next.js, and beyond. Stoked Consulting delivers pixel-perfect,
              performant, accessible interfaces that don&apos;t just look great — they drive
              business results.
            </Typography>
          </Box>
        }
        rightSx={{
          p: 4,
          ml: 2,
          minWidth: 2000,
          overflow: 'hidden',
          '& > div': {
            width: 760,
            display: 'inline-flex',
            verticalAlign: 'top',
          },
        }}
        right={<React.Fragment />}
      />
      <Divider />
      {/* Services Section */}
      <Section sx={{ bgcolor: "background.paper" }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              mb: 2,
              fontWeight: 700,
              textAlign: 'center',
              fontSize: { xs: '2rem', md: '2.5rem' },
              color: "#3399ff"
            }}
          >
            Services
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 6, textAlign: 'center', maxWidth: 800, mx: 'auto' }}
          >
            Expert front end engineering to build fast, accessible, and beautiful user interfaces
          </Typography>
          <Grid container spacing={3}>
            {services.map((service, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <ServiceCard>
                  <CardContent>
                    <Typography variant="h6" className="service-title" sx={{ mb: 2, fontWeight: 600, color: 'text.primary', transition: 'color 0.2s' }}>
                      {service.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {service.description}
                    </Typography>
                  </CardContent>
                </ServiceCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Section>

      <Divider />

      {/* Technologies Section */}
      <Section bg="gradient">
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <Box sx={{ display: 'inline-flex', textAlign: 'center' }}>
            <Typography
              variant="h2"
              sx={{
                mb: 2,
                fontWeight: 700,
                textAlign: 'center',
                fontSize: { xs: '2rem', md: '2.5rem' },
                color: "#3399ff"
              }}
            >
              Core
            </Typography>
            <Typography
              variant="h2"
              sx={{
                mb: 2,
                fontWeight: 700,
                textAlign: 'center',
                fontSize: { xs: '2rem', md: '2.5rem' },
              }}
            >
              &nbsp;Technologies
            </Typography>
          </Box>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 6, textAlign: 'center', maxWidth: 800, mx: 'auto' }}
          >
            Battle-tested tools and frameworks for building world-class front end applications
          </Typography>
          <Grid container spacing={3} sx={{ textAlign: 'left' }}>
            {technologies.map((tech, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box
                  sx={[
                    {
                      p: 3,
                      height: '100px',
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: 2,
                        '& .tech-name': {
                          color: '#3399ff',
                        },
                      },
                    },
                    (theme) => theme.applyDarkStyles({
                      bgcolor: 'primaryDark.800',
                    }),
                  ]}
                >
                  <Typography variant="h6" className="tech-name" sx={{ mb: 1, fontWeight: 600, color: 'text.primary', transition: 'color 0.2s' }}>
                    {tech.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tech.detail}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
        <Container maxWidth="md" sx={{ marginTop: 10 }}>
          <Box
            sx={[
              {
                textAlign: 'center',
                py: 8,
                px: 4,
                bgcolor: 'grey.50',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'grey.200',
              },
              (theme) => theme.applyDarkStyles({
                bgcolor: 'grey.900',
                borderColor: 'primaryDark.700',
              }),
            ]}
          >
            <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
              Elevate Your User Experience
            </Typography>
            <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>
              Let's build interfaces that your users will love and your developers will enjoy maintaining.
            </Typography>
            <Typography variant="body1" sx={{ mt: 4, fontWeight: 600, color: 'primary.main' }}>
              Crafting production-ready front end applications since 2010
            </Typography>
          </Box>
        </Container>
      </Section>
      <Divider />
    </React.Fragment>
  );
}
