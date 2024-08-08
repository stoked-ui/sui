import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import InstallDesktopRoundedIcon from '@mui/icons-material/InstallDesktopRounded';
import WebRoundedIcon from '@mui/icons-material/WebRounded';
import DrawRoundedIcon from '@mui/icons-material/DrawRounded';
import PlayCircleFilledWhiteRoundedIcon from '@mui/icons-material/PlayCircleFilledWhiteRounded';
import DesignServicesRoundedIcon from '@mui/icons-material/DesignServicesRounded';
import { InfoCard } from '@stoked-ui/docs/InfoCard';

const content = [
  {
    title: 'Installation',
    description: 'Add Stoked UI to your project with a few commands.',
    link: '/stoked-ui/docs/getting-started/installation/',
    icon: <InstallDesktopRoundedIcon color="primary" />,
  },
  {
    title: 'Usage',
    description: 'Learn the basics about the File Explorer components.',
    link: '/stoked-ui/docs/getting-started/usage/',
    icon: <DrawRoundedIcon color="primary" />,
  },
  {
    title: 'Example projects',
    description: 'A collection of boilerplates to jumpstart your next project.',
    link: '/stoked-ui/docs/getting-started/example-projects/',
    icon: <PlayCircleFilledWhiteRoundedIcon color="primary" />,
  },
  {
    title: 'Customizing components',
    description: 'Learn about the available customization methods.',
    link: '/stoked-ui/docs/getting-started/file-explorer-customization/',
    icon: <DesignServicesRoundedIcon color="primary" />,
  },
];

export default function MaterialStartingLinksCollection() {
  return (
    <Grid container spacing={2}>
      {content.map(({ icon, title, description, link }) => (
        <Grid key={title} xs={10} sm={5} md={5}>
          <InfoCard
            classNameTitle="algolia-lvl3"
            classNameDescription="algolia-content"
            link={link}
            title={title}
            icon={icon}
            description={description}
          />
        </Grid>
      ))}
    </Grid>
  );
}
