/**
 * DetailTrack component.
 *
 * This component renders a form for editing track details.
 *
 * @param {DetailViewProps} props - Props for the component.
 */
export function DetailTrack(props: DetailViewProps) {
  /**
   * Extract edit mode and related properties from props.
   */
  const {
    editMode,
    enableEdit,
    disableEdit
  } = props;

  /**
   * Get editor context state and dispatch function.
   */
  const { state, dispatch } = useEditorContext();
  
  /**
   * Extract selected track detail, file, and current track data.
   */
  const { selectedDetail, selected, file} = state;
  const track = (selectedDetail as TrackDetail).track as IEditorTrackDetail;

  /**
   * Normalize track properties to default values if not provided.
   */
  track.blendMode = track.blendMode ?? 'normal';
  track.hidden = !!track.hidden;
  track.locked = !!track.locked;
  track.muted = !!track.muted;

  /**
   * Initialize react hook form for editing the track.
   */
  const {
    control,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
      isDirty
    }, reset,
  } = useForm<IEditorTrackDetail>({
    defaultValues: track,
    resolver: yupResolver(trackObjectSchema) as any,
  });

  /**
   * Handle form submission.
   *
   * Updates the track data and dispatches an update action to the editor context.
   */
  const onSubmit: SubmitHandler<IEditorTrackDetail> = (data) => {
    console.log('data', data);
    dispatch({ type: 'UPDATE_TRACK', payload: data });
    file?.save({ silent: true })
  };

  return (
    <FormWrap
      title={selected?.name}
      titleId={(props.detail as TrackDetail).track.id}
      submitHandler={handleSubmit(onSubmit)}
    >
      {/* Display all form errors */}
      {Object.keys(errors).length > 0 && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          <ul>
            {Object.entries(errors).map(([key, error]) => (
              <li key={key}>{error?.message}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div>
        <CtrlRow>
          <CtrlCell width="30%">
            <ControlledText
              className={'whitespace-nowrap flex-grow flex'}
              label={'Name'}
              name={'name'}
              control={control}
              disabled={!editMode}
              onClick={enableEdit}
            />
          </CtrlCell>
          <CtrlCell width="10%">
            <BlendModeSelect
              control={control}
              disabled={!editMode}
              onClick={enableEdit}
            />
          </CtrlCell>
          <CtrlCell width="30%">
            <ControlledCheckbox
              className={'whitespace-nowrap flex-grow flex'}
              label={'Hidden'}
              name={'hidden'}
              control={control}
              disabled={!editMode}
              onClickLabel={enableEdit}
              onClick={enableEdit}
            />
            <ControlledCheckbox
              className={'whitespace-nowrap flex-grow flex'}
              label={'Muted'}
              control={control}
              disabled={!editMode}
              onClickLabel={enableEdit}
              onClick={enableEdit}
            />
            <ControlledCheckbox
              className={'whitespace-nowrap flex-grow flex'}
              label={'Locked'}
              name={'locked'}
              control={control}
              disabled={!editMode}
              onClickLabel={enableEdit}
              onClick={enableEdit}
            />
          </CtrlCell>
          <CtrlCell width="40%">
            <ControlledSelect
              control={control}
              label={'Fit'}
              name={'fit'}
              defaultValue={'cover'}
              disabled={!editMode}
              onClick={enableEdit}
              options={[
                'none',
                'contain',
                'cover',
                'fill'
              ].map((option) => { return { value: option, label: formatTitle(option) }})}
              rules={{ required: "This field is required" }}
            />
          </CtrlCell>
          <CtrlCell width="40%">
            <ControlledText
              className={'whitespace-nowrap flex-grow flex'}
              label={'Url'}
              control={control}
              disabled={!editMode}
              onClick={enableEdit}
            />
          </CtrlCell>
        </CtrlRow>
        <DetailActions
          errors={errors}
          isDirty={isDirty}
          reset={reset}
          disableEdit={disableEdit}
          editMode={editMode}
        />
      </div>
    </FormWrap>
  )
}