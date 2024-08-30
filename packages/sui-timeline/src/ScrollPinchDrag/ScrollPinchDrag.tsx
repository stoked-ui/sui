import * as React from 'react';
import { useGesture } from '@use-gesture/react';
import { useSpring, animated } from '@react-spring/web';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

const Container = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  touchAction: 'auto', // Prevents default touch behaviors on mobile
  overscrollBehavior: 'none',
}));

const ZoomableBox = styled(animated(Box))((theme) => ({
  width: 300,
  height: 300,
  minHeight: 100,
  minWidth: 100,
  backgroundColor: theme.theme.palette.background.default,
  color: theme.theme.palette.text.primary,
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
}));

const ScrollPinchDrag: React.FC = () => {
  const [springProps, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
    rotateZ: 0,
  }));

  const initialSize = 300; // Initial size of the box (width/height)
  const minSize = 100; // Minimum size (100x100 pixels)
  const minScale = minSize / initialSize; // Calculate the minimum scale

  const bind = useGesture(
    {
      onDrag: ({ offset: [x, y] }) => api.start({ x, y }),
      onPinch: ({ offset: [d, a] }) => {
        const scale = Math.max(minScale, d / 200); // Ensure scale doesn't go below minScale
        api.start({ scale, rotateZ: a });
      },
    },
    {
      drag: { from: () => [springProps.x.get(), springProps.y.get()] },
      pinch: { scaleBounds: { min: minScale, max: 4 }, from: () => [springProps.scale.get(), springProps.rotateZ.get()] },
    }
  );

  // Custom wheel handler
  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault(); // Prevent default scroll behavior
    const scale = Math.max(minScale, springProps.scale.get() + event.deltaY / 200); // Ensure scale doesn't go below minScale
    api.start({ scale });
  };

  return (
    <Container>
      <ZoomableBox {...bind()} style={springProps} onWheel={handleWheel}>
        Pinch, Drag, or Scroll Me
      </ZoomableBox>
    </Container>
  );
};

export default ScrollPinchDrag;
