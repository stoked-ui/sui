import * as React from 'react';
import { styled, keyframes } from '@mui/zero-runtime';
import Slider from './Slider/ZeroSlider';

const bounce = keyframes`
  from, 20%, 53%, 80%, to {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0, -30px, 0);
  }
  70% {
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0,-4px,0);
  }
`;

const bounceAnim = keyframes({
  'from, 20%, 53%, 80%, to': {
    transform: 'translate3d(0,0,0)',
  },
  '40%, 43%': {
    transform: 'translate3d(0, -30px, 0)',
  },
  '70%': {
    transform: 'translate3d(0, -15px, 0)',
  },
  '90%': {
    transform: 'translate3d(0,-4px,0)',
  },
});

const Button = styled('button', {
  name: 'MuiButton',
  slot: 'Root',
})(
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

const HalfWidth = styled.div({
  marginLeft: 20,
  width: '50%',
  maxHeight: 100,
  padding: 20,
  border: '1px solid #ccc',
  animation: [`${bounce} 1s ease infinite`, `${bounceAnim} 1s ease infinite`],
});

export default function App({ isRed }: any) {
  const [count, setCount] = React.useState(0);
  const [value, setValue] = React.useState(50);
  const [isColorPrimary, setIsColorPrimary] = React.useState(true);
  const [size, setSize] = React.useState('medium');
  const [showMarks, setShowMarks] = React.useState(true);
  const [isTrackInverted, setIsTrackInverted] = React.useState(false);
  const [disabled, setDisabled] = React.useState(false);
  const [isHorizontal, setIsHorizontal] = React.useState(true);

  return (
    <div>
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
          sx={({ theme }: any) => ({
            color: theme.palette.primary.main,
            fontSize: isRed ? 'h1.fontSize' : 'h2.fontSize',
            ':hover': {
              backgroundColor: ['primary.dark', 'secondary.main'],
              color: {
                sm: 'primary.dark',
                md: 'secondary.main',
              },
            },
          })}
        >
          <Slider
            aria-label="Small steps"
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
            onChange={(ev, val) => setValue(val as number)}
          />
        </HalfWidth>
      </div>
    </div>
  );
}
