/**
 * EditorFileTabs component
 *
 * This component displays the file explorer tabs for the editor.
 *
 * @param inProps - The props for the component
 */

export default function EditorFileTabs(inProps: FileExplorerTabsProps) {
  const { state, dispatch } = useEditorContext();
  const { flags, file, engine, settings, app } = state;
  const {editorId} = settings;

  /**
   * Tab names and current tab index
   *
   * The initial values for the tab names array and the current tab object.
   */

  const [tabNames, setTabNames] = React.useState<string[]>(['Projects', 'Track Files',]);
  const [tabName, setTabName] = React.useState<string>('');
  const [currentTab, setCurrentTab] = React.useState<{ name: string, files?: readonly FileBase[] }>({ name: '', files: []});

  /**
   * Tab data
   *
   * The initial value for the tab data object.
   */

  const [tabData, setTabData] = React.useState<Record<string, ExplorerPanelProps>>({});

  /**
   * onProjectsDoubleClick function
   *
   * Handles the double click event for a project file in the Projects tab.
   *
   * @param clickedFile - The file that was double clicked
   */

  const onProjectsDoubleClick = async (clickedFile: FileBase) => {
    console.info('onProjectsDoubleClick', clickedFile);
    const editor = StokedUiEditorApp.getInstance();

    if (clickedFile.mediaType === 'project' && clickedFile.name === file?.name) {
      return;
    }

    const urlLookup  = await LocalDb.loadByName({store: editor.defaultInputFileType.name, name: clickedFile.name});
    if (urlLookup) {
      switch(clickedFile.mediaType) {
        case 'project': {
          const editorFile = await EditorFile.fromLocalFile<EditorFile>(urlLookup.blob as Blob, EditorFile) as EditorFile;
          await editorFile.updateStore();
          await editorFile.preload(editorId);
          dispatch({type: 'SET_FILE', payload: editorFile})
          break;
        }
        case 'video': {
          const video = urlLookup.videos.find((videoLookup) => videoLookup.id === clickedFile.id);
          if (!video) {
            return;
          }
          const recording = new MediaFile([video.blob], video.name, {type: 'video/mp4'});
          recording?.extractMetadata().then(() => {
            if (!file) {
              return;
            }
            console.info('lastRecording', recording)
            dispatch({type: 'VIDEO_DISPLAY', payload: recording});
          });
          break;
        }
        case 'folder': {
          console.info('folder clicked', clickedFile);
          break;
        }
        default:
      }
    }
  };

  /**
   * React useEffect hook
   *
   * Sets up the initial tab data based on the settings and file state.
   */

  React.useEffect(() => {
    const projectItems = LocalDb.stores[app.defaultInputFileType.name]?.files as FileBase[];
    const expanded = file?.id ? [file.id] : [];
    const selectedItem = projectItems.find((item) => item.id === file?.id);
    if (selectedItem) {
      selectedItem.children?.forEach((child) => {
        expanded.push(child.id);
      });
    }
    if (expanded.length !== 3) {
      return;
    }
    const newTabData: Record<string, ExplorerPanelProps> = {};
    newTabData.Projects = {
      name: 'Projects',
      items: projectItems,
      gridColumns: {
        version: (item: FileBase) => item?.version?.toString() || '',
        type: (item: FileBase) => item?.mediaType || '',
      },
      selectedId: file?.id,
      expandedItems: expanded,
      onItemDoubleClick: onProjectsDoubleClick
    };

    const trackFiles = Object.values(settings.trackFiles) as IMediaFile[];
    newTabData['Track Files'] = {
      name: 'Track Files',
      items: MediaFile.toFileBaseArray(trackFiles?.length ? trackFiles : [] ),
      gridColumns: {
        type: (item: FileBase) => item?.mediaType || '',
      },
      onItemDoubleClick: onTrackFilesDoubleClick
    };

    setTabData(newTabData);
  }, [settings.trackFiles, settings.savedVideos, settings.projectFiles, file?.version]);

  /**
   * React useEffect hook
   *
   * Updates the current tab based on the active tab name.
   */

  React.useEffect(() => {
    setCurrentTab(tabData[tabName])
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