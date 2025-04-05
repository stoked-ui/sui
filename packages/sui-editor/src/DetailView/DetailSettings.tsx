/**
 * DetailSettings component displays the settings, flags, and components of the detail view.
 * 
 * @param {DetailViewProps} props - The props for the DetailSettings component.
 * @returns {JSX.Element} The DetailSettings component JSX element.
 * 
 * @example
 * <DetailSettings />
 * 
 * @see DetailViewProps
 */
export function DetailSettings(props: DetailViewProps) {
  const { state, dispatch } = useEditorContext();
  console.info('settings', state.settings);
  const settingsDoc = JSON.parse(JSON.stringify(state.settings));
  const flagsDoc = JSON.parse(JSON.stringify(state.flags));

  /**
   * State to store the documentation objects for settings, flags, and components.
   * @typedef {{settingsDoc: object, flagsDoc: object, componentDoc: object}} DocsState
   */
  const [docs, setDocs] = React.useState<{settingsDoc: object, flagsDoc: object, componentDoc: object}>();
  
  React.useEffect(() => {
    setDocs({ settingsDoc: state.settings, flagsDoc: state.flags, componentDoc: state.components})
  }, []);

  return (
    <div>
      <CtrlRow>
        <CtrlCell width="95%">
          <Typography>Settings</Typography>
          <pre>
            {JSON.stringify(settingsDoc, null, 2)}
          </pre>
        </CtrlCell>
      </CtrlRow>
      <CtrlRow>
        <CtrlCell width="95%">
          <Typography>Flags</Typography>
        </CtrlCell>
      </CtrlRow>
      <CtrlRow>
        <CtrlCell width="95%">
          <Typography>Components</Typography>
        </CtrlCell>
      </CtrlRow>
    </div>
  )
}