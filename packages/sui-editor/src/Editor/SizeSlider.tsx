/**
 * Custom Slider with perspective on the track
 * @typedef PerspectiveSliderProps
 * @property {number} value - The current value of the slider
 * @property {function} onChange - Function to handle slider value change
 * @property {number} min - The minimum value of the slider
 * @property {number} max - The maximum value of the slider
 * @property {string} valueLabelDisplay - Display option for the value label
 * @property {object} componentsProps - Custom styles for thumb and track components
 */

import { styled } from '@mui/material/styles';
import Slider from '@mui/material/Slider';
import { useState } from 'react';

/**
 * Custom Slider component with perspective effect on the track
 * @returns {JSX.Element} JSX element representing the GrowingPerspectiveSlider component
 */
const PerspectiveSlider = styled(Slider)(({ theme }) => ({
  height: 7,
  position: 'relative',

  '& .MuiSlider-track': {
    width: '200px',  // Fixed width
    height: '7px',   // Fixed height
    transform: 'perspective(2px) rotateY(-1deg)',
    margin: '10px 0',
    position: 'absolute',
    backgroundColor: '#3f51b5',
    transition: 'width 0.3s ease',
  },

  '& .MuiSlider-rail': {
    backgroundColor: 'transparent', // Making rail invisible
  },

  '& .MuiSlider-thumb': {
    width: 12,
    height: 12,
    transition: 'width 0.3s, height 0.3s',
  },
}));

/**
 * Functional component representing a GrowingPerspectiveSlider
 * @returns {JSX.Element} JSX element representing the GrowingPerspectiveSlider component
 */
export default function GrowingPerspectiveSlider() {
  const [sliderValue, setSliderValue] = useState(0);

  /**
   * Event handler for slider value change
   * @param {object} event - The event object
   * @param {number} newValue - The new value of the slider
   */
  const handleSliderChange = (event, newValue) => {
    setSliderValue(newValue);
  };

  return (
    <PerspectiveSlider
      value={sliderValue}
      onChange={handleSliderChange}
      min={0}
      max={100}
      valueLabelDisplay="auto"
      componentsProps={{
        thumb: {
          style: {
            width: `${12 + sliderValue / 10}px`,
            height: `${12 + sliderValue / 10}px`,
          },
        },
        track: {
          style: {
            width: `${20 + sliderValue * 1.8}px`,  // Dynamically growing width based on value
          },
        },
      }}
    />
  );
}