import type { ProductId } from '../Products';

export type CodeStyling = 'Tailwind' | 'SUI System';
export type CodeVariant = 'TS' | 'JS';
export interface DemoData {
  title: string;
  language: string;
  raw: string;
  codeVariant: CodeVariant;
  githubLocation: string;
  productId?: Exclude<ProductId, 'null'>;
  codeStyling: CodeStyling;
}
