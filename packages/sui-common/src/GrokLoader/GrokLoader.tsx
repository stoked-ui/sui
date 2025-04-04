/**
 * @class TriangleWrapper
 * @description A styled container for the triangle loading animation.
 */
const TriangleWrapper = styled('div')({
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  // border: '1px dashed #ccc',
});

/**
 * @class Dot
 * @description A styled dot component for the triangle loading animation.
 */
const Dot = styled(motion.div)(({ theme }) => ({
  position: 'absolute',
  width: '4px', 
  height: '4px',
  borderRadius: '50%',
  backgroundColor: theme.palette.success.main,
  top: '50%',
  left: '50%',
  marginTop: '-2px', 
  marginLeft: '-2px', 
}));

/**
 * @class GrokLoader
 * @description A React component that displays a triangle loading animation.
 * @returns {JSX.Element} The rendered component.
 */
function GrokLoader() {
  /**
   * @type {useAnimationControls}
   * @description An animation controls object to manage the animations.
   */
  const controls = useAnimationControls();
  
  /**
   * @type {useMotionValue<number>}
   * @description A motion value for the radius of the triangle.
   */
  const progress = useMotionValue(0);

  // Create separate radius and rotation values for better control
  /**
   * @type {useMotionValue<number>}
   * @description A motion value for the radius of the triangle.
   */
  const radius = useMotionValue(120);
  
  /**
   * @type {useMotionValue<number>}
   * @description A motion value for the rotation of the triangle.
   */
  const rotation = useMotionValue(0);

  React.useEffect(() => {
    // Start with visible dots at the expanded position
    radius.set(120);

    // Setup the animation cycles
    const radiusAnimation = animate(
      radius,
      [25, 5, 25, 25], 
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

  /**
   * @param {number} angle 
   * @description Calculates the position of a dot based on its angle and current radius.
   */
  const getPosition = (angle: number) => {
    const currentRadius = radius.get();
    const angleInRadians = (angle * Math.PI) / 180;
    return {
      x: Math.cos(angleInRadians) * currentRadius,
      y: Math.sin(angleInRadians) * currentRadius
    };
  };

  // Define angles for each corner of the triangle
  /**
   * @type {number}
   * @description The angle for the top corner of the triangle.
   */
  const topAngle = 270; 

  /**
   * @type {number}
   * @description The angle for the bottom left corner of the triangle.
   */
  const bottomLeftAngle = 150;

  /**
   * @type {number}
   * @description The angle for the bottom right corner of the triangle.
   */
  const bottomRightAngle = 30;

  return (
    <TriangleWrapper>
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
    </TriangleWrapper>
  );
}

export default GrokLoader;