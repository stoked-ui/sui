import * as React from 'react';
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { styled } from "@mui/material/styles";
import Section from "docs/src/layouts/Section";
import GradientText from "docs/src/components/typography/GradientText";
import HeroContainer from "docs/src/layouts/HeroContainer";
import ConsultingProofStrip from "docs/src/components/home/ConsultingProofStrip";
import AuditBotTrigger from "docs/src/modules/auditBot/channels/web/components/AuditBotTrigger";
import AuditBot from "docs/src/modules/auditBot/channels/web/components/AuditBot";

const ServiceCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  borderRadius: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    '& .service-title': {
      color: '#3399ff',
    },
  },
  ...theme.applyDarkStyles({
    backgroundColor: theme.palette.primaryDark[800],
    borderColor: theme.palette.primaryDark[700],
  }),
}));

export default function Main() {
  const [auditOpen, setAuditOpen] = React.useState(false);
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || '';
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
      description: 'Autonomous agents that reason, plan, and execute multi-step workflows. Tool use, function calling, memory systems, and human-in-the-loop patterns. Built on Claude, OpenAI, and open-source models.',
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
    {
      title: 'Local Model Deployments',
      description: 'Llama, Mistral, and Qwen running on hardware you own. Sensitive data never leaves your network, costs collapse to electricity, and your business does not become a downstream dependency of someone else\'s SaaS.',
    },
    {
      title: 'Custom & Fine-Tuned Models',
      description: 'When a generic model keeps getting your domain wrong, we fine-tune a small one that gets it right. Cheaper to run, faster to respond, and trained on the way your business actually talks.',
    },
    {
      title: 'Frontier Model Integrations',
      description: 'Claude, GPT-class, and Gemini wired into your systems where their judgement actually earns the cost. Tight prompts, retrieval grounding, and hard guardrails so the smart model stays on-task.',
    },
  ];

  const technologies = [
    { name: 'Claude (Anthropic)', detail: 'Frontier reasoning models' },
    { name: 'OpenAI models', detail: 'Advanced language models' },
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
            <Typography variant="body1" fontWeight="bold" color="text.primary" sx={{ mb: 3 }}>
              We don&apos;t do PowerPoint AI strategy. We build and ship AI products.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <Button
                size="large"
                variant="contained"
                endIcon={<KeyboardArrowRightIcon />}
                onClick={() => setAuditOpen(true)}
                sx={{
                  backgroundColor: '#3399ff',
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '1.05rem',
                  px: 3,
                  py: 1.25,
                  '&:hover': { backgroundColor: '#1976d2' },
                }}
              >
                Get a free AI Readiness Audit
              </Button>
              <Button
                size="large"
                variant="outlined"
                href="https://stokd.cloud"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ textTransform: 'none', fontWeight: 700, fontSize: '1.05rem', px: 3, py: 1.25 }}
              >
                See stokd.cloud
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
              5-minute audit · talk to an AI agent Brian built · runs on his own infra
            </Typography>
          </Box>
        }
        rightSx={{
          p: { xs: 3, md: 4 },
          ml: { xs: 0, md: 2 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        right={
          <AuditBotTrigger variant="hero" onOpen={() => setAuditOpen(true)} />
        }
      />
      <Divider />
      <ConsultingProofStrip />
      <Divider />

      {/* Small Business AI Section */}
      <Section sx={{ bgcolor: "background.paper" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="overline"
              sx={{ color: '#3399ff', fontWeight: 700, letterSpacing: 2 }}
            >
              AI FOR SMALL BUSINESS
            </Typography>
            <Typography
              variant="h2"
              sx={{
                mt: 1,
                mb: 2,
                fontWeight: 700,
                fontSize: { xs: '2rem', md: '2.75rem' },
                lineHeight: 1.15,
              }}
            >
              Two weeks of work can change the<br />
              <GradientText>arc of your business.</GradientText>
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 820, mx: 'auto', fontSize: '1.1rem', lineHeight: 1.65 }}
            >
              Every small business is sitting on a stack of repeated work — quotes drafted from scratch every week,
              inboxes triaged by hand, a knowledge base nobody can search, the same five questions answered fifty
              times a day. None of that is the work that grows your company. We come in, find the three places
              an agent or model would erase the most pain, and ship them. Real systems, not slide decks.
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ mb: 6 }}>
            {[
              {
                hours: '20+ hrs/week',
                title: 'Hours back in your week',
                detail: 'A single well-placed agent — triaging email, drafting quotes, processing invoices — routinely returns half a workweek to the owner. That is the entire ROI conversation.',
              },
              {
                hours: '2–4 weeks',
                title: 'Time to first production win',
                detail: 'We pick one painful workflow and ship a working system inside a month. No 6-month roadmap, no quarterly steering committee. One thing, done well, paying for itself.',
              },
              {
                hours: '$0 → ~$200/mo',
                title: 'What it actually costs to run',
                detail: 'Most small-business agents we build cost less than a phone bill to operate. Local models for the sensitive stuff, frontier models where they earn it, careful caching everywhere else.',
              },
            ].map((stat) => (
              <Grid item xs={12} md={4} key={stat.title}>
                <Box
                  sx={[
                    {
                      p: 3,
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
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#3399ff', mb: 1, fontSize: '1.75rem' }}>
                    {stat.hours}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.detail}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Typography
            variant="h4"
            sx={{ textAlign: 'center', fontWeight: 700, mt: 8, mb: 1 }}
          >
            How we work with small business
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ textAlign: 'center', mb: 5, maxWidth: 760, mx: 'auto' }}
          >
            A short, structured engagement designed for owners who don&apos;t have a CTO and don&apos;t want a year-long project.
          </Typography>

          <Grid container spacing={3}>
            {[
              {
                step: '01',
                title: 'Quiet observation week',
                description: 'A few calls and a sit-down with your team. We map the work that actually happens — not the org chart — and identify the manual loops, judgement calls, and "we have always done it this way" patterns that an agent or model can take over.',
              },
              {
                step: '02',
                title: 'Opportunity ranking',
                description: 'You get a written list of opportunities, ranked by hours saved, cost to build, risk, and disruption. We are blunt: some ideas are not worth doing, and we say so. The goal is two or three obvious wins, not twenty maybes.',
              },
              {
                step: '03',
                title: 'Right model for the job',
                description: 'For each pick we choose the model honestly. Sensitive data and predictable shapes go to local models (Llama, Mistral, Qwen) running on a small server you own. High-judgement work goes to frontier models (Claude, GPT) with tight prompts and guardrails. Repetitive, specialized tasks get a small fine-tune.',
              },
              {
                step: '04',
                title: 'Ship and stand it up',
                description: 'We build it, integrate it into the tools your team already uses (email, Slack, your CRM, a Google sheet — whatever you actually open), and stay on long enough to watch it survive contact with the real world. Then we hand you the keys.',
              },
            ].map((s) => (
              <Grid item xs={12} sm={6} key={s.step}>
                <Box
                  sx={[
                    {
                      p: 3,
                      height: '100%',
                      borderRadius: 2,
                      border: 1,
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      display: 'flex',
                      gap: 2,
                    },
                    (theme) => theme.applyDarkStyles({
                      bgcolor: 'primaryDark.800',
                      borderColor: 'primaryDark.700',
                    }),
                  ]}
                >
                  <Typography
                    sx={{
                      fontFamily: 'monospace',
                      color: '#3399ff',
                      fontWeight: 700,
                      fontSize: '1.5rem',
                      lineHeight: 1,
                      minWidth: 48,
                    }}
                  >
                    {s.step}
                  </Typography>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {s.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {s.description}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Section>

      <Divider />

      {/* Where AI Helps - opportunity grid */}
      <Section bg="gradient">
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              mb: 2,
              fontWeight: 700,
              textAlign: 'center',
              fontSize: { xs: '2rem', md: '2.5rem' },
              color: "#3399ff",
            }}
          >
            Low-hanging fruit, ripe for picking
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 6, textAlign: 'center', maxWidth: 800, mx: 'auto' }}
          >
            The opportunities we see again and again across small businesses. If one of these sounds painfully familiar, we should talk.
          </Typography>
          <Grid container spacing={3} rowSpacing={3} sx={{ pb: 4 }}>
            {[
              { name: 'Inbox & lead triage', detail: 'Auto-classify, summarize, and draft replies for incoming customer email — owner just hits send.' },
              { name: 'Quote & proposal drafting', detail: 'Generate first-pass quotes from a short call recording or intake form. Cuts a 45-minute task to five.' },
              { name: 'Document & invoice processing', detail: 'Pull line items, totals, and dates out of PDFs and photos and drop them into your accounting tool.' },
              { name: 'Searchable internal knowledge', detail: 'Turn your Drive, SOPs, and past tickets into a question-and-answer system every employee can use.' },
              { name: 'Customer support deflection', detail: 'A grounded chat agent that answers the same five questions while only escalating the new ones.' },
              { name: 'Scheduling & follow-up', detail: 'Agents that book, confirm, and nudge — without anybody on your team copy-pasting templates again.' },
              { name: 'Voice-note to system-of-record', detail: 'Field tech talks for 30 seconds, the work order, the photos, and the next steps land in the right place.' },
              { name: 'Reporting & weekly recap', detail: 'Pull numbers from your tools every Monday and write the recap your team would write — in their voice.' },
              { name: 'Quality, compliance & review', detail: 'Audit calls, contracts, or chats against your policy and flag the few that need a human eye.' },
            ].map((op) => (
              <Grid item xs={12} sm={6} md={4} key={op.name}>
                <Box
                  sx={[
                    {
                      px: 3,
                      py: 2.5,
                      minHeight: 130,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: 2,
                      },
                    },
                    (theme) => theme.applyDarkStyles({
                      bgcolor: 'primaryDark.800',
                      borderColor: 'primaryDark.700',
                    }),
                  ]}
                >
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    {op.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {op.detail}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Section>

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
      <AuditBot
        open={auditOpen}
        onClose={() => setAuditOpen(false)}
        playbook="ai-readiness"
        calendlyUrl={calendlyUrl}
      />
    </React.Fragment>
  );
}
