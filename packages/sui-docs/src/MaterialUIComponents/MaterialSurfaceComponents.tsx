import * as React from 'react';
import Grid from '@mui/material/Grid';
import ComponentShowcaseCard from '../components/action/ComponentShowcaseCard';

interface SurfaceComponent {
  name: string;
  srcLight: string;
  srcDark: string;
  link: string;
  md1: boolean;
  md2: boolean;
  md3: boolean;
  noGuidelines: boolean;
}

const surfaceComponents: SurfaceComponent[] = [
  // ... existing data ...
];

export default function MaterialSurfaceComponents() {
  return (
    <Grid container spacing={2} sx={{ pt: 1 }}>
      {surfaceComponents.map(({ name, link, srcLight, srcDark, md1, md2, md3, noGuidelines }) => (
        <Grid item xs={12} sm={4} sx={{ flexGrow: 1 }} key={name}>
          <ComponentShowcaseCard
            link={link}
            name={name}
            srcLight={srcLight}
            srcDark={srcDark}
            md1={md1}
            md2={md2}
            md3={md3}
            noGuidelines={noGuidelines}
          />
        </Grid>
      ))}
    </Grid>
  );
}
