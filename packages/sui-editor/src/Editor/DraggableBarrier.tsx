import * as React from 'react';
import { Slider } from '@mui/material';

const DraggableDivider = ({width}) => {
  const [dividerWidth, setDividerWidth] = React.useState(width);
  const [leftWidth, setLeftWidth] = React.useState(50); // Initial width of the left div
  const isDragging = React.useRef(false);
  const startX = React.useRef(0);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.clientX;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - startX.current;
    setLeftWidth((prevWidth) => Math.min(100, Math.max(0, prevWidth + (deltaX / window.innerWidth) * 100)));
    startX.current = e.clientX;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleSliderChange = (event, newValue) => {
    setDividerWidth(newValue);
  };

  return (
    <div style={{ display: 'flex', height: '300px', alignItems: 'stretch' }}>
      <div style={{ flex: `0 0 ${leftWidth}%`, backgroundColor: '#cfe8fc' }} />
      <div
        onMouseDown={handleMouseDown}
        style={{
          width: dividerWidth,
          backgroundColor: '#1976d2',
          cursor: 'ew-resize',
        }}
      />
      <div style={{ flex: `0 0 ${100 - leftWidth}%`, backgroundColor: '#ffcccb' }} />
      <Slider
        value={dividerWidth}
        min={1}
        max={8}
        step={1}
        onChange={handleSliderChange}
        style={{ width: '300px', margin: '20px' }}
      />
    </div>
  );
};

export default DraggableDivider;
