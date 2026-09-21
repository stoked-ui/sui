import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import GradientText from 'docs/src/components/typography/GradientText';
import HeroContainer from 'docs/src/layouts/HeroContainer';
import ConsultingHeroStill from 'docs/src/components/home/ConsultingHeroStill';

export default function Hero() {
  return (
    <HeroContainer
      linearGradient
      left={
        <Box sx={{ textAlign: { xs: 'center', md: 'left' }, maxWidth: 500 }}>
          <Typography variant="h1" mb={1} color="text.primary">
            Full Stack<br/>
            <GradientText>Consulting</GradientText>
          </Typography>
          <Typography color="text.secondary" mb={3}>
            Expert software engineering consulting for greenfield solutions, legacy modernization, and cloud infrastructure. Specializing in full stack development with React, Next.js, Angular, Node.js, Python, and C#. Building production-ready applications with AWS, GCP, and modern IaC tools since 2010.
          </Typography>
        </Box>
      }
      rightSx={{
        p: { xs: 2, md: 3 },
        ml: { md: 2 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        '&& *': {
          fontFamily: ['"IBM Plex Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'].join(
            ',',
          ),
        },
      }}
      right={
        <ConsultingHeroStill discipline="full-stack" />
      }
    />
  );
}
