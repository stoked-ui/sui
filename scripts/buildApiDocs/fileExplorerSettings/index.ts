import path from 'path';
import { ProjectSettings } from '@stoked-ui/internal-api-docs-builder';
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

    return `import type { SuiPage } from '@stoked-ui/docs/SuiPage';

const apiPages: SuiPage[] = ${JSON.stringify(pages, null, 2)};
export default apiPages;
`;
  },
  typeScriptProjects: [
    {
      name: 'file-explorer',
      rootPath: path.join(process.cwd(), 'packages/sui-file-explorer'),
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
  skipComponent(filename) {
    return [
      // '/sui-file-explorer/src/File/File.tsx',
      '/sui-file-explorer/src/File/FileExtras.tsx',
      '/sui-file-explorer/src/File/FileIconContainer.tsx',
      '/sui-file-explorer/src/File/FileLabel.tsx',
      // '/sui-file-explorer/src/FileElement/FileElement.tsx',
      '/sui-file-explorer/src/FileElement/FileElementContent.tsx',
      // '/sui-file-explorer/src/FileExplorer/FileExplorer.tsx',
      '/sui-file-explorer/src/FileExplorer/FileWrapped.tsx',
      // '/sui-file-explorer/src/FileExplorerBasic/FileExplorerBasic.tsx',
      '/sui-file-explorer/src/internals/FileExplorerProvider/FileExplorerChildrenItemProvider.tsx',
      // '/sui-file-explorer/src/internals/FileExplorerProvider/FileExplorerProvider.tsx',
      '/sui-file-explorer/src/internals/FileIcon/FileIcon.tsx',
      // '/sui-file-explorer/src/internals/FileProvider/FileProvider.tsx',
      '/sui-file-explorer/src/internals/plugins/useFileExplorerGrid/FileExplorerGridColumns.tsx',
      '/sui-file-explorer/src/internals/plugins/useFileExplorerGrid/FileExplorerGridHeaders.tsx',
    ].some((invalidPath) => filename.endsWith(invalidPath));
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
