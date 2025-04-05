/**
 * React component for displaying detail actions.
 * 
 * @param {object} props - The props for the DetailActions component.
 * @param {boolean} [props.disabled] - Whether the component is disabled.
 * @param {'small' | 'medium'} props.size - The size of the component.
 * @param {SxProps} [props.sx] - The style props for customization.
 * @param {(event: MouseEvent) => void} [props.onClick] - The click event handler.
 * 
 * @returns {JSX.Element} React element representing the DetailActions component.
 * 
 * @example
 * <DetailActions disabled={true} size="small" onClick={(e) => console.log('Clicked')} sx={{ margin: 10 }} />
 * 
 * @fires StokedSelect
 */
export default function DetailActions({ disabled, size, sx, onClick }: { onClick?: (event: MouseEvent) => void, disabled?: boolean, size: 'small' | 'medium' , sx?: SxProps }) {
  const { state: {selectedAction, selectedTrack}, dispatch,  } = useEditorContext();
  
  return <StokedSelect
    label={'Action'}
    placeholder={'Select Action'}
    name={'actions'}
    key={'id'}
    value={'id'}
    size={size}
    onClick={onClick || (() => {})}
    sx={sx}
    options={selectedTrack?.actions.map((action: ITimelineAction) => {
      return {
        value: action,
        label: `start: ${action.start}s; end: ${action.end}s`
      }
    })}
    onChange={(event: SelectChangeEvent,  child?: any) => {
      const newAction = selectedTrack?.actions.find((action) => action.id === child.props.value)
      if (newAction && (!selectedTrack || (newAction && selectedTrack.id !== newAction.id))) {
        dispatch({ type: 'SELECT_ACTION', payload: newAction})
      }
    }}
  />
}
