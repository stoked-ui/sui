import * as React from 'react';
import type { MuiProductId } from './getProductInfoFromUrl';

export type CodeStyling = 'Tailwind' | 'SUI System';
export type CodeVariant = 'JS' | 'TS';
export interface DemoData {
  title: string;
  language: string;
  raw: string;
  codeVariant: CodeVariant;
  githubLocation: string;
  productId?: Exclude<MuiProductId, 'null'>;
  codeStyling: CodeStyling;
}

export interface DemoComponentProps {
  demo: {
    raw: string;
    js: React.ComponentType;
    scope: Record<string, unknown>;
    jsxPreview?: React.ReactNode;
    tailwindJsxPreview?: React.ReactNode;
    cssJsxPreview?: React.ReactNode;
    rawTS?: string;
    tsx?: React.ComponentType | null;
    rawTailwind?: string;
    rawTailwindTS?: string;
    jsTailwind?: React.ComponentType | null;
    tsxTailwind?: React.ComponentType | null;
    rawCSS?: string;
    rawCSSTS?: string;
    jsCSS?: React.ComponentType | null;
    tsxCSS?: React.ComponentType | null;
    gaLabel?: string;
  };
  demoOptions: {
    demo?: string;
    hideToolbar?: boolean;
    defaultCodeOpen?: boolean;
    disableAd?: boolean;
    bg?: string;
    [key: string]: unknown;
  };
  disableAd?: boolean;
  githubLocation?: string;
  mode?: 'light' | 'dark';
}

