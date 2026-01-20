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
      title: 'Full Stack Development',
      description: 'End-to-end application development using modern frameworks like React, Next.js, Angular, and Node.js. Building scalable web applications with TypeScript, Python, and C#.',
    },
    {
      title: 'Cloud Infrastructure',
      description: 'AWS and GCP infrastructure design and implementation using modern IaC tools including Terraform, CDK, and SST. Scalable, secure, and cost-effective cloud solutions.',
    },
    {
      title: 'Legacy System Modernization',
      description: 'Transform outdated systems into modern, maintainable applications. Experience with enterprise healthcare, financial, and automotive systems.',
    },
    {
      title: 'Data Integration',
      description: 'Complex data pipeline design and implementation. Merging diverse data sources into unified, actionable insights using SQL, MongoDB, and PostgreSQL.',
    },
    {
      title: 'Technical Leadership',
      description: 'Leading engineering teams on cutting-edge solutions and legacy systems. Building high-performance teams and establishing best practices.',
    },
    {
      title: 'Custom Tool Development',
      description: 'Building internal tools and CLI applications that streamline engineering workflows and improve team effectiveness.',
    },
  ];

  const technologies = [
    {
      category: 'Frontend',
      items: ['React', 'Next.js', 'Angular', 'TypeScript', 'Material-UI', 'Blazor']
    },
    {
      category: 'Backend',
      items: ['Node.js', 'Nest.js', 'Python', 'C#', '.NET', 'Express']
    },
    {
      category: 'Cloud & DevOps',
      items: ['AWS', 'GCP', 'Terraform', 'CDK', 'SST', 'Docker']
    },
    {
      category: 'Databases',
      items: ['PostgreSQL', 'MongoDB', 'MSSQL', 'Entity Framework']
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

  const projects = [
    {
      title: 'Stoked UI',
      description: 'Open source React video editor suite built on the MUI framework. Modern component library for video editing applications with drag-and-drop file management.',
      tech: 'React, TypeScript, MUI, WebAssembly',
    },
    {
      title: 'Enterprise Data Integration',
      description: 'Custom web application for automotive dealership chain merging diverse data sources. Provided holistic operational insights driving organizational transformation in product lines and compensation.',
      tech: 'Custom Web Stack, Data Pipelines, Analytics',
    },
    {
      title: 'CENV',
      description: 'Open source CLI tool for managing applications, infrastructure, and configuration on AWS with CDK. Streamlines DevOps workflows and deployment processes.',
      tech: 'TypeScript, AWS CDK, CLI Development',
    },
    {
      title: '911 Inform',
      description: 'Active shooter notification system for public schools. Critical safety infrastructure enabling rapid response during emergencies.',
      tech: 'Real-time Systems, Emergency Response',
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
                  sx={{
                    p: 3,
                    height: '100px',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    transition: 'all 0.2s',
                    backgroundColor: 'hsl(210, 14%, 7%)',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: 2,
                      '& .industry-name': {
                        color: '#3399ff',
                      },
                    },
                  }}
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
            sx={(theme) => ({
              textAlign: 'center',
              py: 8,
              px: 4,
              bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
              borderRadius: 3,
              border: 'hsl(210, 14%, 7%) 1px solid',
            })}
          >
            <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
              Ready to Build Something Great?
            </Typography>
            <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>
              Let's discuss your project requirements and how we can help bring your vision to life.
            </Typography>
            <Typography variant="body1" sx={{ mt: 4, fontWeight: 600, color: 'primary.main' }}>
              Building production-ready applications since 2010
            </Typography>
          </Box>
        </Container>
      </Section>
      <Divider/>
    </React.Fragment>
  );
}
