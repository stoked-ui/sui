import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';

import { FileExplorerBasic } from '@stoked-ui/file-explorer/FileExplorerBasic';
import { FileElement } from '@stoked-ui/file-explorer/FileElement';
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

const CustomTreeItem = React.forwardRef((props, ref) => (
  <FileElement
    {...props}
    slots={{ groupTransition: TransitionComponent, ...props.slots }}
    ref={ref}
  />
));

CustomTreeItem.propTypes = {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots: PropTypes.shape({
    collapseIcon: PropTypes.elementType,
    endIcon: PropTypes.elementType,
    expandIcon: PropTypes.elementType,
    groupTransition: PropTypes.elementType,
    icon: PropTypes.elementType,
  }),
};

export default function CustomAnimation() {
  return (
    <Box sx={{ minHeight: 352, minWidth: 250 }}>
      <FileExplorerBasic defaultExpandedItems={['Notes']}>
        <CustomTreeItem name={'Notes'}>
          <CustomTreeItem name="doc.pdf" />
          <CustomTreeItem name="notes.txt" />
        </CustomTreeItem>
        <CustomTreeItem name={'Images'}>
          <CustomTreeItem name={'logo.png'} />
          <CustomTreeItem name={'favicon.ico'} />
        </CustomTreeItem>
        <CustomTreeItem name={'Movies'}>
          <CustomTreeItem name={'feature.mp4'} />
        </CustomTreeItem>
        <CustomTreeItem name={'Data'}>
          <CustomTreeItem name={'client-data.xls'} />
        </CustomTreeItem>
      </FileExplorerBasic>
    </Box>
  );
}
