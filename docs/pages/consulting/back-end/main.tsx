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
      title: 'API Development (REST / GraphQL)',
      description: 'Design and implementation of robust, well-documented APIs. RESTful services with OpenAPI specifications and GraphQL schemas with efficient resolvers and subscriptions.',
    },
    {
      title: 'Microservice Architecture',
      description: 'Decomposing monoliths into scalable, independently deployable microservices. Event-driven architecture, service mesh integration, and domain-driven design.',
    },
    {
      title: 'Database Design & Optimization',
      description: 'Schema design, query optimization, and data modeling for relational and NoSQL databases. Migration strategies, indexing, and performance tuning at scale.',
    },
    {
      title: 'Authentication & Security',
      description: 'Implementing OAuth 2.0, JWT, RBAC, and zero-trust architectures. Security audits, penetration testing guidance, and HIPAA/SOC2 compliance.',
    },
    {
      title: 'Real-time Systems',
      description: 'WebSocket servers, Server-Sent Events, and pub/sub architectures for live data streaming. Chat systems, notifications, and collaborative editing infrastructure.',
    },
    {
      title: 'Data Pipeline Engineering',
      description: 'ETL/ELT pipeline design and implementation. Batch and stream processing, data lake architecture, and integration with analytics platforms.',
    },
  ];

  const technologies = [
    { name: 'Node.js', detail: 'High-performance JavaScript runtime' },
    { name: 'NestJS', detail: 'Progressive Node.js framework' },
    { name: 'Python', detail: 'Versatile backend language' },
    { name: 'C# / .NET', detail: 'Enterprise application framework' },
    { name: 'PostgreSQL', detail: 'Advanced relational database' },
    { name: 'MongoDB', detail: 'Document-oriented NoSQL database' },
    { name: 'Redis', detail: 'In-memory data store and cache' },
    { name: 'RabbitMQ', detail: 'Message broker for async workflows' },
  ];

  return (
    <React.Fragment>
      <HeroContainer
        linearGradient
        left={
          <Box sx={{ textAlign: { xs: 'center', md: 'left' }, maxWidth: 500 }}>
            <Typography variant="h1" mb={1} color="text.primary">
              Back End<br />
              <GradientText>Development</GradientText>
            </Typography>
            <Typography color="text.secondary" mb={3}>
              Scalable, secure, and high-performance server-side systems that power your
              applications. From API design to database architecture, we build back end
              infrastructure that handles millions of requests with reliability.
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
            Robust server-side engineering for APIs, databases, and distributed systems
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
            Production-proven tools and platforms for building resilient back end systems
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
              Power Your Application at Scale
            </Typography>
            <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>
              Let's architect back end systems that are secure, performant, and built to grow with your business.
            </Typography>
            <Typography variant="body1" sx={{ mt: 4, fontWeight: 600, color: 'primary.main' }}>
              Engineering reliable server-side solutions since 2010
            </Typography>
          </Box>
        </Container>
      </Section>
      <Divider />
    </React.Fragment>
  );
}
