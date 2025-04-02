import * as React from 'react';

export interface DemoToolbarProps {
  codeOpen: boolean;
  codeVariant: string;
  demo: any;
  demoData: any;
  demoId?: string;
  demoName: string;
  demoOptions: any;
  demoSourceId?: string;
  hasNonSystemDemos?: string;
  initialFocusRef: { current: any };
  onCodeOpenChange: (event: React.SyntheticEvent, value: boolean) => void;
  onResetDemoClick: () => void;
  openDemoSource: boolean;
  showPreview: boolean;
}

export default function DemoToolbar(props: DemoToolbarProps): JSX.Element; 

