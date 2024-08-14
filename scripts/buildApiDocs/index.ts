import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { ProjectSettings, buildApi } from '@stoked-ui/internal-api-docs-builder';
import getProjectSettings from './projectSettings';

const fileExplorerSettings = getProjectSettings('file-explorer', [
  // '/sui-file-explorer/src/File/File.tsx',
  // '/sui-file-explorer/src/FileElement/FileElement.tsx',
  // '/sui-file-explorer/src/FileExplorer/FileExplorer.tsx',
  // '/sui-file-explorer/src/FileExplorerBasic/FileExplorerBasic.tsx',
  // '/sui-file-explorer/src/internals/FileExplorerProvider/FileExplorerProvider.tsx',
  // '/sui-file-explorer/src/internals/FileProvider/FileProvider.tsx',
  '/sui-file-explorer/src/File/FileExtras.tsx',
  '/sui-file-explorer/src/File/FileIconContainer.tsx',
  '/sui-file-explorer/src/File/FileLabel.tsx',
  '/sui-file-explorer/src/FileElement/FileElementContent.tsx',
  '/sui-file-explorer/src/FileExplorer/FileWrapped.tsx',
  '/sui-file-explorer/src/internals/FileExplorerProvider/FileExplorerChildrenItemProvider.tsx',
  '/sui-file-explorer/src/internals/FileIcon/FileIcon.tsx',
  '/sui-file-explorer/src/internals/plugins/useFileExplorerGrid/FileExplorerGridColumns.tsx',
  '/sui-file-explorer/src/internals/plugins/useFileExplorerGrid/FileExplorerGridHeaders.tsx',
]);
const timelineSettings = getProjectSettings('timeline', []);
const videoEditorSettings = getProjectSettings('video-editor', []);
const mediaSelectorSettings = getProjectSettings('media-selector', []);

const projectSettings: ProjectSettings[] = [
  fileExplorerSettings,
  timelineSettings,
  videoEditorSettings,
  mediaSelectorSettings
];

type CommandOptions = { grep?: string };

async function run(argv: yargs.ArgumentsCamelCase<CommandOptions>) {
  const grep = argv.grep == null ? null : new RegExp(argv.grep);
  return buildApi(projectSettings, grep);
}

yargs(hideBin(process.argv))
  .command({
    command: '$0',
    describe: 'Generates API documentation for the SUI packages.',
    builder: (command) => {
      return command.option('grep', {
        description:
          'Only generate files for component filenames matching the pattern. The string is treated as a RegExp.',
        type: 'string',
      });
    },
    handler: run,
  })
  .help()
  .strict(true)
  .version(false)
  .parse();
