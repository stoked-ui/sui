import React from 'react';
import { ScrollSyncNode } from 'scroll-sync-react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

const Section = styled(Box)(({ theme }) => ({
  height: '150px',
  border: '1px solid black',
  overflowX: 'auto',
  backgroundImage: `repeating-linear-gradient(
    -45deg,
    transparent 0 10px,
    red 10px 20px
  )`,
  backgroundAttachment: 'local'
}));

const CustomComponent: React.FC = () => {
  return (
    <Box display="flex" flexDirection="column" justifyContent="space-between">
      <ScrollSyncNode>
        <Section style={{ width: '100%' }}>
          <div style={{ width: '12000px', height: '100%' }}>Custom Section 1</div>
        </Section>
      </ScrollSyncNode>

      <ScrollSyncNode>
        <Section style={{ width: '100%' }}>
          <div style={{ width: '6000px', height: '100%' }}>Custom Section 2</div>
        </Section>
      </ScrollSyncNode>

      <ScrollSyncNode>
        <Section style={{ width: '100%' }}>
          <div style={{ width: '2000px', height: '100%' }}>Custom Section 3</div>
        </Section>
      </ScrollSyncNode>
    </Box>
  );
};

export default CustomComponent;
