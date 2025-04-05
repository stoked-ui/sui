/**
 * React component for rendering editor view actions.
 * Provides buttons for clearing, saving, opening files, and accessing settings.
 *
 * @param {Object} props - The props of the component.
 * @param {boolean} props.visible - Flag indicating if the component is visible.
 * @returns {JSX.Element} React component
 */
export default function EditorViewActions({ visible }: { visible: boolean }) {
  const context = useEditorContext();
  const { dispatch, state } = context;
  const { file, flags, components, settings } = state;
  const { editorId, fitScaleData, setCursor, videoTrack } = settings;
  
  /**
   * Checks if the file is dirty and updates the state.
   */
  React.useEffect(() => {
    const isFileDirty = async () => {
      const isDirty = await (file as EditorFile)?.isDirty();
      setIsDirty(isDirty);
    };

    isFileDirty().catch();
  }, [file]);

  /**
   * Handles saving the current file.
   */
  const saveHandler = async () => {
    if (!file) {
      return;
    }
    if (videoTrack) {
      (videoTrack.file as MediaFile).save();
      return;
    }
    await file.save();
    console.info('file saved');
  };

  /**
   * Handles opening a new file.
   */
  const openHandler = async () => {
    const loadedFiles: IEditorFile[] = (await AppFile.fromOpenDialog<EditorFile>(
      EditorFile,
    )) as IEditorFile[];

    if (loadedFiles.length) {
      const loadedFile = loadedFiles[0];
      await loadedFile.preload(settings.editorId);
      dispatch({ type: 'SET_FILE', payload: loadedFile });
      const width = (components.timelineGrid as HTMLDivElement)?.clientWidth;
      if (width) {
        fitScaleData(context, false, width, 'editorViewActions');
        setCursor({ time: 0, updateTime: true }, context);
      }
    }
  };

  /**
   * Handles removing the current file or video track.
   */
  const remove = () => {
    if (videoTrack) {
      dispatch({ type: 'VIDEO_CLOSE', payload: videoTrack.file.id });
      return;
    }
    dispatch({ type: 'DISCARD_FILE' });
  };

  // Render null if in detail mode
  if (flags.detailMode) {
    return null;
  }

  return (
    <Stack direction={'column'}>
      <Zoom in={visible && !!file}>
        <Fab
          id={'clear'}
          color={'error'}
          aria-label="clear"
          size="small"
          sx={(theme) => ({
            position: 'absolute',
            left: '0px',
            margin: '8px',
            color: theme.palette.text.primary,
          })}
          onClick={remove}
        >
          <ClearIcon />
        </Fab>
      </Zoom>
      <Stack direction={'row'}>
        {(videoTrack || fileIsDirty) && visible && (
          <Zoom in={visible}>
            <Fab
              id={'save'}
              aria-label="save"
              size="small"
              color={'secondary'}
              sx={(theme) => ({
                position: 'absolute',
                right: '96px',
                margin: '8px',
                color: theme.palette.text.primary,
              })}
              onClick={saveHandler}
            >
              <SaveIcon />
            </Fab>
          </Zoom>
        )}
        <Zoom in={visible}>
          <Fab
            id={'open'}
            color={'secondary'}
            aria-label="open"
            size="small"
            sx={(theme) => ({
              position: 'absolute',
              right: '48px',
              margin: '8px',
              color: theme.palette.text.primary,
            })}
            onClick={openHandler}
          >
            <OpenIcon />
          </Fab>
        </Zoom>
        <Zoom in={visible}>
          <Fab
            id={'settings'}
            color={'primary'}
            aria-label="settings"
            size="small"
            sx={(theme) => ({
              position: 'absolute',
              right: '0px',
              margin: '8px',
              color: theme.palette.text.primary,
            })}
            onClick={() => {
              dispatch({ type: 'SELECT_PROJECT' });
              dispatch({ type: 'DETAIL_OPEN' });
            }}
          >
            <SettingsIcon />
          </Fab>
        </Zoom>
      </Stack>
    </Stack>
  );
}

/**
 * PropTypes for EditorViewActions component.
 * These PropTypes are generated from the TypeScript type definitions.
 * To update them, edit the TypeScript types and run "pnpm proptypes".
 */
EditorViewActions.propTypes = {
  visible: PropTypes.bool.isRequired,
} as any;