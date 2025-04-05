/**
 * DetailTracks component displays a select component for selecting a track.
 * It is used in the editor for track selection.
 * 
 * @param {boolean} [disabled] - Specifies if the select component is disabled
 * @param {'small' | 'medium' | 'large'} size - Specifies the size of the select component
 * @param {SxProps<Theme>} sx - Custom styling properties for the select component
 * @param {(event: Event) => void} [onClick] - Click event handler function
 * 
 * @returns {JSX.Element} - Returns the JSX element of the DetailTracks component
 * 
 * @example
 * <DetailTracks 
 *   disabled={false} 
 *   size='medium' 
 *   sx={{ padding: '10px' }} 
 *   onClick={(e) => console.log('Clicked')}
 * />
 * 
 * @fires SelectChangeEvent - Emits when the select component value changes
 * 
 * @see StokedSelect
 * @see EditorProvider/EditorContext
 * @see EditorTrack/EditorTrack
 */
export default function DetailTracks({ disabled, size, sx, onClick }: { onClick?: (event: Event) => void, disabled?: boolean, size: 'small' | 'medium' | 'large', sx: SxProps<Theme> }) {
  const { state: {file, selectedTrack}, dispatch } = useEditorContext();
  return <StokedSelect
    label={'Track'}
    placeholder={'Select Track'}
    name={'tracks'}
    disabled={disabled}
    key={'id'}
    value={selectedTrack}

    size={'small'}
    onClick={onClick || (() => {})}
    options={file?.tracks?.map((track: ITimelineTrack) => {
      return {
        value: track,
        label: track.name
      }
    })}
    onChange={(event: SelectChangeEvent, child?: any) => {

      if (child.props.value) {
        dispatch({ type: 'SELECT_TRACK', payload: child.props.value as IEditorTrack });
      }
    }}
  />
}
