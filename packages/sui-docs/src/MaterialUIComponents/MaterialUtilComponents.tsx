import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { InfoCard } from '@mui/docs/InfoCard';
import HighlightAltRoundedIcon from '@mui/icons-material/HighlightAltRounded';
import CssRoundedIcon from '@mui/icons-material/CssRounded';
import DnsRoundedIcon from '@mui/icons-material/DnsRounded';
import PictureInPictureRoundedIcon from '@mui/icons-material/PictureInPictureRounded';
import MenuOpenRoundedIcon from '@mui/icons-material/MenuOpenRounded';
import MoveUpRoundedIcon from '@mui/icons-material/MoveUpRounded';
import TextFieldsRoundedIcon from '@mui/icons-material/TextFieldsRounded';
import FlipToFrontRoundedIcon from '@mui/icons-material/FlipToFrontRounded';
import ZoomOutMapRoundedIcon from '@mui/icons-material/ZoomOutMapRounded';
import DevicesOtherRoundedIcon from '@mui/icons-material/DevicesOtherRounded';

interface UtilComponent {
  title: string;
  link: string;
  icon: React.ReactNode;
}

const utilComponents: UtilComponent[] = [
  // ... existing data ...
];

export default function MaterialUtilComponents() {
  return (
    <Grid container spacing={2}>
      {utilComponents.map(({ icon, title, link }) => (
        <Grid key={title} xs={12} sm={4}>
          <InfoCard dense link={link} title={title} icon={icon} />
        </Grid>
      ))}
    </Grid>
  );
}
