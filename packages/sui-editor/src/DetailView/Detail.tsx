import * as React from "react";
import {
  Box, Breadcrumbs,
  Button,
  Card,
  CardActions,
  CardContent,
  Link,
  styled,
  Typography
} from "@mui/material";
import {shouldForwardProp} from "@mui/system/createStyled";
import { IMediaFile } from "@stoked-ui/media-selector";
import { ITimelineFile, IEngine, ITimelineAction, ITimelineTrack } from "@stoked-ui/timeline";
import {alpha} from "@mui/material/styles";
import Plyr, {PlyrProps} from "plyr-react";
import {SelectChangeEvent} from "@mui/material/Select";
import _ from "lodash";
import {
  Control, DefaultValues, KeepStateOptions, SubmitErrorHandler, SubmitHandler, UseFormHandleSubmit, UseFormReset, FieldErrors
} from "react-hook-form";
import {getVideoFormData} from "./DetailVideoView.types";
import {
  getFileFormData, getTrackFormData, IDetailFile, IDetailTrack
} from "./DetailTrackView.types";

import {IDetailAction, getActionFormData} from "./DetailActionView.types";
import DetailBreadcrumbs from "./DetailBreadcrumbs";

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
  borderColor: `${alpha(theme.palette.primary[600], 0.3)}`
}))

export const CtrlLabel = styled('legend')(({theme}) => ({
  position: 'relative',
  display: 'flex',
  zIndex: 10,
}))

export function CtrlGroup ({children, label}){
  return <CtrlGroupRoot>
      <CtrlLabel>{label}</CtrlLabel>
      {children}
  </CtrlGroupRoot>
}

export interface IDetailData {
  video: ITimelineFile,
  tracks: ITimelineTrack[],
  file?: IDetailFile,
  track?: IDetailTrack,
  action?: IDetailAction
}

export interface SubmitSignature {
  form: UseFormHandleSubmit<any, any> | undefined,
  onSubmit: SubmitHandler<any>
}

export interface DetailTypeProps {
  setEditMode:  React.Dispatch<React.SetStateAction<boolean>>;
  editMode: boolean;
  onClickEdit: (event: Event) => void;
  formRef: React.RefObject<HTMLFormElement>;
  breadcrumbs: React.JSX.Element;
  detail: DetailSelection;
  setDetail: React.Dispatch<React.SetStateAction<DetailSelection>>;
  formData: IDetailData,
  setFormData: React.Dispatch<React.SetStateAction<IDetailData>>;
  schema: any;
  onClose: () => void;
}

export const DetailForm = styled('form', {
  name: 'MuiDetail',
  slot: 'Cell',
  overridesResolver: (props, styles) => styles.root,
  shouldForwardProp: (prop) => shouldForwardProp(prop)
                               && prop !== 'editMode'
})<{ editMode: boolean }>
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

export const RootBox = styled('div')(({theme}) => ({
  '& .MuiInputBase-root': {
    backgroundColor: theme.palette.background.default,
    borderRadius: '4px'
  },
  '& video, audio': {
    borderRadius: '6px'
  },
  '& .MuiChip-root': {
    backgroundColor: theme.palette.background.paper
  },
  '& .MuiChip-avatar': {
    backgroundColor: theme.palette.background.default
  },
  '& .MuiTooltip-tooltip': {
    backgroundColor: 'red',
    color: 'white'
  },
  '& .disabledForm input': {
    'WebkitTextFillColor': theme.palette.text.primary
  },
  '& .disabledForm .MuiSelect-select': {
    'WebkitTextFillColor': theme.palette.text.primary
  },
  '& .disabledForm textarea': {
    'WebkitTextFillColor': theme.palette.text.primary
  },
  '& .disabledForm fieldset': {
    display: 'none'
  },
  '& input[disabled]': {
    pointerEvents: 'none'
  },
  '& textarea[disabled]': {
    pointerEvents: 'none'
  },
  /*
   background-color: hsl(210, 14%, 22%);
   border-color: hsl(210, 14%, 36%);
   color: hsl(215, 15%, 92%);
   outline-color: hsl(210, 100%, 45%);
   */
  '& .plyr.plyr--full-ui.plyr--video':{
    borderRadius: '6px'
  },
  '& .plyr--full-ui input[type=range]': {
    color: theme.palette.primary.main,
  },
  '& .plyr__control--overlaid': {
    background: theme.palette.primary.main,
  },
  '& .plyr--audio .plyr__control': {
    color: theme.palette.text.primary
  },
  '& .plyr--audio .plyr__control:hover': {
    background: theme.palette.primary.main,
    color: theme.palette.secondary.main
  },
  '&  .plyr--video .plyr__control.plyr__tab-focus, .plyr--video.plyr__control[aria-expanded=true]': {
    background: theme.palette.secondary.main,
  },
  '& .plyr__control .plyr__tab-focus': {
    boxShadow: '0 0 0 5px #FFF',
  },
  '& .plyr__menu__container': {
    background: 'hsl(210, 14%, 7%)',
  },
  '& .plyr--audio .plyr__controls': {
    background: 'hsl(210, 14%, 7%)',
    borderRadius: '6px'
  },
  '& .plyr__controls__item.plyr__time--current, .plyr__controls__item.plyr__time--duration.plyr__time': {
    color: '#FFF'
  },
  '& .MuiFormLabel-root.MuiInputLabel-root': {
    color: theme.palette.text.primary,
    padding: '3px 8px',
    borderRadius: '6px',
    background: theme.palette.background.default
  }
}));

