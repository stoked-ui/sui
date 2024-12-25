import * as React from "react";
import {
  ExplorerPanelProps,
  FileBase,
  FileExplorerTabs,
  FileExplorerTabsProps
} from "@stoked-ui/file-explorer";
import {IMediaFile, MediaFile} from "@stoked-ui/media-selector";
import {LocalDb, Version} from "@stoked-ui/common";
import {useEditorContext} from "../EditorProvider/EditorContext";
import EditorFile, {IEditorFile} from "../EditorFile";
import {StokedUiEditorApp} from "../Editor";

export default function EditorFileTabs(inProps: FileExplorerTabsProps) {
  const { state, dispatch} = useEditorContext();
  const { flags, file, engine, settings, app } = state;
  const [tabNames, setTabNames] = React.useState<string[]>(['Projects', 'Versions', 'Track Files', 'Saved Videos']);
  const [tabName, setTabName] = React.useState<string>('');
  const [currentTab, setCurrentTab] = React.useState<{ name: string, files?: readonly FileBase[]}>({ name: '', files: []});

  const [tabData, setTabData] = React.useState<Record<string, ExplorerPanelProps>>({});

  const onProjectsDoubleClick = async (doubleClickedFile: FileBase) => {
    console.info('onProjectsDoubleClick', doubleClickedFile);
    const editor = StokedUiEditorApp.getInstance();

    const urlLookup  = await LocalDb.loadByName({store: editor.defaultInputFileType.name, name: doubleClickedFile.name});
    if (urlLookup) {
      const editorFile = await EditorFile.fromLocalFile<EditorFile>(urlLookup.blob, EditorFile) as EditorFile;
      if (editorFile) {
        editorFile.versions = urlLookup.versions;
      }
      dispatch({ type: 'SET_FILE', payload: editorFile })
      console.info('item clicked', doubleClickedFile);
    }
  }

  const onVersionsDoubleClick = async (doubleClickedFile: FileBase) => {
    console.info('onProjectsDoubleClick', doubleClickedFile);
    const editor = StokedUiEditorApp.getInstance();
    const versionFile = doubleClickedFile as Version;

    const urlLookup  = await LocalDb.loadByName({store: editor.defaultInputFileType.name, name: doubleClickedFile.name, version: versionFile.version });
    if (urlLookup) {
      const editorFile = await EditorFile.fromLocalFile<EditorFile>(urlLookup.blob, EditorFile) as EditorFile;
      if (editorFile) {
        editorFile.versions = urlLookup.versions;
      }
      dispatch({ type: 'SET_FILE', payload: editorFile })
      console.info('item clicked', doubleClickedFile);
    }
  }

  const onTrackFilesDoubleClick = async (doubleClickedFile: FileBase) => {
    console.info('onSavedVideoDoubleClick', doubleClickedFile);
    if (doubleClickedFile.mediaType === 'folder' || !settings.trackFiles) {
      return;
    }
    let index = settings.savedVideos.findIndex((video) => video.id === doubleClickedFile.id);
    console.info('videos', settings.savedVideos, index)
    let payload: IMediaFile | null = null;
    const trackFiles = Object.values(settings.trackFiles);
    index = trackFiles.findIndex((trackFile) => (trackFile as IMediaFile).id === doubleClickedFile.id);
    if (index !== -1) {
      payload = trackFiles[index] as IMediaFile;
    }
    if (!payload) {
      return;
    }
    await payload.extractMetadata();

    dispatch({ type: 'DISPLAY_SCREENER', payload })
    console.info('item clicked', doubleClickedFile);
  }

  const onSavedVideoDoubleClick = async (doubleClickedFile: FileBase) => {
    console.info('onSavedVideoDoubleClick', doubleClickedFile);
    if (doubleClickedFile.mediaType === 'folder' || !settings.savedVideos) {
      return;
    }
    let index = settings.savedVideos.findIndex((video) => video.id === doubleClickedFile.id);
    console.info('videos', settings.savedVideos, index)
    let payload: IMediaFile | null = null;
    if (index !== -1) {
      payload = settings.savedVideos[index];
    }
    if (!payload) {
      index = Object.values(settings.trackFiles).findIndex((trackFile) => (trackFile as IMediaFile).id === doubleClickedFile.id);
      if (index !== -1) {
        payload = settings.trackFiles[index] as IMediaFile;
      }
    }
    if (!payload) {
      return;
    }
    await payload.extractMetadata();

    dispatch({ type: 'DISPLAY_SCREENER', payload })
    console.info('item clicked', doubleClickedFile);
  }

  React.useEffect(() => {
    const newTabData: Record<string, ExplorerPanelProps> = {};
    newTabData.Unselected = { name: 'Unselected', items: [] };
    newTabData.Projects = {
      name: 'Projects',
      items: LocalDb.stores[app.defaultInputFileType.name]?.files as FileBase[],
      onItemDoubleClick: onProjectsDoubleClick
    };

    newTabData.Versions = {
      name: 'Versions',
      items: file?.versions?.length ? file.versions : [] ,
      onItemDoubleClick: onVersionsDoubleClick
    };

    const trackFiles = Object.values(settings.trackFiles) as IMediaFile[];
    newTabData['Track Files'] = {
      name: 'Track Files',
      items: MediaFile.toFileBaseArray(trackFiles?.length ? trackFiles : [] ),
      onItemDoubleClick: onTrackFilesDoubleClick
    };

    newTabData['Saved Videos'] = {
      name: 'Saved Videos',
      items: MediaFile.toFileBaseArray(settings.savedVideos?.length ? settings.savedVideos : []),
      onItemDoubleClick: onSavedVideoDoubleClick
    };
    console.info('newTabData', newTabData)
    setTabData(newTabData);
  }, [settings.trackFiles, settings.savedVideos, settings.projectFiles])

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
