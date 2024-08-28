import path from 'path';
import {
  createTypeScriptProject,
  CreateTypeScriptProjectOptions,
  TypeScriptProject,
} from '@stoked-ui/docs-utils';
import fs from 'fs';
import { getComponentFilesInFolder } from './utils';

const workspaceRoot = path.resolve(__dirname, '../../');

export interface XTypeScriptProject extends Omit<TypeScriptProject, 'name'> {
  name: XProjectNames;
  workspaceRoot: string;
  prettierConfigPath: string;
  /**
   * @param {Project} project The project to generate the prop-types from.
   * @returns {string[]} Path to the component files from which we want to generate the prop-types.
   */
  getComponentsWithPropTypes?: (project: XTypeScriptProject) => string[];
  /**
   * @param {Project} project The project to generate the components api from.
   * @returns {string[]} Path to the component files from which we want to generate the api doc.
   */
  getComponentsWithApiDoc?: (project: XTypeScriptProject) => string[];
  /**
   * Name of the folder inside the documentation.
   */
  documentationFolderName: string;
}

export type XProjectNames =
  | 'file-explorer'
  | 'media-selector'
  | 'core'
  | 'timeline'
  | 'editor'
  | 'x-tree-view';

export type XTypeScriptProjects = Map<XProjectNames, XTypeScriptProject>;

interface CreateXTypeScriptProjectOptions
  extends Omit<CreateTypeScriptProjectOptions, 'name'>,
    Pick<
      XTypeScriptProject,
      'name' | 'documentationFolderName' | 'getComponentsWithPropTypes' | 'getComponentsWithApiDoc'
    > {}


type InterfacesToDocumentType = {
  folder: string;
  packages: XProjectNames[];
  documentedInterfaces: string[];
};

export const interfacesToDocument: InterfacesToDocumentType[] = [];

const createXTypeScriptProject = (options: CreateXTypeScriptProjectOptions): XTypeScriptProject => {
  const { name, rootPath, tsConfigPath, entryPointPath, files, ...other } = options;

  const baseProject = createTypeScriptProject({
    name,
    rootPath,
    tsConfigPath,
    entryPointPath,
    files,
  });

  return {
    ...baseProject,
    ...other,
    name,
    workspaceRoot,
    prettierConfigPath: path.join(workspaceRoot, 'prettier.config.js'),
  };
};

/**
 * Transforms a list of folders and files into a list of file paths containing components.
 * The file must have the name of the component.
 * @param {string[]} folders The folders from which we want to extract components
 * @param {string[]} files The files from which we want to extract components
 */
const getComponentPaths =
  ({
    folders = [],
    files = [],
    includeUnstableComponents = false,
  }: {
    folders?: string[];
    files?: string[];
    includeUnstableComponents?: boolean;
  }) =>
  (project: XTypeScriptProject) => {
    const paths: string[] = [];

    files.forEach((file) => {
      const componentName = path.basename(file).replace('.tsx', '');
      const isExported = !!project.exports[componentName];
      const isHook = path.basename(file).startsWith('use');
      if (isExported && !isHook) {
        paths.push(path.join(project.rootPath, file));
      }
    });

    folders.forEach((folder) => {
      const componentFiles = getComponentFilesInFolder(path.join(project.rootPath, folder));
      componentFiles.forEach((file) => {
        const componentName = path.basename(file).replace('.tsx', '');
        const isExported =
          !!project.exports[componentName] ||
          (includeUnstableComponents && !!project.exports[`Unstable_${componentName}`]);
        const isHook = path.basename(file).startsWith('use');
        if (isExported && !isHook) {
          paths.push(file);
        }
      });
    });

    return paths;
  };


const packageNames = ['x-tree-view', 'file-explorer', 'media-selector', 'timeline', 'editor', 'core'];
const getEntryPoint = (root: string) => {

  if (fs.existsSync(path.join(root, `/src/index.ts`))) {
    return 'src/index.ts';
  }
  if (fs.existsSync(path.join(root, `/src/index.tsx`))) {
    return 'src/index.tsx';
  }
  console.error('No entry point found for', root);
  return false;
}

export const createXTypeScriptProjects = () => {
  const projects: XTypeScriptProjects = new Map();

  packageNames.forEach((name) => {
    const rootPath = path.join(workspaceRoot, `packages/sui-${name}`);
    const entryPointPath = getEntryPoint(rootPath);
    if (!entryPointPath) {
      console.error('No entry point found for', rootPath);
      return;
    }
    const scriptProject = {
      name: name as XProjectNames,
      rootPath,
      entryPointPath,
      documentationFolderName: name,
      getComponentsWithPropTypes: getComponentPaths({
        folders: ['src'],
        includeUnstableComponents: true,
      }),
      getComponentsWithApiDoc: getComponentPaths({
        folders: ['src'],
        includeUnstableComponents: true,
      }),
    };
    projects.set(name as XProjectNames, createXTypeScriptProject(scriptProject));
  })

  return projects;
};
