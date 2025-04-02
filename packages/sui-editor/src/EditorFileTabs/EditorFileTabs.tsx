import * as React from "react";
import { File, Blob } from 'formdata-node';
import {
  ExplorerPanelProps,
  FileBase,
  FileExplorerTabs,
  FileExplorerTabsProps
} from "@stoked-ui/file-explorer";
import {IMediaFile, MediaFile} from "@stoked-ui/media-selector";
import {LocalDb, Version, VideoSaveRequest} from "@stoked-ui/common";
import {useEditorContext} from "../EditorProvider/EditorContext";
import EditorFile, {IEditorFile} from "../EditorFile";
import {StokedUiEditorApp} from "../Editor";

export default function EditorFileTabs(inProps: FileExplorerTabsProps) {
  const { state, dispatch} = useEditorContext();
  const { flags, file, engine, settings, app } = state;
  const {editorId} = settings;
  const [tabNames, setTabNames] = React.useState<string[]>(['Projects', 'Track Files',]);
  const [tabName, setTabName] = React.useState<string>('');
  const [currentTab, setCurrentTab] = React.useState<{ name: string, files?: readonly FileBase[]}>({ name: '', files: []});

  const [tabData, setTabData] = React.useState<Record<string, ExplorerPanelProps>>({});

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
  }

  const onTrackFilesDoubleClick = async (doubleClickedFile: FileBase) => {
    console.info('onSavedVideoDoubleClick', doubleClickedFile);
    if (doubleClickedFile.mediaType === 'folder' || !settings.trackFiles) {
      return;
    }
    let payload: IMediaFile | null = null;

    const index = file?.files.findIndex((trackFile) => (trackFile as IMediaFile).id === doubleClickedFile.id);
    if (index !== undefined && index !== -1) {
      payload = file?.files[index] as IMediaFile;
    }
    if (!payload) {
      return;
    }
    await payload.extractMetadata();

    dispatch({ type: 'VIDEO_DISPLAY', payload })
    console.info('item clicked', doubleClickedFile);
  }

  React.useEffect(() => {
    const newTabData: Record<string, ExplorerPanelProps> = {};
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

    // console.info('newTabData', newTabData)
    setTabData(newTabData);
  }, [settings.trackFiles, settings.savedVideos, settings.projectFiles, file?.version])

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

