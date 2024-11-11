import * as React from "react";
import { IMediaFile } from '@stoked-ui/media-selector';
import { Button, Card, CardActions, CardContent, styled, Typography } from "@mui/material";
import { shouldForwardProp } from "@mui/system/createStyled";
import { IEngine, } from "@stoked-ui/timeline";
import { alpha, Theme } from "@mui/material/styles";
import _ from "lodash";
import {
  Control,
  FieldErrors,
  FieldValues,
  SubmitErrorHandler,
  SubmitHandler,
  UseFormHandleSubmit,
  UseFormReset
} from "react-hook-form";
import { DetailBreadcrumbs } from "./DetailBreadcrumbs";
import { MediaScreener } from "../Editor/Editor.styled";
import { DetailData, } from "./Detail.types";
import { UncontrolledText } from "./ControlledText";
import { humanFileSize } from "./DetailTrack.types";
import { useEditorContext } from "../EditorProvider";
import { Zettor } from "../EditorProvider/EditorProvider.types";

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

const inputDefaultAlpha = 1;
const backgroundAlpha = (theme: Theme) => alpha(theme.palette.background.default, inputDefaultAlpha);
export const RootBox = styled('div')(({theme}) => ({
  '& .SUI-form': {
    '& .MuiFormControl-root .MuiInputBase-root': {
      backgroundColor: alpha(theme.palette.background.default, inputDefaultAlpha),
      borderRadius: '4px'
    },
    '& input[type="color"]': {
      '-webkit-appearance': 'none',
      border: 'none',
      '&::-webkit-color-swatch-wrapper': {
        padding: '0px',
      },
      '&::-webkit-color-swatch': {
        border: 'none',
        borderRadius: '4px',
      },
    },
    '& input[type="color"]::-webkit-color-swatch-wrapper': {
      padding: '0px',
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
    '& .plyr.plyr--full-ui.plyr--video': {
      borderRadius: '6px'
    },
    '& .plyr--full-ui input[type=range]': {
      color: theme.palette.primary.main,
    },
    '& .plyr__control--overlaid': {
      background: theme.palette.primary.main,
    },
    '& .plyr--audio .plyr__control': {
      color: theme.palette.background.default,
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
    '& .MuiFormControl-root legend': {
      background: 'transparent',
      marginLeft: '5px',
      paddingRight: '2px',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
      '&.Mui-focused': {
        borderColor: theme.palette.primary.main
      }
    },
    '& .MuiFormLabel-root.MuiInputLabel-root.MuiInputLabel-shrink': {
      color: theme.palette.text.primary,
      padding: '3px 8px',
      borderRadius: '6px',
      backgroundImage: `linear-gradient(90deg, ${backgroundAlpha(theme)}, ${backgroundAlpha(theme)})`,
      backgroundSize: '100% 12px',
      backgroundRepeat: 'no-repeat'
    },
    '& .Mui-shrink-full .MuiFormLabel-root.MuiInputLabel-root.MuiInputLabel-shrink': {
      color: theme.palette.text.primary,
      padding: '3px 8px',
      borderRadius: '6px',
      backgroundImage: `linear-gradient(90deg, ${backgroundAlpha(theme)}, ${backgroundAlpha(theme)}), linear-gradient(90deg, ${theme.palette.background.paper}, ${theme.palette.background.paper})`,
      backgroundSize: '100% 12px, 100% 17px',
      backgroundPosition: '0 0, 0 100%',
      backgroundRepeat: 'no-repeat, no-repeat'
    },
  }
}));


export function DetailViewBase<ViewType extends FieldValues>({display, children
                                                               , control, errors, title,
                                                               formName, handleSubmit, onSubmit, editor,
                                                               isDirty, reset
}: {
  display: React.ReactNode,
  children: React.ReactNode,
  control: Control<any, any>,
  errors: FieldErrors<any>,
  formName: string,
  handleSubmit: (onValid: SubmitHandler<any>, onInvalid?: SubmitErrorHandler<any>) => (e?: React.BaseSyntheticEvent) => Promise<void>,
  isDirty: boolean
  onSubmit: SubmitHandler<ViewType>,
  reset: UseFormReset<any>,
  title: string,
  editor: Zettor,
}) {
  const { detail, dispatch, settings } = useEditorContext();
  return (
    <Card
      component={RootBox}
      sx={(theme) => ({

        maxWidth: '850px',
        minWidth: '500px',
        backgroundColor: theme.palette.background.default
      })}>
      <CardContent sx={(theme) => ({
        gap: '0.8rem',
        padding: '6px 24px 24px 24px',
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        background: `linear-gradient(168deg, rgba(0, 59, 117, 0.4108018207282913) 0%,  ${theme.palette.mode === 'dark' ? '#000' : '#FFF'} 100%)`,
        '& .MuiFormControl-root .MuiInputBase-root .MuiInputBase-input': {
          WebkitTextFillColor: theme.palette.text.primary
        }
      })}>

        <DetailBreadcrumbs  {...{ detail, control, editor, }} />
        <Typography variant="h6" sx={{
          marginTop: '6px'
        }}>
          {title}
        </Typography>
        {(detail.type === 'track' || detail.type === 'action') && <CtrlCell>
          <MediaScreener file={detail.file} />
        </CtrlCell>}
        <CtrlCell>
          {display}
        </CtrlCell>
        <div className={'SUI-form'}>
          <DetailForm
            id={formName}
            editMode={editor.isTrue(settings)}
            className={`SUI-form ${editor.isTrue(settings) ? 'editableForm' : 'disabledForm'}`}
            onSubmit={handleSubmit(onSubmit)}
          >
            {children}

          {editor.isTrue(settings) &&
            <CardActions sx={{ width: '100%', justifyContent: 'right'}}>
              <Button
                className=""
                variant="outlined"
                color="secondary"
                disabled={!isDirty}
                onClick={() => {
                  editor.unsetFunc();
                  reset(detail[detail.type]);
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
          }
          </DetailForm>
        </div>
    </CardContent>
  </Card>)
}

export function FileDetailView({ file, onClick }: { file?: IMediaFile, onClick: (event: Event) => void }): React.ReactNode {
  return (
    <CtrlGroup className={"SUI-form"} label={'Track File'}>
      <CtrlCell width="40%">
        <UncontrolledText
          className={'whitespace-nowrap flex-grow flex'}
          label={'File Name'}
          value={file?.name}
          disabled
          onClick={onClick}
        />
      </CtrlCell>

      <CtrlCell width="15%">
        <UncontrolledText
          className={'whitespace-nowrap flex-grow flex'}
          label={'Size'}
          value={file?.size}
          disabled
          onClick={onClick}
          format={humanFileSize}
        />
      </CtrlCell>
      <CtrlCell width="15%">
        <UncontrolledText
          className={'whitespace-nowrap flex-grow flex'}
          label={'Media Type'}
          value={file?.mediaType}
          disabled
          onClick={onClick}
        />
      </CtrlCell>
    </CtrlGroup>
  )
}
