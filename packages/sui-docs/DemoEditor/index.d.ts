import * as React from 'react';

export interface DemoEditorProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  copyButtonProps: {};
  id: string;
  language: string;
  onChange: (...args: any[]) => void;
  value: string;
}

export default function DemoEditor(props: DemoEditorProps): JSX.Element; 
