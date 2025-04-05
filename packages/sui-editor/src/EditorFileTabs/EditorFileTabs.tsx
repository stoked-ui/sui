/**
 * React component for displaying tabs with different file explorer views in an editor.
 * @description This component manages different tabs displaying project files and track files in an editor.
 * @param {FileExplorerTabsProps} inProps - The props for the EditorFileTabs component.
 * @property {string[]} tabNames - An array of tab names to display.
 * @property {Record<string, ExplorerPanelProps>} tabData - The data for each tab containing items, grid columns, and event handlers.
 * @property {{ name: string, files?: readonly FileBase[]}} currentTab - The currently active tab and its files.
 * @fires onProjectsDoubleClick - Triggered when a project file is double-clicked.
 * @fires onTrackFilesDoubleClick - Triggered when a track file is double-clicked.
 * @returns {JSX.Element} - The rendered FileExplorerTabs component.
 * @example
 * <EditorFileTabs
 *   setTabName={setTabName}
 *   tabNames={['Projects', 'Track Files']}
 *   tabData={tabData}
 *   currentTab={currentTab}
 *   variant={'drawer'}
 * />
 */
export default function EditorFileTabs(inProps: FileExplorerTabsProps) {
  const { state, dispatch} = useEditorContext();
  const { flags, file, engine, settings, app } = state;
  const {editorId} = settings;
  const [tabNames, setTabNames] = React.useState<string[]>(['Projects', 'Track Files',]);
  const [tabName, setTabName] = React.useState<string>('');
  const [currentTab, setCurrentTab] = React.useState<{ name: string, files?: readonly FileBase[]}>({ name: '', files: []});

  const [tabData, setTabData] = React.useState<Record<string, ExplorerPanelProps>>({});

  /**
   * Handles the double-click event on a project file.
   * @param {FileBase} clickedFile - The file that was double-clicked.
   */
  const onProjectsDoubleClick = async (clickedFile: FileBase) => {
    // Logic for handling double click on project files
  }

  /**
   * Handles the double-click event on a track file.
   * @param {FileBase} doubleClickedFile - The file that was double-clicked.
   */
  const onTrackFilesDoubleClick = async (doubleClickedFile: FileBase) => {
    // Logic for handling double click on track files
  }

  React.useEffect(() => {
    // Logic for setting up tab data for different tabs
  }, [settings.trackFiles, settings.savedVideos, settings.projectFiles, file?.version])

  React.useEffect(() => {
    // Logic for updating the current tab based on tab name
  }, [tabName])

  if (flags.detailMode || !file || engine.isLoading) {
    return null;
  }
  return <FileExplorerTabs
    role={'file-explorer-tabs'}
    id={'editor-file-explorer-tabs'}
    {...inProps}
    setTabName={setTabName}
    tabNames={tabNames}
    tabData={tabData}
    currentTab={currentTab}
    variant={'drawer'}
  />
}
