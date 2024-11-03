import { styled } from '@mui/material/styles';
import Slider from '@mui/material/Slider';
import { useState } from 'react';

// Custom Slider with perspective on the track
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

export default function GrowingPerspectiveSlider() {
  const [sliderValue, setSliderValue] = useState(0);

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
