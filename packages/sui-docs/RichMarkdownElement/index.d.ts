import * as React from 'react';
import { Theme } from '@mui/material/styles';

export interface RichMarkdownElementProps {
  activeTab: string;
  demoComponents: Record<string, React.ComponentType>;
  demos: Record<string, any>;
  disableAd: boolean;
  localizedDoc: any;
  renderedMarkdownOrDemo: string | { 
    component: string; 
    demo: string;
    type?: 'codeblock';
    data?: any;
    storageKey?: string;
    [key: string]: any;
  };
  srcComponents: Record<string, React.ComponentType>;
  theme: Theme;
  WrapperComponent: React.ElementType;
  wrapperProps: object;
}

export default function RichMarkdownElement(props: RichMarkdownElementProps): JSX.Element; 

