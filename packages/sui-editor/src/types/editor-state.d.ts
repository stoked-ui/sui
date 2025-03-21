declare module '@stoked-ui/editor' {
  // Define the EditorState interface with the properties that are being accessed in components
  export interface EditorState {
    // Main properties
    file?: IEditorFile<IEditorTrack<IEditorAction>, IEditorFileData<any>>;
    engine?: any; // IEngine from timeline
    settings: {
      editorId: string;
      trackFiles: any[];
      [key: string]: any;
    };
    flags: {
      [key: string]: boolean;
    };
    components: {
      [key: string]: any;
    };
    
    // Selection related properties
    selected?: any;
    selectedType?: string;
    selectedAction?: IEditorAction;
    selectedTrack?: IEditorTrack<IEditorAction>;
    selectedDetail?: any;
    
    // Function properties
    getState?: () => EditorState;
    
    // Application related
    app?: any; // IApp from media-selector
  }

  // Define editor types
  export interface IEditorTrack<TAction> {
    id: string;
    name: string;
    actions?: TAction[];
    [key: string]: any;
  }

  export interface IEditorAction {
    id: string;
    start: number;
    end: number;
    [key: string]: any;
  }

  export interface IEditorFileData<T> {
    [key: string]: T;
  }

  export interface IEditorFile<TTrack, TData> {
    id?: string;
    name?: string;
    tracks?: TTrack[];
    data?: TData;
  }

  // Define enums for control state
  export enum EditorControlState {
    Play = "play",
    Rewind = "rewind",
    FastForward = "fastForward",
    Record = "record"
  }

  // Define detail types
  export interface TrackDetail {
    track: IEditorTrackDetail;
  }

  export interface ActionDetail {
    action: IEditorActionDetail;
  }

  export interface IEditorTrackDetail {
    id: string;
    locked?: boolean;
    muted?: boolean;
    [key: string]: any;
  }

  export interface IEditorActionDetail {
    id: string;
    [key: string]: any;
  }

  export interface IEditorProjectDetail {
    backgroundColor?: string;
    height?: number;
    width?: number;
    id?: string;
    name?: string;
    description?: string;
    author?: string;
    created?: number;
    lastModified?: number;
  }
}
