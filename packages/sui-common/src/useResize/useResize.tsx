import React, {useEffect, useState} from 'react';

interface Size {
  width: number | undefined;
  height: number | undefined;
}

const useResize = (elementRef: React.RefObject<HTMLElement> | null | undefined): Size => {
  const [size, setSize] = useState<Size>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: elementRef ? (elementRef.current?.offsetWidth ?? undefined) : window.innerWidth,
        height: elementRef ? (elementRef.current?.offsetHeight ?? undefined) : window.innerHeight,
      });
    };

    if (elementRef && elementRef.current) {
         handleResize();
    } else if (!elementRef) {
        handleResize();
    }

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [elementRef]);

  return size;
};

export default useResize;
