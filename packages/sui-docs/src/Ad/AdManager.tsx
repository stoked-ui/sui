import * as React from 'react';
import { unstable_useEnhancedEffect as useEnhancedEffect } from '@mui/material/utils';

interface AdManagerProps {
  children?: React.ReactNode;
  classSelector?: string;
}

interface Portal {
  placement?: string;
  element?: Element | null;
}

export const AdContext = React.createContext<Portal>({});

// Persisted for the whole session.
// The state is used to use different ad placements.
const randomSession = Math.random();

// Distribution profile:
// 20% body-inline
// 80% body-image
export const adShape = randomSession < 0.2 ? 'inline' : 'image';

export default function AdManager({ classSelector = '.description', children }: AdManagerProps) {
  const [portal, setPortal] = React.useState<Portal>({});

  useEnhancedEffect(() => {
    const description = document.querySelector(classSelector);
    setPortal({ placement: 'body-top', element: description });
  }, [classSelector]);

  return <AdContext.Provider value={portal}>{children}</AdContext.Provider>;
}
