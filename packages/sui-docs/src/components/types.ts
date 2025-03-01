import type { MuiProductId } from './getProductInfoFromUrl';

export type CodeStyling = 'Tailwind' | 'SUI System';
export type CodeVariant = 'TS' | 'JS';
export interface DemoData {
  title: string;
  language: string;
  raw: string;
  codeVariant: CodeVariant;
  githubLocation: string;
  productId?: Exclude<MuiProductId, 'null'>;
  codeStyling: CodeStyling;
}
