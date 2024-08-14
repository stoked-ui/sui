import path from 'path';
import { LANGUAGES } from 'docs/config';
import { ProjectSettings } from '@stoked-ui/internal-api-docs-builder';
import findApiPages from '@stoked-ui/internal-api-docs-builder/utils/findApiPages';
import {
  unstable_generateUtilityClass as generateUtilityClass,
  unstable_isGlobalState as isGlobalState,
} from '@mui/utils';
import { getStokedUiComponentInfo } from './getStokedUiComponentInfo';

export const projectSettings: ProjectSettings = {
  output: {
    apiManifestPath: path.join(process.cwd(), 'docs/data/material/pagesApi.js'),
  },
  typeScriptProjects: [
    {
      name: 'material',
      rootPath: path.join(process.cwd(), 'packages/mui-material'),
      entryPointPath: 'src/index.d.ts',
    },
    {
      name: 'stoked',
      rootPath: path.join(process.cwd(), 'packages/sui-material'),
      entryPointPath: 'src/index.d.ts',
    },
    {
      name: 'lab',
      rootPath: path.join(process.cwd(), 'packages/mui-lab'),
      entryPointPath: 'src/index.d.ts',
    },
  ],
  getApiPages: () => findApiPages('docs/pages/material-ui/api'),
  getComponentInfo: getStokedUiComponentInfo,
  translationLanguages: LANGUAGES,
  skipComponent(filename: string) {
    return filename.match(/(ThemeProvider|CssVarsProvider|Grid2)/) !== null;
  },
  translationPagesDirectory: 'docs/translations/api-docs',
  generateClassName: generateUtilityClass,
  isGlobalClassName: isGlobalState,
};
