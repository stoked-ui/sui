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
import Hero from "docs/src/components/home/HeroConsulting";

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
      title: 'Greenfield Product Development',
      description: 'From concept to production. We architect, build, and deploy complete web applications — database schema to deployment pipeline to pixel-perfect UI. Ideal for startups and new product lines.',
    },
    {
      title: 'Technical Debt Remediation',
      description: 'Comprehensive codebase audits, refactoring roadmaps, and incremental modernization. We\'ve rescued projects from spaghetti code, scaling bottlenecks, and unmaintainable architectures.',
    },
    {
      title: 'Platform & Marketplace Development',
      description: 'Multi-tenant SaaS platforms, two-sided marketplaces, and complex RBAC systems. Authentication, billing integration (Stripe), admin dashboards, and analytics.',
    },
    {
      title: 'DevOps & CI/CD',
      description: 'Automated testing pipelines, blue-green deployments, feature flags, monitoring (Datadog, Sentry, Grafana), and alerting. We ship with confidence.',
    },
    {
      title: 'Full-Stack Modernization',
      description: 'Migrating legacy monolithic stacks to modern serverless or microservice architectures. End-to-end integration of React/Next.js with robust cloud backends.',
    },
    {
      title: 'Team Augmentation & Leadership',
      description: 'Embedded senior engineering support. Code reviews, architecture decisions, mentoring junior developers, and establishing engineering best practices.',
    },
  ];

  const industries = [
    {
      name: 'Healthcare',
      detail: 'HIPAA-compliant systems for hospitals and medical billing'
    },
    {
      name: 'Automotive & Dealerships',
      detail: 'Enterprise data integration and operational analytics'
    },
    {
      name: 'Energy & Utilities',
      detail: 'Energy scoring tools and resource management systems'
    },
    {
      name: 'Financial Services',
      detail: 'Loan processing and financial management platforms'
    },
    {
      name: 'Gaming & Entertainment',
      detail: 'AAA game development and VR/RTS gaming experiences'
    },
    {
      name: 'Education & Public Safety',
      detail: 'Active shooter notification systems for public schools'
    },
  ];

  return (
    <React.Fragment>
      <Hero />
      <Divider/>
      {/* Services Section */}
      <Section sx={{ bgcolor: "background.paper"}}>
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
            Comprehensive software engineering consulting tailored to your business needs
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
        <Container maxWidth="lg" sx={{textAlign: 'center'}}>
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
            Industry
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
              &nbsp;Experience
            </Typography>
          </Box>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 6, textAlign: 'center', maxWidth: 800, mx: 'auto' }}
          >
            Proven track record across diverse industries with complex technical requirements
          </Typography>
          <Grid container spacing={3} sx={{ textAlign: 'left' }}>
            {industries.map((industry, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
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
                        '& .industry-name': {
                          color: '#3399ff',
                        },
                      },
                    },
                    (theme) => theme.applyDarkStyles({
                      bgcolor: 'primaryDark.800',
                    }),
                  ]}
                >
                  <Typography variant="h6" className="industry-name" sx={{ mb: 1, fontWeight: 600, color: 'text.primary', transition: 'color 0.2s' }}>
                    {industry.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {industry.detail}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
        <Container maxWidth="md" sx={{ marginTop: 10}}>
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
              End-to-End Solutions. Zero Friction.
            </Typography>
            <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>
              The most complex problems live at the intersection of front-end and back-end. With deep expertise across the entire stack, we eliminate the communication gaps and architectural misalignments that plague multi-team projects.
            </Typography>
            <Typography variant="body1" sx={{ mt: 4, fontWeight: 600, color: 'primary.main' }}>
              Building production-ready applications since 1999
            </Typography>
          </Box>
        </Container>
      </Section>
      <Divider/>
    </React.Fragment>
  );
}
