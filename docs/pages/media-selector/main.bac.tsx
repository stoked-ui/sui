import * as React from 'react';
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Hero from "../../src/components/home/HeroMediaSelector";

export default function MainBac () {
  return (
    <React.Fragment>
      <Hero/>
      <Box sx={{ height: '112px' }}/>
      <Divider/>
    </React.Fragment>
  );
}
