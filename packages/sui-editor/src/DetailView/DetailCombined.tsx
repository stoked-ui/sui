/**
 * Main component for displaying and editing details.
 * @returns {JSX.Element} React component representing the combined detail view
 */
export function DetailCombined() {
  const { state: {selectedType, selectedDetail, settings, selected} } = useEditorContext();
  const [editMode, setEditMode] = React.useState(false);

  /**
   * Enable edit mode for the detail view.
   */
  const enableEdit = () => {
    console.info('edit mode: enabled');
    setEditMode(true);
  }

  /**
   * Disable edit mode for the detail view.
   */
  const disableEdit = () => {
    console.info('edit mode: disabled');
    setEditMode(false);
  }

  const isAction = selectedType === 'action';
  const isTrack = selectedType === 'track';
  const isProject = selectedType === 'project';
  const isSettings = selectedType === 'settings';

  return (
    <React.Fragment>
      {isTrack && <DetailTrack detail={selectedDetail!} enableEdit={enableEdit} disableEdit={disableEdit} editMode={editMode} />}
      {isAction &&  <DetailAction detail={selectedDetail!} enableEdit={enableEdit} disableEdit={disableEdit} editMode={editMode} />}
      {isProject && <DetailProject detail={selectedDetail!} enableEdit={enableEdit} disableEdit={disableEdit} editMode={editMode} />}
      {isSettings && <DetailSettings detail={selectedDetail!} enableEdit={enableEdit} disableEdit={disableEdit} editMode={editMode} />}
    </React.Fragment>
  )
}