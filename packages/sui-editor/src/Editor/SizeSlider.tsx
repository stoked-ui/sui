import { styled } from '@mui/material/styles';
import Slider from '@mui/material/Slider';
import { useState } from 'react';

/**
 * Custom Slider component with perspective on the track.
 *
 * @description This slider has a unique feature - it rotates and changes size
 *              as you move the thumb along its track, giving a sense of depth.
 */
const PerspectiveSlider = styled(Slider)(({ theme }) => ({
  height: 7,
  position: 'relative',

  /**
   * Styles for the slider's track.
   *
   * @description The track is given a fixed width and height, and rotates
   *              around its center point using perspective and Y-axis rotation.
   */
  '& .MuiSlider-track': {
    width: '200px',  // Fixed width
    height: '7px',   // Fixed height
    transform: 'perspective(2px) rotateY(-1deg)',
    margin: '10px 0',
    position: 'absolute',
    backgroundColor: '#3f51b5',
    transition: 'width 0.3s ease',
  },

  /**
   * Styles for the slider's rail.
   *
   * @description The rail is made invisible to avoid visual distraction.
   */
  '& .MuiSlider-rail': {
    backgroundColor: 'transparent', // Making rail invisible
  },

  /**
   * Styles for the slider's thumb.
   *
   * @description The thumb changes size and position dynamically as you move
   *              it along its track, creating a sense of depth.
   */
  '& .MuiSlider-thumb': {
    width: 12,
    height: 12,
    transition: 'width 0.3s, height 0.3s',
  },
}));

/**
 * GrowingPerspectiveSlider component.
 *
 * @description This component demonstrates the usage of the PerspectiveSlider
 *             and includes a state variable to track its current value.
 *
 * @returns {JSX.Element} The rendered slider component.
 */
export default function GrowingPerspectiveSlider() {
  const [sliderValue, setSliderValue] = useState(0);

  /**
   * Handles changes to the slider's value.
   *
   * @description Updates the state variable with the new value and recalculates
   *              the thumb's size and position based on its current value.
   *
   * @param {object} event - The change event object.
   * @param {number} newValue - The new slider value.
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