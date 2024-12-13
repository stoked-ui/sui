import * as React from 'react';

const ZoomCtrl = () => {
  const [zoomLevel, setZoomLevel] = React.useState(1); // Current zoom level
  const containerRef = React.useRef<HTMLDivElement>(null); // Reference to the zoomable div

  // Handle zoom changes
  const handleZoom = (delta: number) => {
    setZoomLevel(prevZoom => Math.min(Math.max(prevZoom + delta, 0.5), 3)); // Limit zoom level between 0.5 and 3
  };

  // Wheel event handler
  const handleWheel = (event: React.WheelEvent) => {
    if (event.ctrlKey) { // Zoom only when Ctrl is pressed
      event.preventDefault();
      const delta = -event.deltaY / 100; // Normalize deltaY
      handleZoom(delta);
    }
  };

  // Pinch gesture for touch devices
  const handleTouch = (() => {
    let initialDistance: number | null = null;

    return (event: React.TouchEvent) => {
      if (event.touches.length === 2) {
        // @ts-ignore
        const [touch1, touch2] = event.touches;

        // Calculate the distance between two touch points
        const distance = Math.sqrt(
          (touch2.clientX - touch1.clientX)**2 +
          (touch2.clientY - touch1.clientY)**2
        );

        if (initialDistance === null) {
          initialDistance = distance; // Store the initial pinch distance
        } else {
          const delta = (distance - initialDistance) / 200; // Normalize pinch delta
          handleZoom(delta);
          initialDistance = distance; // Update the distance
        }
      } else {
        initialDistance = null; // Reset when not pinching
      }
    };
  })();

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        onWheel={handleWheel} // Mouse wheel zoom
        onTouchMove={handleTouch} // Pinch zoom
        style={{
          width: '300px',
          height: '200px',
          backgroundColor: '#4caf50',
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center',
          transition: 'transform 0.1s ease-out',
        }}
      >
        <p style={{ color: 'white', textAlign: 'center', lineHeight: '200px' }}>
          Pinch or Scroll to Zoom
        </p>
      </div>
    </div>
  );
};

export default ZoomCtrl;
