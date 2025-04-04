/**
 * DetailActions component
 * 
 * This component is used to display a select dropdown for choosing an action in the timeline editor.
 * It receives the following props:
 *   - disabled: whether the select button should be disabled
 *   - size: the size of the select dropdown (either 'small' or 'medium')
 *   - sx: custom styles for the component
 *   - onClick: a callback function to handle the click event on the select button
 */

export default function DetailActions({
  /**
   * Whether the select button should be disabled.
   */
  disabled,

  /**
   * The size of the select dropdown (either 'small' or 'medium').
   */
  size: 'small' | 'medium',

  /**
   * Custom styles for the component.
   */
  sx?: SxProps,

  /**
   * A callback function to handle the click event on the select button.
   * If not provided, an empty function will be used as a fallback.
   */
  onClick?: (event: MouseEvent) => void,
}) {
  const { 
    state: { selectedAction, selectedTrack }, 
    dispatch, 
  } = useEditorContext();

  return (
    <StokedSelect
      /**
       * The label for the select dropdown.
       */
      label={'Action'}
      
      /**
       * The placeholder text for the select dropdown.
       */
      placeholder={'Select Action'}
      
      /**
       * The name attribute for the select dropdown.
       */
      name={'actions'}
      
      /**
       * A unique key for each option in the select dropdown.
       */
      key={'id'}
      
      /**
       * The value of each option in the select dropdown.
       */
      value={'id'}
      
      /**
       * The size of the select dropdown.
       */
      size={size}
      
      /**
       * A callback function to handle the click event on the select button.
       */
      onClick={onClick || (() => {})}
      
      /**
       * Custom styles for the component.
       */
      sx={sx}
      
      /**
       * The options in the select dropdown.
       */
      options={selectedTrack?.actions.map((action: ITimelineAction) => {
        return {
          value: action,
          label: `start: ${action.start}s; end: ${action.end}s`
        }
      })}
      
      /**
       * A callback function to handle changes in the select dropdown.
       */
      onChange={(event: SelectChangeEvent, child?: any) => {
        const newAction = selectedTrack?.actions.find((action) => action.id === child.props.value)
        
        if (newAction && (!selectedTrack || (newAction && selectedTrack.id !== newAction.id))) {
          dispatch({ type: 'SELECT_ACTION', payload: newAction})
        }
      }}
    />
  );
}