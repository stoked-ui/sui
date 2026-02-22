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
      title: 'React / Next.js Development',
      description: 'Building high-performance web applications with React and Next.js. Server-side rendering, static generation, and hybrid approaches for optimal user experience and SEO.',
    },
    {
      title: 'Angular Applications',
      description: 'Enterprise-grade Angular applications with robust architecture, lazy loading, and state management. Scalable solutions for complex business requirements.',
    },
    {
      title: 'TypeScript Migration',
      description: 'Incremental migration of JavaScript codebases to TypeScript. Improved type safety, better developer experience, and fewer runtime errors across your application.',
    },
    {
      title: 'Component Library Development',
      description: 'Design system and component library creation with Storybook documentation. Reusable, accessible, and themeable UI components that accelerate development.',
    },
    {
      title: 'Responsive Design',
      description: 'Mobile-first responsive design using modern CSS techniques, Tailwind CSS, and Material UI. Pixel-perfect implementations that work across all devices and screen sizes.',
    },
    {
      title: 'Performance Optimization',
      description: 'Core Web Vitals optimization, bundle analysis, code splitting, and rendering performance improvements. Measurable speed gains that improve conversion and user satisfaction.',
    },
  ];

  const technologies = [
    { name: 'React', detail: 'Component architecture and hooks' },
    { name: 'Next.js', detail: 'Full-stack React framework' },
    { name: 'Angular', detail: 'Enterprise application platform' },
    { name: 'Vue.js', detail: 'Progressive JavaScript framework' },
    { name: 'TypeScript', detail: 'Type-safe JavaScript at scale' },
    { name: 'Tailwind CSS', detail: 'Utility-first CSS framework' },
    { name: 'Material UI', detail: 'React component library' },
    { name: 'Storybook', detail: 'UI component workshop' },
  ];

  return (
    <React.Fragment>
      <HeroContainer
        linearGradient
        left={
          <Box sx={{ textAlign: { xs: 'center', md: 'left' }, maxWidth: 500 }}>
            <Typography variant="h1" mb={1} color="text.primary">
              Front End<br />
              <GradientText>Development</GradientText>
            </Typography>
            <Typography color="text.secondary" mb={3}>
              Modern, performant, and accessible user interfaces built with industry-leading
              frameworks. From single-page applications to complex component libraries, we
              deliver front end solutions that delight users and scale with your business.
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
