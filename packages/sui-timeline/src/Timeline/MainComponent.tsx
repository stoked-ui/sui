import React from 'react';
import { ScrollSync, ScrollSyncNode } from 'scroll-sync-react';
import CustomComponent from './CustomComponent';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

const Section = styled(Box)(({ theme }) => ({
  height: '150px',
  width: '100%',
  border: '1px solid black',
  overflowX: 'auto',
  backgroundImage: `repeating-linear-gradient(
    -45deg,
    transparent 0 10px,
    black 10px 20px
  )`,
  backgroundAttachment: 'local'
}));

const MainComponent = () => {
  return (
      <Box>
        <ScrollSyncNode>
          <Section>
            <div style={{ width: '1000px', height: '100%' }}>Section 1</div>
          </Section>
        </ScrollSyncNode>

        <ScrollSyncNode>
          <Section>
            <div style={{ width: '1500px', height: '100%' }}>Section 2</div>
          </Section>
        </ScrollSyncNode>

        <ScrollSyncNode>
          <Section>
            <div style={{ width: '8000px', height: '100%' }}>Section 3</div>
          </Section>
        </ScrollSyncNode>

        {/* CustomComponent with its own ScrollSync */}
        <CustomComponent />
      </Box>
  );
};

export default MainComponent;
