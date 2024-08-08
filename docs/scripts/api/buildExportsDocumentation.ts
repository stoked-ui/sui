import path from 'path';
import * as ts from 'typescript';
import { writePrettifiedFile, resolveExportSpecifier } from './utils';
import { XTypeScriptProject, XTypeScriptProjects } from '../createXTypeScriptProjects';


const buildPackageExports = (project: XTypeScriptProject) => {
  const syntaxKindToSyntaxName: Record<string, string> = {};
  Object.entries(ts.SyntaxKind).forEach(([syntaxName, syntaxKind]) => {
    syntaxKindToSyntaxName[syntaxKind] = syntaxName.replace('Declaration', '');
  });

  const exports = Object.entries(project.exports)
    .map(([name, symbol]) => {
      return {
        name,
        kind: syntaxKindToSyntaxName[
          resolveExportSpecifier(symbol, project).declarations?.[0].kind!
        ],
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  writePrettifiedFile(
    path.resolve(project.workspaceRoot, `scripts/${project.name}.exports.json`),
    JSON.stringify(exports),
    project,
  );
};

export default function buildExportsDocumentation(projects: XTypeScriptProjects) {
  projects.forEach((project: XTypeScriptProject) => {
    buildPackageExports(project);
  });
}
