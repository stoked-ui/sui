/**
 * DetailTracks component.
 * 
 * A dropdown select component for selecting tracks in the timeline editor.
 * 
 * @param {object} props - Component props
 * @param {boolean} [props.disabled=false] - Whether the component is disabled
 * @param {string} [props.size='small'] - The size of the select component
 * @param {SxProps<Theme>} [props.sx={}] - Custom styles for the component
 * @param {(event: Event) => void} [props.onClick] - Click event handler
 */
export default function DetailTracks({
  disabled = false,
  size = 'small',
  sx = {},
  onClick = () => {},
}) {
  /**
   * Editor context state.
   * 
   * Extracted from the useEditorContext hook for easier access to file and selected track data.
   * 
   * @type {object}
   */
  const { state: { file, selectedTrack }, dispatch } = useEditorContext();

  return (
    <StokedSelect
      /**
       * Label for the select component.
       * 
       * The label will be displayed above the options list.
       */
      label={'Track'}
      placeholder={'Select Track'}
      name={'tracks'}
      disabled={disabled}
      key={'id'}
      value={selectedTrack}

      /**
       * Size of the select component.
       * 
       * Can be 'small', 'medium', or 'large'.
       */
      size={size}
      onClick={onClick || (() => {})}
      options={
        file?.tracks?.map((track: ITimelineTrack) => {
          return {
            value: track,
            label: track.name
          }
        })
      }

      /**
       * Change event handler for the select component.
       * 
       * Dispatches an action to update the selected track when a new option is chosen.
       */
      onChange={(event: SelectChangeEvent, child?: any) => {
        if (child?.props.value) {
          dispatch({ type: 'SELECT_TRACK', payload: child.props.value as IEditorTrack });
        }
      }}
    />
  );
}