export type DetailSelection = {
  video: ITimelineFile,
  track?: ITimelineTrack,
  action?: ITimelineAction,
  selectedFile?: IMediaFile
}

export function getFormData(detail: DetailSelection, tracks: ITimelineTrack[]): IDetailData {
  const video = getVideoFormData(detail, tracks);
  const track = getTrackFormData(detail);
  const file = getFileFormData(detail);
  const action = getActionFormData(detail);
  return {
    video,
    tracks,
    track,
    file,
    action,
  }
}

export function AudioPlayer({mediaFile}: {mediaFile: IMediaFile}){
  const audioSource:  Plyr.SourceInfo = {
    type: 'audio',
    sources: [
      {
        src: mediaFile.url, // Replace with your audio selectedFile URL
        type: mediaFile.type,
      },
    ],
  };

  return (
    <Plyr source={audioSource} />
  );
}

export function VideoPlayer({mediaFile}: {mediaFile: IMediaFile}){
  const plyrProps: PlyrProps = {
    source: {
      type: 'video',
      title: mediaFile.name,
      sources: [
        {
          src: mediaFile.url,
        },
      ],
    },
  }

  React.useEffect(() => {
    return () => {
    }
  }, [])
  return <Plyr source={plyrProps.source} options={{controls: ['play', 'progress', 'mute', 'volume']}} />
}



export function DetailViewBase({children,title, formName, editMode,engine, handleSubmit, onSubmit, detail, setDetail, errors, control, onClickEdit, formData, isDirty, reset, setEditMode, onClose}: {
  children: React.ReactNode,
  control: Control<any, any>,
  detail: DetailSelection,
  editMode: boolean,
  engine: IEngine,
  errors: FieldErrors<any>,
  formData: IDetailData,
  formName: string,
  handleSubmit: (onValid: SubmitHandler<any>, onInvalid?: SubmitErrorHandler<any>) => (e?: React.BaseSyntheticEvent) => Promise<void>,
  isDirty: boolean
  onClickEdit: (event: Event) => void,
  onSubmit: SubmitHandler<any>,
  reset: UseFormReset<any>,
  setDetail: React.Dispatch<React.SetStateAction<DetailSelection>>,
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>,
  title: string,
  onClose: () => void
}) {

  return <DetailForm
      id={formName}
      editMode={editMode}
      className={`form ${editMode ? 'editableForm' : 'disabledForm'}`}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Card
        component={RootBox}
        sx={(theme) => ({
          maxWidth: '850px',
          minWidth: '500px',
          backgroundColor: `${alpha(theme.palette.primary[900],0.2)}!important`,
        })}>
        <CardContent sx={{
          gap: '0.8rem',
          padding: '6px 24px 24px 24px',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'wrap'
        }}>
          <DetailBreadcrumbs  {...{ detail, formData, setDetail, control, onClickEdit, }} />
          <Typography variant="h6" sx={{
            marginTop: '6px'
          }}>
            {title}
          </Typography>
          {(detail.track || detail.action) && <CtrlCell>
            {(detail.track && detail.selectedFile) && <VideoPlayer mediaFile={detail.selectedFile} />}
            {detail.selectedFile?.mediaType === 'audio' && <AudioPlayer mediaFile={detail.selectedFile} />}
            {detail.selectedFile?.mediaType === 'image' && <img src={detail.selectedFile.url} alt={detail.selectedFile.name} style={{ maxWidth: '100%' }} />}
          </CtrlCell>}
          {children}
          <CardActions sx={{ width: '100%', justifyContent: 'right'}}>
            <Button
              className=""
              variant="outlined"
              color="secondary"
              onClick={() => {

                setEditMode(false);
                onClose();
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
        </CardContent>
      </Card>
    </DetailForm>
}
