import path from 'path';
import { ProjectSettings} from '@stoked-ui/internal-api-docs-builder';
import { ReactApi as ComponentReactApi } from '@stoked-ui/internal-api-docs-builder/ApiBuilders/ComponentApiBuilder';
import { ReactApi as HookReactApi } from '@stoked-ui/internal-api-docs-builder/ApiBuilders/HookApiBuilder';
import findApiPages from '@stoked-ui/internal-api-docs-builder/utils/findApiPages';
import generateUtilityClass, { isGlobalState } from '@mui/utils/generateUtilityClass';
import { getComponentImports, getComponentInfo } from './getComponentInfo';

const LANGUAGES: string[] = [];

type PageType = { pathname: string; title: string; plan?: 'community' | 'pro' | 'premium' };

export const fileExplorerSettings: ProjectSettings = {
  output: {
    apiManifestPath: path.join(process.cwd(), 'docs/data/file-explorer-component-api-pages.ts'),
  },
  onWritingManifestFile: (
    builds: PromiseSettledResult<ComponentReactApi | HookReactApi | null | never[]>[],
  ) => {
    const pages = builds
      .map((build) => {
        if (build.status === 'rejected' || !build.value || Array.isArray(build.value)) {
          return null;
        }
        const {
          value: { name, apiPathname, filename },
        } = build;

        const plan =
          (filename.includes('-pro') && 'pro') || (filename.includes('-premium') && 'premium');

        return { pathname: apiPathname, title: name, ...(plan ? { plan } : {}) };
      })
      .filter((page): page is PageType => page !== null)
      .sort((a: PageType, b: PageType) => a.title.localeCompare(b.title));

    return `import type { MuiPage } from 'docs/src/MuiPage';

const apiPages: MuiPage[] = ${JSON.stringify(pages, null, 2)};
export default apiPages;
`;
  },
  typeScriptProjects: [
    {
      name: 'file-explorer',
      rootPath: path.join(process.cwd(), 'packages/file-explorer'),
      entryPointPath: 'src/index.ts',
    },
    // {
    //   name: 'tree-view-pro',
    //   rootPath: path.join(process.cwd(), 'packages/x-tree-view-pro'),
    //   entryPointPath: 'src/index.ts',
    // },
  ],
  getApiPages: () => findApiPages('docs/pages/file-explorer/api'),
  getComponentInfo,
  translationLanguages: LANGUAGES,
  skipComponent() {
    return false;
  },
  skipAnnotatingComponentDefinition: true,
  translationPagesDirectory: 'docs/translations/api-docs/file-explorer',
  importTranslationPagesDirectory: 'docs/translations/api-docs/file-explorer',
  getComponentImports,
  propsSettings: {
    propsWithoutDefaultVerification: [],
  },
  generateClassName: generateUtilityClass,
  isGlobalClassName: isGlobalState,
};
