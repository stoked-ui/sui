import { DemoData } from '../src/components/types';

interface ReactAppResult {
  title: string;
  description: string;
  files: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  openSandbox: (initialFile?: string) => void;
}

interface StackBlitzInterface {
  createReactApp: (demoData: DemoData) => ReactAppResult;
}

declare const StackBlitz: StackBlitzInterface;

export default StackBlitz; 
