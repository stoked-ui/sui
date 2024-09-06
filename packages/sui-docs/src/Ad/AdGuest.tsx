import * as React from 'react';
import PropTypes from 'prop-types';
import Portal from '@mui/material/Portal';
import { AdContext } from './AdManager';

interface AdGuestProps {
  classSelector?: string;
  children?: React.ReactNode;
}

export default function AdGuest(props: AdGuestProps) {
  const { classSelector = '.description', children } = props;
  const ad = React.useContext(AdContext);

  const [containerElement, setContainerElement] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    const element = document.querySelector(classSelector) as HTMLElement | null;
    setContainerElement(element);

    if (element) {
      if (ad?.element === element) {
        element.classList.add('ad');
      } else {
        element.classList.remove('ad');
      }
    }
  }, [classSelector, ad?.element]);

  // Ensure the container function always returns HTMLElement or null
  const getContainer = React.useCallback(() => {
    return containerElement || ad?.element || null;
  }, [containerElement, ad?.element]);

  if (!ad.element) {
    return null;
  }

  return (
    <Portal container={getContainer}>
      {children}
    </Portal>
  );
}

AdGuest.propTypes = {
  children: PropTypes.node,
  classSelector: PropTypes.string,
} as any;
