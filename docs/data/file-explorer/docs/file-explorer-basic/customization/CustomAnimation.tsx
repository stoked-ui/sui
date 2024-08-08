import * as React from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import { TransitionProps } from '@mui/material/transitions';
import { FileExplorerBasic } from '@stoked-ui/file-explorer/FileExplorerBasic';
import { FileElement, FileElementProps } from '@stoked-ui/file-explorer/FileElement';
import { useSpring, animated } from '@react-spring/web';

function TransitionComponent(props: TransitionProps) {
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

const CustomTreeItem = React.forwardRef(
  (props: FileElementProps, ref: React.Ref<HTMLLIElement>) => (
    <FileElement
      {...props}
      slots={{ groupTransition: TransitionComponent, ...props.slots }}
      ref={ref}
    />
  ),
);

export default function CustomAnimation() {
  return (
    <Box sx={{ minHeight: 352, minWidth: 250 }}>
      <FileExplorerBasic defaultExpandedItems={['Notes']}>
        <CustomTreeItem name={"Notes"}>
          <CustomTreeItem name="doc.pdf" />
          <CustomTreeItem name="notes.txt" />
        </CustomTreeItem>
        <CustomTreeItem name={"Images"}>
          <CustomTreeItem name={"logo.png"} />
          <CustomTreeItem name={"favicon.ico"} />
        </CustomTreeItem>
        <CustomTreeItem name={"Movies"}>
          <CustomTreeItem name={"feature.mp4"} />
        </CustomTreeItem>
        <CustomTreeItem name={"Data"}>
          <CustomTreeItem name={"client-data.xls"} />
        </CustomTreeItem>
      </FileExplorerBasic>
    </Box>
  );
}

