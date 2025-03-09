import * as React from 'react';
import { motion, useAnimationControls, useMotionValue, useTransform, AnimatePresence, animate } from 'framer-motion';
import { styled } from "@mui/material/styles";

// Motion-enabled container with consistent styling
const TriangleWrapper = styled('div')({
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  // Add a border to make the container visible during development
  // border: '1px dashed #ccc',
});

// Dot component for consistent styling
const Dot = styled(motion.div)(({ theme }) => ({
  position: 'absolute',
  width: '4px', // Increased size to make more visible
  height: '4px',
  borderRadius: '50%',
  backgroundColor: theme.palette.success.main,
  top: '50%',
  left: '50%',
  marginTop: '-2px', // Half height for centering
  marginLeft: '-2px', // Half width for centering
}));

function GrokLoader() {
  const controls = useAnimationControls();
  const progress = useMotionValue(0);

  // Create separate radius and rotation values for better control
  const radius = useMotionValue(120);
  const rotation = useMotionValue(0);

  React.useEffect(() => {
    // Start with visible dots at the expanded position
    radius.set(120);

    // Setup the animation cycles
    const radiusAnimation = animate(
      radius,
      [25, 5, 25, 25], // Make min radius larger (30 instead of 20)ad of 20)
      {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop",
        onRepeat: () => {
          radius.set(120);
        },
      }
    );

    const rotationAnimation = animate(
      rotation,
      [0, 60, 120, 120],
      {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop",
        onRepeat: () => {
          console.log('rotation', rotation.get());
          rotation.set(0);
        }
      }
    );

    // Scale animation for the dots
    controls.start({
      scale: [1, 4, 1, 1]
    }, {
      duration: 2,
      repeat: Infinity,
      repeatType: "loop",
    });

    return () => {
      radiusAnimation.stop();
      rotationAnimation.stop();
      controls.stop();
    };
  }, []);

  // Calculate dot positions based on angle and current radius
  const getPosition = (angle: number) => {
    const currentRadius = radius.get();
    const angleInRadians = (angle * Math.PI) / 180;
    return {
      x: Math.cos(angleInRadians) * currentRadius,
      y: Math.sin(angleInRadians) * currentRadius
    };
  };

  // Define angles for each corner of the triangle
  const topAngle = 270; // Top (0 degrees is to the right, so 270 is straight up)
  const bottomLeftAngle = 30; // Bottom left
  const bottomRightAngle = 150; // Bottom right

  return (
    <TriangleWrapper>
      <motion.div
        whileInView={{ opacity: 1 }}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transformOrigin: 'center',
          rotate: rotation,
        }}
        transition={{
          duration: 2,
          delay: 1,
        }}
        initial={{ rotate: 0 }}
      >
        {/* Using Dot component for each position */}
        <Dot
          whileInView={{ opacity: 1 }}
          style={{
            x: useTransform(radius, value => Math.cos(topAngle * Math.PI / 180) * value),
            y: useTransform(radius, value => Math.sin(topAngle * Math.PI / 180) * value),
          }}
          initial={{ scale: 1 }}
          animate={controls}
        />

        <Dot
          whileInView={{ opacity: 1 }}
          style={{
            x: useTransform(radius, value => Math.cos(bottomLeftAngle * Math.PI / 180) * value),
            y: useTransform(radius, value => Math.sin(bottomLeftAngle * Math.PI / 180) * value),
          }}
          initial={{ scale: 1 }}
          animate={controls}
        />

        <Dot
          whileInView={{ opacity: 1 }}
          style={{
            x: useTransform(radius, value => Math.cos(bottomRightAngle * Math.PI / 180) * value),
            y: useTransform(radius, value => Math.sin(bottomRightAngle * Math.PI / 180) * value),
          }}
          initial={{ scale: 1 }}
          animate={controls}
        />
      </motion.div>
    </TriangleWrapper>
  );
}

export default GrokLoader;

