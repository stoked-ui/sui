import * as React from 'react';
import Typography from '@mui/material/Typography';
import Section from '@stoked-ui/docs/Layouts/Section';
import SectionHeadline from '@stoked-ui/docs/typography/SectionHeadline';
import GradientText from '@stoked-ui/docs/typography/GradientText';

export default function HeroPricing() {
  return (
    <Section cozy>
      <SectionHeadline
        alwaysCenter
        overline="Pricing"
        title={
          <Typography variant="h2" component="h1">
            Start using SUI&apos;s products <GradientText>for free!</GradientText>
          </Typography>
        }
        description="Switch to a commercial plan to access advanced features & technical support."
      />
    </Section>
  );
}
