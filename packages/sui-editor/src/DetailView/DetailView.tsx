/**
 * @typedef {Object} DetailOutterProps
 * @property {DetailState} detailState - The state of the detail view
 * @property {function} onClose - Callback function to close the detail view
 * @property {React.Dispatch<React.SetStateAction<EditorState | null>>} setDetailEditorState - Setter function for editor state
 */

/**
 * @typedef {Object} DetailState
 * @property {string | undefined} selectedTrackId - The ID of the selected track
 * @property {string | undefined} selectedActionId - The ID of the selected action
 * @property {string} selectedId - The selected ID
 */

/**
 * Detail view component
 * @param {DetailOutterProps} props - Props for the DetailView component
 * @returns {JSX.Element} JSX element representing the detail view
 */
export const DetailView = React.forwardRef(function DetailView(
  { detailState, onClose, setDetailEditorState }: DetailOutterProps, ref: React.Ref<HTMLDivElement>
) {
  const { state , dispatch } = useEditorContext();
  const { selected, selectedType, selectedAction, selectedTrack, selectedDetail } = state

  const { selectedTrackId, selectedActionId, selectedId } = detailState;
  const [initialized, setInitialized] = React.useState(false);
  const [currSelectedId, setCurrSelectedId] = React.useState('')

  React.useEffect(() => {
    setDetailEditorState(state);
  }, [state])

  React.useEffect(() => {
    const getSelectionData = () => {
      if (selectedActionId) {
        return getActionSelectionData(selectedActionId, state);
      }
      if (selectedTrackId) {
        const selectedIndex = state.file?.tracks.findIndex((track) => track.id === selectedTrackId);
        if (selectedIndex !== undefined && selectedIndex !== -1 && state.file?.tracks[selectedIndex]) {
          return { selectedTrack: state.file?.tracks[selectedIndex] };
        }
      }
      if (selectedId && state.file && selectedId === state.file.id) {
        return { selectedFile: state.file };
      }
      return {};
    }
    const selectionData: any = getSelectionData();
    if (selected?.id !== selectedId) {
      if (selectedActionId && 'selectedAction' in selectionData) {
        dispatch({ type: 'SELECT_ACTION', payload: selectionData.selectedAction });
        setCurrSelectedId(selectionData.selectedAction.id);
      } else if (selectedTrackId && 'selectedTrack' in selectionData) {
        dispatch({
          type: 'SELECT_TRACK',
          payload: selectionData.selectedTrack
        });
        setCurrSelectedId(selectionData.selectedTrack.id);
      } else if (selectedId && 'selectedFile' in selectionData) {
        dispatch({ type: 'SELECT_PROJECT' });
        setCurrSelectedId(selectionData.selectedFile.id);
      }
    }
  }, [])

  React.useEffect(() => {
    if (currSelectedId === ''){
      return;
    }
    if (selectedType === 'action' && selectedAction && (selectedDetail as ActionDetail).action.id !== selectedAction.id) {
      setCurrSelectedId(selectedAction.id);
      dispatch({ type: 'SELECT_ACTION',  payload: selectedAction });
    } else if (selectedType === 'track' && selectedTrack && (selectedDetail as TrackDetail).track.id !== selectedTrack.id) {
      setCurrSelectedId(selectedTrack.id);
      dispatch({ type: 'SELECT_TRACK',  payload: selectedTrack });
    } else if (selectedType === 'project' && state.file) {
      setCurrSelectedId(state.file.id);
      dispatch({ type: 'SELECT_PROJECT' });
    }
  }, [selected])

  /**
   * Handles the setting switch action
   */
  const settingSwitch = () => {
    dispatch({ type: 'SELECT_SETTINGS' });
  }

  return (
    <Card
      component={RootBox}
      sx={(theme) => ({
        maxWidth: '850px',
        width: '800px',
        minWidth: '500px',
        borderRadius: '12px',
        position: 'relative',
        minHeight: '600px',
        maxHeight: 'calc(100vh - 40px)',
        display: 'flex',
        overflowY: 'auto',
        backgroundImage: `linear-gradient(168deg, rgba(0, 59, 117, 0.4108018207282913) 0%,  ${theme.palette.mode === 'dark' ? '#000' : '#FFF'} 100%)`,
        backgroundColor: '#c7def5',
        '& .MuiFormControl-root .MuiInputBase-root .MuiInputBase-input': {
          webkitTextFillColor: theme.palette.text.primary
        }
      })}>
      <CardContent sx={(theme) => ({
        gap: '0.8rem',
        padding: '6px 24px 24px 24px',
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',

      })}>
        <Fab
          id={'settings'}
          color={'secondary'}
          aria-label="settings"
          size="small"
          sx={(theme) => ({
            position: 'absolute',
            right: '48px',
            margin: '8px',
          })}
          onClick={settingSwitch}
        >
          <SettingsIcon />
        </Fab>
        <Fab
          id={'close'}
          color={'info'}
          aria-label="close"
          size="small"
          sx={(theme) => ({
            position: 'absolute',
            right: '0px',
            margin: '8px',
          })}
          onClick={onClose}
        >
          <Close/>
        </Fab>
        <DetailCombined />
      </CardContent>
    </Card>
  );
});

/**
 * Detail modal component
 * @returns {JSX.Element} JSX element representing the detail modal
 */
function DetailModal () {
  const editorState = useEditorContext();
  const [initialized, setInitialized] = React.useState(false);
  const { state: {flags, file, selected, selectedAction, selectedTrack}, dispatch } = editorState;
  const [detailState, setDetailState] = React.useState<DetailState | null>(null);
  const [detailEditorState, setDetailEditorState] = React.useState<EditorState | null>(null);
  const [copiedFile, setCopiedFile] = React.useState<IEditorFile | null>(null);
  
  /**
   * Closes the detail modal
   */
  const onClose = () => {
    if (detailEditorState?.file) {
      dispatch({type: 'SET_FILE', payload: detailEditorState.file})
    }
    dispatch({ type: 'CLOSE_DETAIL',  });
    setInitialized(false);
  }

  React.useEffect(() => {
    if (flags.detailOpen && !initialized && file) {
      const newFile = new EditorFile({...file.data, files: file.files});
      newFile.preload('detail-editor').then(() => {
        setCopiedFile(newFile)
        setDetailState({ selectedTrackId: selectedTrack?.id, selectedActionId: selectedAction?.id, selectedId: selected!.id});
        setInitialized(true);
      })
    }
  }, [flags.detailOpen]);

  if (!detailState) {
    return undefined;
  }

  return (<Modal
    open={!!flags.detailOpen}
    onClose={onClose}
    aria-labelledby="modal-modal-title"
    aria-describedby="modal-modal-description"
    style={{ display: 'flex', alignItems: 'top', marginTop: '20px', marginBottom:'20px',  justifyContent: 'center' }}
  >
    <Box sx={{
      '&::visible-focus': {
        outline: 'none',
      },
      outline: 'none',
    }}>
      <EditorProvider file={copiedFile!} controllers={Controllers}>
          <DetailView onClose={onClose} detailState={detailState} setDetailEditorState={setDetailEditorState} />
      </EditorProvider>
    </Box>
  </Modal>)
}

DetailModal.flag = 'detailPopover';

export default DetailModal;
