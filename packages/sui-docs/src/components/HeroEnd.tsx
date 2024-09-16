import * as React from 'react';
import { useInView } from 'react-intersection-observer';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import Section from '../Layouts/Section';

function Placeholder() {
  return <Box sx={{ height: { xs: 616 - 48 * 2, sm: 438 - 80 * 2, md: 461 - 96 * 2 } }} />;
}
// const StartToday = dynamic(() => import('./StartToday'), { loading: Placeholder });

export default function HeroEnd({ StartToday }: { StartToday: React.JSX.ElementType} ) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0,
    rootMargin: '500px',
  });
  return (
    <Box
      ref={ref}
      sx={(theme) => ({
        background: `linear-gradient(180deg, #FFF 50%, 
          ${theme.palette.primary[50]} 100%)
        `,
        ...theme.applyDarkStyles({
          background: `linear-gradient(180deg, ${
            theme.palette.primaryDark[900]
          } 50%,
          ${alpha(theme.palette.primary[900], 0.2)} 100%)
          `,
        }),
      })}
    >
      <Section bg="transparent" cozy>
        {inView ? <StartToday /> : <Placeholder />}
      </Section>
    </Box>
  );
}
