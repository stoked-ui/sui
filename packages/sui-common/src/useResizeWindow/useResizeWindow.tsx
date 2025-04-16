import {useEffect, useState} from 'react';

function useResizeWindow() {
  if (typeof window === 'undefined') {
    return [0, 0];
  }

  const [size, setSize] = useState(typeof window !== 'undefined' ? [window.innerWidth, window.innerHeight] : [0, 0]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = () => {
      setSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', handleResize);

    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

export default useResizeWindow;
