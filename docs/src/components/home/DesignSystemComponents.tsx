import * as React from 'react';
import dynamic from 'next/dynamic';
import { useInView } from 'react-intersection-observer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Section from '@stoked-ui/docs/Layouts/Section';
import GradientText from '@stoked-ui/docs/typography/GradientText';
import SectionHeadline from '@stoked-ui/docs/typography/SectionHeadline';

function Placeholder() {
  return (
    <Box
      sx={(theme) => ({
        height: { xs: 1484, sm: 825, md: 601 },
        borderRadius: 1,
        bgcolor: 'grey.100',
        ...theme.applyDarkStyles({
          bgcolor: 'primaryDark.900',
        }),
      })}
    />
  );
}

const MaterialDesignComponents = dynamic(() => import('./MaterialDesignComponents'), {
  loading: Placeholder,
});

export default function DesignSystemComponents() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0,
    rootMargin: '500px',
  });
  return (
    <Section ref={ref} cozy>
      <SectionHeadline
        alwaysCenter
        overline="Production-ready components"
        title={
          <Typography variant="h2">
            Beautiful and powerful,
            <br /> <GradientText>right out of the box</GradientText>
          </Typography>
        }
      />
      {inView ? <MaterialDesignComponents /> : <Placeholder />}
    </Section>
  );
}
