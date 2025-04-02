import * as React from 'react';

export interface DemoSandboxProps {
  children: React.ReactNode;
  iframe?: boolean;
  name: string;
  onResetDemoClick: () => void;
  productId?: string;
  [key: string]: any;
}

declare const DemoSandbox: React.ElementType<DemoSandboxProps>;

export default DemoSandbox; 

