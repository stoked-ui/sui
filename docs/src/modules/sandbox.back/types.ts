import type { SuiProductId } from '@stoked-ui/docs/utils/ProductInfo';

export type CodeStyling = 'Tailwind' | 'SUI System';
export type CodeVariant = 'TS' | 'JS';
export interface DemoData {
  title: string;
  language: string;
  raw: string;
  codeVariant: CodeVariant;
  githubLocation: string;
  productId?: Exclude<SuiProductId, 'null'>;
  codeStyling: CodeStyling;
}
