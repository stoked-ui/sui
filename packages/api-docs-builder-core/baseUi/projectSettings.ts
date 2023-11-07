import path from 'path';
import { LANGUAGES } from 'docs/config';
import { ProjectSettings } from '@mui-internal/api-docs-builder';
import findApiPages from '@mui-internal/api-docs-builder/utils/findApiPages';
import { getBaseUiComponentInfo } from './getBaseUiComponentInfo';
import { getBaseUiHookInfo } from './getBaseUiHookInfo';
import { generateBaseUIApiPages } from './generateBaseUiApiPages';
import { generateApiLinks } from './generateApiLinks';

export const projectSettings: ProjectSettings = {
  output: {
    apiManifestPath: path.join(process.cwd(), 'docs/data/base/pagesApi.js'),
  },
  typeScriptProjects: [
    {
      name: 'base',
      rootPath: path.join(process.cwd(), 'packages/mui-base'),
      entryPointPath: 'src/index.d.ts',
    },
  ],
  getApiPages: () => findApiPages('docs/pages/base-ui/api'),
  getComponentInfo: getBaseUiComponentInfo,
  getHookInfo: getBaseUiHookInfo,
  translationLanguages: LANGUAGES,
  skipComponent: () => false,
  onCompleted: () => {
    generateBaseUIApiPages();
  },
  onWritingManifestFile(builds, source) {
    const apiLinks = generateApiLinks(builds);
    if (apiLinks.length > 0) {
      return `module.exports = ${JSON.stringify(apiLinks)}`;
    }

    return source;
  },
};
