import * as React from "react";
import { IMediaFile, namedId } from '@stoked-ui/media-selector';
import { Button, CardActions, styled, Typography } from "@mui/material";
import { shouldForwardProp } from "@mui/system/createStyled";
import { alpha, Theme } from "@mui/material/styles";
import _ from "lodash";

import {
  FieldErrors,
  SubmitHandler,
  UseFormHandleSubmit,
  UseFormReset
} from "react-hook-form";
import { DetailBreadcrumbs } from "./DetailBreadcrumbs";
import { UncontrolledText } from "./ControlledText";
import { humanFileSize } from "./DetailTrack.types";
import Editor from "../Editor/Editor";
import {useEditorContext} from '../EditorProvider/EditorContext';

export const CtrlCell = styled('div', {
  name: 'MuiFileDetail',
  slot: 'Cell',
  overridesResolver: (props, styles) => styles.root,
  shouldForwardProp: (prop) => shouldForwardProp(prop)
                               && prop !== 'width'
})<{ width?: string }>
(({ theme, width }) => {
  return {
    width: width ? `${width}` : '100%',
    flexGrow: 1,
    display: 'flex',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary[800]
    },
    marginBottom: '8px'
  }
});

export const CtrlRow = styled('div', {
  name: 'MuiFileDetail',
  slot: 'row',
})(({theme}) => ({
  gap: '0.8rem',
  padding: '0.8rem 0rem',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  borderColor: `${alpha(theme.palette.primary[600], 0.3)}`
}))

export const CtrlColumn = styled('div', {
  name: 'MuiFileDetail',
  slot: 'column',
})(({theme}) => ({
  padding: '0.8rem 0rem',
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'nowrap',
  borderColor: `${alpha(theme.palette.primary[600], 0.3)}`
}))

const CtrlGroupRoot = styled('fieldset', {
  name: 'MuiFileDetail',
  slot: 'row',
})(({theme}) => ({
  gap: '0.8rem',
  padding: '0.8rem 1.2rem',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  borderRadius: '4px',
  borderColor: `${alpha(theme.palette.primary[600], 0.3)}`
}))

export const CtrlLabel = styled('legend')(({theme}) => ({
  position: 'relative',
  display: 'flex',
  zIndex: 10,
}))

export function CtrlGroup ({className, children, label}){
  return (
    <CtrlGroupRoot className={className}>
      <CtrlLabel>{label}</CtrlLabel>
      {children}
    </CtrlGroupRoot>
  )
}

export interface SubmitSignature {
  form: UseFormHandleSubmit<any, any> | undefined,
  onSubmit: SubmitHandler<any>
}

export const DetailForm = styled('form', {
  name: 'MuiDetail',
  slot: 'Cell',
  overridesResolver: (props, styles) => styles.root,
})
(({ theme}) => {
  return {
    '& video': {
      borderRadius: '6px'
    },
    '& canvas': {
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      left: 0,
      overflow: 'hidden',
      aspectRatio: `${16 / 9}`,
      borderRadius: '12px 12px 0px 0px',
      background: theme.palette.background.default,
      width: '100%',
      height: '100%'
    },
    variants: [{
      props: {
        editMode: false
      },
      style: {
        '& .MuiOutlinedInput-notchedOutline': {
          border: 'unset',
        }
      }
    }]
  }
});

const inputDefaultAlpha = .4;
const backgroundAlpha = (theme: Theme) => alpha(theme.palette.background.default, inputDefaultAlpha);
export const RootBox = styled('div')(({theme}) => ({

    '& .MuiFormControl-root .MuiInputBase-root': {
      // backgroundColor: alpha(theme.palette.background.default, inputDefaultAlpha),
      borderRadius: '4px'
    },

}));


export function DetailActions({ errors, isDirty, reset, disableEdit, editMode }: {
  errors: FieldErrors<any>,
  isDirty: boolean
  reset: UseFormReset<any>,
  editMode: boolean,
  disableEdit: () => void
}) {
  const { selectedDetail, selectedType } = useEditorContext();
  if (!selectedDetail || !selectedType || !editMode) {
    return undefined;
  }
  return (
    <CardActions sx={{ width: '100%', justifyContent: 'right'}}>
      <Button
        className=""
        variant="outlined"
        color="secondary"
        disabled={!isDirty && !editMode}
        onClick={() => {
          disableEdit();
          reset(selectedDetail[selectedType]);
        }}>
        Cancel
      </Button>
      <Button
        className=""
        variant="contained"
        color="secondary"
        type="submit"
        disabled={!isDirty || !_.isEmpty(errors)}
      >
        Save
      </Button>
    </CardActions>
  )
}

export function FileDetailView({ file }: { file?: IMediaFile }): React.ReactNode {
  return (
    <CtrlGroup className={"SUI-form"} label={'Track File'}>
      <CtrlCell width="40%">
        <UncontrolledText
          className={'whitespace-nowrap flex-grow flex'}
          label={'File Name'}
          value={file?.name}
          disabled
        />
      </CtrlCell>

      <CtrlCell width="15%">
        <UncontrolledText
          className={'whitespace-nowrap flex-grow flex'}
          label={'Size'}
          value={file?.size}
          disabled
          format={humanFileSize}
        />
      </CtrlCell>
      <CtrlCell width="15%">
        <UncontrolledText
          className={'whitespace-nowrap flex-grow flex'}
          label={'Media Type'}
          value={file?.mediaType}
          disabled
        />
      </CtrlCell>
    </CtrlGroup>
  )
}

export function useEditMode() {
  const [editMode, setEditMode] = React.useState(false);
  const setEdit = () => {
    console.info('edit mode: enabled');
    setEditMode(true);
  }
  const setDisable = () => {
    console.info('edit mode: disabled');
    setEditMode(false);
  }
  return { editMode, setEdit, setDisable };
}

const DetailRenderer = styled('canvas', {
  name: "MuiEditorViewRenderer",
  slot: "renderer",
})(({theme}) => ({
  display: 'flex',
  flexDirection: 'column',
  left: 0,
  overflow: 'hidden',
  aspectRatio: `${16 / 9}`,
  borderRadius: '12px 12px 0px 0px',
  background: theme.palette.background.default,
  width: '100%',
  height: '100%'
}));

export function FormWrap({ title, handleSubmit, onSubmit, children}) {
  const context = useEditorContext();
  const {  settings, selectedType, file,  selectedTrack } = context;
  const { detailHandleSubmit, detailOnSubmit, selected } = settings;

  let submit = () => {};
  if (detailHandleSubmit && detailOnSubmit) {
    submit = detailHandleSubmit(detailOnSubmit);
  }
  return <React.Fragment>
    <DetailBreadcrumbs />
    <div style={{ overflowY: 'scroll',      maxHeight: 'calc(100vh - 40px)',
    }}>
      <Typography variant="h6" sx={{
        marginTop: '6px'
      }}>
        {title}
      </Typography>

      <Editor
        file={file || undefined}
        detailMode
        noLabels
        noSaveControls
        noTrackControls
        sx={(theme) => ({ border: '1px solid #999' })}
      />

      {selectedType && selectedType !== 'project' && <FileDetailView file={selectedTrack!.file} />}
      <div className={'SUI-form'}>
        <DetailForm
          id={'detailView'}
          className={`SUI-form}`}
          onSubmit={submit}
        >
          {children}
        </DetailForm>
      </div>
    </div>
  </React.Fragment>
}

