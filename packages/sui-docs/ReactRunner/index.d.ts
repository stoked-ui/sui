import * as React from 'react';

export interface ReactRunnerProps {
  code: string;
  scope: {
    process: Record<string, any>;
    import: Record<string, any>;
    [key: string]: any;
  };
  onError: (error: string | null) => void;
}

export default function ReactRunner(props: ReactRunnerProps): JSX.Element; 
