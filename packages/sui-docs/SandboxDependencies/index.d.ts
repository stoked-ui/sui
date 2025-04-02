import { CODE_VARIANTS } from '../src/components/constants';
import { MuiProductId } from '../src/components/getProductInfoFromUrl';

interface SandboxDependenciesOptions {
  commitRef?: string;
}

export default function SandboxDependencies(
  demo: {
    raw: string;
    productId?: MuiProductId;
    codeVariant: keyof typeof CODE_VARIANTS;
  },
  options?: SandboxDependenciesOptions
): {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}; 

