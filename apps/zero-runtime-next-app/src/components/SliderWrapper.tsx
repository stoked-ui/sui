'use client';
import * as React from 'react';
import { styled } from '@mui/zero-runtime';
import Slider from './Slider/ZeroSlider';
import { HalfWidth } from './Grid';

const Button = styled('button', {
  name: 'MuiButton',
  slot: 'Root',
})(
  'color:red',
  ({ theme }: any) => ({
    fontFamily: 'sans-serif',
    backgroundColor: [theme.palette.primary.main, 'text.primary', 'background.paper'],
  }),
  {
    fontFamily: 'sans-serif',
    // p: (props: any) => (props.isRed ? 10 : 20),
    color: (props: any) => (props.isRed ? 'primary.main' : 'secondary.main'),
  },
);

const ShowCaseDiv = styled('div')({
  [`.${Button}`]: {
    color: '#f94564',
  },
});

export default function SliderWrapper() {
  const [count, setCount] = React.useState(0);
  const [value, setValue] = React.useState(50);
  const [isColorPrimary, setIsColorPrimary] = React.useState(true);
  const [size, setSize] = React.useState('medium');
  const [showMarks, setShowMarks] = React.useState(true);
  const [isTrackInverted, setIsTrackInverted] = React.useState(false);
  const [disabled, setDisabled] = React.useState(false);
  const [isHorizontal, setIsHorizontal] = React.useState(true);

  return (
    <React.Fragment>
      <Button isRed={count % 2 === 1} onClick={() => setCount(count + 1)}>
        Click Count {count}
      </Button>
      <ShowCaseDiv>
        <Button>This button&apos;s text color has been overridden.</Button>
      </ShowCaseDiv>
      <div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={isColorPrimary}
              onChange={() => setIsColorPrimary(!isColorPrimary)}
            />
            Toggle Color: {isColorPrimary ? 'Primary' : 'Secondary'}
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={isTrackInverted}
              onChange={() => setIsTrackInverted(!isTrackInverted)}
            />
            Track type: {isTrackInverted ? 'Inverted' : 'Normal'}
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={isHorizontal}
              onChange={() => setIsHorizontal(!isHorizontal)}
            />
            Orientation: {isHorizontal ? 'Horizontal' : 'Vertical'}
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" checked={disabled} onChange={() => setDisabled(!disabled)} />
            Disabled: {disabled ? 'Yes' : 'No'}
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" checked={showMarks} onChange={() => setShowMarks(!showMarks)} />
            Show marks: {showMarks ? 'Yes' : 'No'}
          </label>
        </div>
        <div>
          <label>
            Change Size:
            <select value={size} onChange={(ev) => setSize(ev.target.value)}>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
            </select>
          </label>
        </div>
      </div>
      <div>
        <HalfWidth
        // sx={({ theme }: any) => ({
        //   color: theme.palette.primary.main,
        //   fontSize: isRed ? 'h1.fontSize' : 'h2.fontSize',
        //   ':hover': {
        //     backgroundColor: ['primary.dark', 'secondary.main'],
        //     color: {
        //       sm: 'primary.dark',
        //       md: 'secondary.main',
        //     },
        //   },
        // })}
        >
          <Slider
            aria-label="Small steps"
            // @ts-ignore
            defaultValue={50}
            step={2}
            marks={showMarks}
            min={0}
            max={100}
            valueLabelDisplay="auto"
            orientation={isHorizontal ? 'horizontal' : 'vertical'}
            size={size as 'small' | 'medium'}
            color={isColorPrimary ? 'primary' : 'secondary'}
            track={isTrackInverted ? 'inverted' : 'normal'}
            disabled={disabled}
            value={value}
            // @ts-ignore
            onChange={(ev, val) => setValue(val as number)}
          />
        </HalfWidth>
      </div>
    </React.Fragment>
  );
}
