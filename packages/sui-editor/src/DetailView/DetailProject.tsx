/**
 * DetailProject component.
 *
 * @param {DetailViewProps} props - Component props
 */
export function DetailProject(props: DetailViewProps) {
  /**
   * State and dispatch from the editor context.
   */
  const { state: { file, selected , engine}, dispatch } = useEditorContext();

  /**
   * Form configuration for controlled text fields.
   */
  const {
    control,
    handleSubmit,
    formState: {
      isDirty,
      errors,
    },
    reset,
  } = useForm<IEditorProjectDetail>({
    defaultValues: props.detail.project as IEditorProjectDetail,
    resolver: yupResolver(projectSchema),
  });

  /**
   * Handler for the submit button click event.
   *
   * @param {IEditorProjectDetail} submitData - Form data
   */
  const detailSubmit: SubmitHandler<IEditorProjectDetail> = (submitData: IEditorProjectDetail) => {
    props.disableEdit();
    dispatch({ type: 'UPDATE_PROJECT', payload: submitData });
    file?.save({ silent: true })
  };

  return (
    <FormWrap
      title={selected?.name}
      titleId={props.detail.project.id}
      submitHandler={handleSubmit(detailSubmit)}
    >
      <div>

        <CtrlRow>
          {/**
           * Controlled text field for the project name.
           */}
          <CtrlCell width="40%">
            <ControlledText
              className={'whitespace-nowrap flex-grow flex'}
              label={'Name'}
              control={control}
              disabled={!props.editMode}
              onClick={props.enableEdit}
            />
          </CtrlCell>
          {/**
           * Controlled text field for the project creation date.
           */}
          <CtrlCell width="15%">
            <ControlledText
              className={'whitespace-nowrap flex-grow flex'}
              label={'Created'}
              name={'created'}
              control={control}
              disabled
              format={(epoch: number) => {
                if (epoch) {
                  return new Date(epoch).toDateString();
                }
                return epoch;
              }}
              onClick={props.enableEdit}
            />
          </CtrlCell>
          {/**
           * Controlled text field for the project last modified date.
           */}
          <CtrlCell width="15%">
            <ControlledText
              className={'whitespace-nowrap flex-grow flex'}
              label={'Last Modified'}
              name={'lastModified'}
              disabled
              control={control}
              format={(epoch: number) => {
                if (epoch) {
                  return new Date(epoch).toDateString();
                }
                return '';
              }}
              onClick={props.enableEdit}
            />
          </CtrlCell>
          {/**
           * Controlled text field for the project description.
           */}
          <CtrlCell width="40%">
            <ControlledText
              className={'whitespace-nowrap flex-grow flex'}
              label={'Description'}
              name={'description'}
              control={control}
              disabled={!props.editMode}
              onClick={props.enableEdit}
            />
          </CtrlCell>
          {/**
           * Uncontrolled text field for the project size.
           */}
          <CtrlCell width="15%">
            <UncontrolledText
              className={'w-[194px] whitespace-nowrap w-full flex-grow flex'}
              label={'Size'}
              value={`${file!.width} x ${file!.height}`}
              disabled
              onClick={props.enableEdit}
            />
          </CtrlCell>
          {/**
           * Controlled color field for the project background color.
           */}
          <CtrlCell width="15%">
            <ControlledColor
              className={'whitespace-nowrap flex-grow flex Mui-shrink-full'}
              label={'Background Color'}
              name={'backgroundColor'}
              type={'color'}
              control={control}
              disabled={!props.editMode}
              onClick={props.enableEdit}
              darkLabel={'rgb(0 2 3)'}
              lightLabel={'#ececec'}
            />
          </CtrlCell>
          {/**
           * Controlled text field for the project author.
           */}
          <CtrlCell width="40%">
            <ControlledText
              className={'whitespace-nowrap flex-grow flex'}
              label={'Author'}
              name={'author'}
              control={control}
              disabled={!props.editMode}
              onClick={props.enableEdit}
            />
          </CtrlCell>
        </CtrlRow>
        {/**
         * Actions for the project detail view.
         */}
        <DetailActions
          errors={errors}
          isDirty={isDirty}
          reset={reset}
          editMode={props.editMode}
          disableEdit={props.disableEdit}
        />
      </div>
    </FormWrap>
  );
}