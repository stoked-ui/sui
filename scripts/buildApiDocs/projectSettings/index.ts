import path from 'path';
import { ProjectSettings, ComponentReactApi, HookReactApi } from '@stoked-ui/internal-api-docs-builder';
import findApiPages from '@stoked-ui/internal-api-docs-builder/utils/findApiPages';
import generateUtilityClass, { isGlobalState } from '@mui/utils/generateUtilityClass';
import { getHeaders, getTitle, renderMarkdown } from '@mui/internal-markdown';
import { ComponentInfo, extractPackageFile, getMuiName, parseFile, toGitHubPath } from "@stoked-ui/internal-api-docs-builder/buildApiUtils";
import kebabCase from "lodash/kebabCase";
import findPagesMarkdown from "@stoked-ui/internal-api-docs-builder/utils/findPagesMarkdown";
import fs from "fs";

const LANGUAGES: string[] = [];

type PageType = { pathname: string; title: string; plan?: 'community' | 'pro' | 'premium' };

export default function getProjectSettings(projectName: string, exclusions: string[]): ProjectSettings {
  return {
    output: {
      apiManifestPath: path.join(process.cwd(), `docs/data/${projectName}-component-api-pages.ts`),
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
        name: projectName,
        rootPath: path.join(process.cwd(), `packages/sui-${projectName}`),
        entryPointPath: 'src/index.ts',
      },
      // {
      //   name: 'tree-view-pro',
      //   rootPath: path.join(process.cwd(), 'packages/x-tree-view-pro'),
      //   entryPointPath: 'src/index.ts',
      // },
    ],
    getApiPages: () => findApiPages(`docs/pages/${projectName}/api`),
    getComponentInfo: (filename: string) => {
      const { name } = extractPackageFile(filename);
      let srcInfo: null | ReturnType<ComponentInfo['readFile']> = null;
      if (!name) {
        throw new Error(`Could not find the component name from: ${filename}`);
      }
      return {
        filename,
        name,
        muiName: getMuiName(name),
        apiPathname: `/${projectName}/api/${kebabCase(name)}`,
        apiPagesDirectory: path.join(process.cwd(), `docs/pages/${projectName}/api/`),
        readFile: () => {
          srcInfo = parseFile(filename);
          return srcInfo;
        },
        getInheritance: () => null, // TODO: Support inheritance
        getDemos: () => {
          const allMarkdowns = findPagesMarkdown(
            path.join(__dirname, `../../../docs/data/${projectName}/`),
          ).map((markdown) => {
            const markdownContent = fs.readFileSync(markdown.filename, 'utf8');
            const markdownHeaders = getHeaders(markdownContent) as any;

            return {
              ...markdown,
              markdownContent,
              components: markdownHeaders.components as string[],
            };
          });

          return allMarkdowns
            .filter((page) => page.pathname.startsWith(`/${projectName}`) && page.components.includes(name))
            .map((page) => {
              return {
                demoPageTitle: renderMarkdown(getTitle(page.markdownContent)),
                demoPathname: `${page.pathname.replace(`/${projectName}`, `/${projectName}`)}/`,
              };
            });
        },
      };
    },
    translationLanguages: LANGUAGES,
    skipComponent(filename) {
      return exclusions.some((invalidPath) => filename.endsWith(invalidPath));
    },
    skipAnnotatingComponentDefinition: true,
    translationPagesDirectory: `docs/translations/api-docs/${projectName}`,
    importTranslationPagesDirectory: `docs/translations/api-docs/${projectName}`,
    getComponentImports: (name: string, filename: string) => {
      const githubPath = toGitHubPath(filename);

      const rootImportPath = githubPath.replace(
        /\/packages\/(.+?)?\/src\/.*/,
        (match, pkg) => `@stoked-ui/${pkg}`,
      );

      const subdirectoryImportPath = githubPath.replace(
        /\/packages\/(.+?)?\/src\/([^\\/]+)\/.*/,
        (match, pkg, directory) => `@stoked-ui/${pkg}/${directory}`,
      );

      const reExportPackage = [rootImportPath];

      // TODO x-tree-view-pro uncomment when making the package public
      // if (rootImportPath === '@mui/x-tree-view') {
      //   reExportPackage.push('@mui/x-tree-view-pro');
      // }

      return [
        `import { ${name} } from '${subdirectoryImportPath}';`,
        ...reExportPackage.map((importPath) => `import { ${name} } from '${importPath}';`),
      ];
    },
    propsSettings: {
      propsWithoutDefaultVerification: [],
    },
    generateClassName: generateUtilityClass,
    isGlobalClassName: isGlobalState,
  };
}
