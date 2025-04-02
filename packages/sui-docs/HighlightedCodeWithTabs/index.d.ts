import * as React from 'react';

export interface TabsConfig {
  code: string | ((tab: string) => string);
  language: string;
  tab: string;
}

export interface HighlightedCodeWithTabsProps {
  tabs: Array<TabsConfig>;
  storageKey?: string;
  [key: string]: any;
}

export default function HighlightedCodeWithTabs(props: HighlightedCodeWithTabsProps): JSX.Element; 

