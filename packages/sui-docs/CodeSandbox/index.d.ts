import { DemoData } from '../src/components/types';

interface ReactAppResult {
  title: string;
  description: string;
  files: Record<string, object>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  openSandbox: (initialFile?: string) => void;
}

interface JoyTemplateResult {
  title: string;
  files: Record<string, object>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  openSandbox: (initialFile?: string) => void;
}

interface CodeSandboxInterface {
  createReactApp: (demoData: DemoData) => ReactAppResult;
  createJoyTemplate: (templateData: {
    title: string;
    files: Record<string, string>;
    githubLocation: string;
    codeVariant: 'TS' | 'JS';
    codeStyling?: 'Tailwind' | 'SUI System';
  }) => JoyTemplateResult;
}

declare const CodeSandbox: CodeSandboxInterface;

export default CodeSandbox; 

