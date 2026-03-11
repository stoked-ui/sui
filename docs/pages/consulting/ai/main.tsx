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
      title: 'AI-Powered Product Development',
      description: 'Custom AI features integrated into your existing products. Chatbots, content generation, document processing, semantic search, recommendation engines, and intelligent automation. We build AI features that users actually love.',
    },
    {
      title: 'LLM Application Architecture',
      description: 'RAG (Retrieval-Augmented Generation) pipelines, vector databases (Pinecone, Weaviate, pgvector), prompt engineering, fine-tuning strategies, and multi-model orchestration. We architect LLM systems that are accurate, fast, and cost-effective.',
    },
    {
      title: 'AI Agent Development',
      description: 'Autonomous agents that reason, plan, and execute multi-step workflows. Tool use, function calling, memory systems, and human-in-the-loop patterns. Built on Claude, GPT-4, and open-source models.',
    },
    {
      title: 'AI Infrastructure & MLOps',
      description: 'Model deployment pipelines, A/B testing frameworks, cost optimization (token usage, caching, model routing), observability (LangSmith, Helicone), and guardrails for safe, reliable AI in production.',
    },
    {
      title: 'AI Strategy & Readiness Assessment',
      description: 'Where can AI create real value in your business? We audit your workflows, data assets, and technical stack to identify high-ROI AI opportunities — then build them.',
    },
    {
      title: 'AI Coding Agents & Developer Tools',
      description: 'We\'re building the future of software development with AI coding agents. Expertise in Claude Code, Cursor, and autonomous development workflows.',
    },
  ];

  const technologies = [
    { name: 'Claude (Anthropic)', detail: 'Frontier reasoning models' },
    { name: 'GPT-4/o1 (OpenAI)', detail: 'Advanced language models' },
    { name: 'Vercel AI SDK', detail: 'LLM application framework' },
    { name: 'LangChain / LlamaIndex', detail: 'Agent & RAG frameworks' },
    { name: 'Vector Databases', detail: 'Pinecone, Weaviate, pgvector' },
    { name: 'Python / FastAPI', detail: 'AI service backend' },
    { name: 'Prompt Engineering', detail: 'Optimized model performance' },
    { name: 'Fine-tuning', detail: 'Custom domain expertise' },
  ];

  return (
    <React.Fragment>
      <HeroContainer
        linearGradient
        left={
          <Box sx={{ textAlign: { xs: 'center', md: 'left' }, maxWidth: 500 }}>
            <Typography variant="h1" mb={1} color="text.primary">
              AI That<br />
              <GradientText>Ships.</GradientText>
            </Typography>
            <Typography color="text.secondary" mb={3}>
              The AI revolution isn&apos;t coming — it&apos;s here. But most businesses are drowning
              in hype and struggling to ship real AI-powered products. With 25+ years of
              production engineering experience and deep hands-on expertise with frontier
              AI models, Stoked Consulting bridges the gap between AI research and
              production-grade AI systems.
            </Typography>
            <Typography variant="body1" fontWeight="bold" color="text.primary">
              We don&apos;t do PowerPoint AI strategy. We build and ship AI products.
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
            AI and machine learning consulting to unlock intelligent capabilities in your products
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
            State-of-the-art AI and ML tools for building intelligent applications
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
              Make AI Work for Your Business
            </Typography>
            <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
              Let&apos;s identify the right AI opportunities and build solutions that deliver real, measurable impact.
            </Typography>
            <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary', fontStyle: 'italic' }}>
              Why Stoked Consulting for AI? Brian Stoker combines 25+ years of production engineering with deep, hands-on AI expertise — including building an AI-powered SaaS platform (stokd.cloud) from the ground up. We don&apos;t just prototype. We ship.
            </Typography>
            <Typography variant="body1" sx={{ mt: 4, fontWeight: 600, color: 'primary.main' }}>
              Building intelligent systems with cutting-edge AI
            </Typography>
          </Box>
        </Container>
      </Section>
      <Divider />
    </React.Fragment>
  );
}
