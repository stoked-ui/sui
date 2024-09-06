import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { InfoCard } from '../InfoCard';

interface DesignResource {
  title: string;
  link: string;
  svg: React.ReactNode;
}

const content: DesignResource[] = [
  // ... existing data ...
];

export default function MaterialUIDesignResources() {
  return (
    <Grid container spacing={2}>
      {content.map(({ svg, title, link }) => (
        <Grid key={title} xs={12} sm={4}>
          <InfoCard classNameTitle="algolia-lvl3" link={link} title={title} svg={svg} dense />
        </Grid>
      ))}
    </Grid>
  );
}
