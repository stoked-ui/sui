import * as React from 'react';
import { styled, keyframes } from '@mui/material/styles';
import {useEditorContext} from "../EditorProvider/EditorContext";

const scale = keyframes`
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(0.7);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
`;

const LoaderCircle = styled('div')(({ theme }) => ({
  width: '25px',
  height: '25px',
  display: 'inline-block',
  'z-index': 10,
  bottom: 0,
  position: 'absolute',
  margin: '24px',
  '&::before, &::after': {
    content: '""',
    display: 'block',
    position: 'absolute',
    borderWidth: '4px',
    borderStyle: 'solid',
    borderRadius: '50%',
    width: '25px',
    height: '25px',
    borderColor: '#bbb',
    top: 0,
    left: 0,
  },
  '&::before': {
    animation: `${scale} 1s linear 0s infinite`,
  },
  '&::after': {
    opacity: 0,
    animation: `${scale} 1s linear 0.5s infinite`,
  },
}));
let count = 0;
function Loader() {
  const { engine } = useEditorContext();
  if (engine?.isLoading) {

    console.info(count += 1);
    return (
      <React.Fragment>
        <LoaderCircle />
      </React.Fragment>
    )
  }
  return <React.Fragment />
}

export default Loader;
