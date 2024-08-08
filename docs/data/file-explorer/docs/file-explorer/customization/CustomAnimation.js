import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';

import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';
import { NestedFiles } from 'docs/src/components/fileExplorer/data';
import { useSpring, animated } from '@react-spring/web';

function TransitionComponent(props) {
  const style = useSpring({
    to: {
      opacity: props.in ? 1 : 0,
      transform: `translate3d(${props.in ? 0 : 20}px,0,0)`,
    },
  });

  return (
    <animated.div style={style}>
      <Collapse {...props} />
    </animated.div>
  );
}

TransitionComponent.propTypes = {
  /**
   * Show the component; triggers the enter or exit states
   */
  in: PropTypes.bool,
};

export default function CustomAnimation() {
  return (
    <Box sx={{ minHeight: 352, minWidth: 250 }}>
      <FileExplorer
        defaultExpandedItems={['Notes']}
        slotProps={{ item: { slots: { groupTransition: TransitionComponent } } }}
        items={NestedFiles}
      />
    </Box>
  );
}
