import * as React from "react";
import {Box, Button, CardActions, Fade, styled, Typography} from "@mui/material";
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
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  borderRadius: '4px',
  padding: '6px 5px 0px 5px',
  borderColor: `${alpha(theme.palette.primary[600], 1)}`
}))

export const CtrlLabel = styled('legend')(({theme}) => ({
  position: 'relative',
  display: 'flex',
  zIndex: 10,
  fontSize: '14px',
  fontWeight: 700,
  lineHeight: '23px',
  color: theme.palette.primary[900]
}))

export interface CtrlGroupProps {
  label: string,
}

export const CtrlGroup = React.forwardRef(({ style, className, children, label }: CtrlGroupProps & React.HTMLProps<HTMLFieldSetElement>, ref: React.Ref<HTMLFieldSetElement>) => {
  return (
    <Box sx={{}}>
      {children}
    </Box>
  );
});

export const CtrlFieldSet = React.forwardRef(({ style, className, children, label }: CtrlGroupProps & React.HTMLProps<HTMLFieldSetElement>, ref: React.Ref<HTMLFieldSetElement>) => {
  return (
    <CtrlGroupRoot ref={ref} className={className} style={style}>
      <CtrlLabel>{label}</CtrlLabel>
      {children}
    </CtrlGroupRoot>
  );
});

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
const wAlpha = (theme: Theme, alphaMultiplier: number = inputDefaultAlpha) => alpha(theme.palette.background.default, alphaMultiplier);
export const RootBox = styled('div')(({theme}) => ({
  '& .MuiFormControl-root': {
    '& .MuiFormLabel-root.MuiInputLabel-outlined': {
      color:`${theme.palette.mode === 'dark' ? theme.palette.primary[300] : theme.palette.primary[600]}!important`,
      fontWeight: 'bold',
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
        '&.Mui-focused': {
          borderColor: theme.palette.primary.main
        }
      },
    },
    '& .MuiOutlinedInput-root.Mui-disabled': {
      color: `${theme.palette.text.primary}!important`,
      '& fieldset': {
        border: 0,
      },
      '& MuiInputLabel-root.Mui-disabled': {
        color:`${theme.palette.primary.main}!important`,
      },
      '& label': {
        color: `${theme.palette.primary.main}!important`,
      }
    },
  },
  '& .MuiInputBase-input.MuiOutlinedInput-input.Mui-disabled': {
    WebkitTextFillColor: theme.palette.text.primary,
  },
  '& .MuiFormControl-root .MuiInputBase-root': {
    backgroundColor: alpha(theme.palette.background.default, inputDefaultAlpha),
    borderRadius: '4px'
  },
  '& input[type="color"]': {
    '-webkit-appearance': 'none',
      // border: 'none',
    '&::-webkit-color-swatch-wrapper': {
      // padding: '0px',
    },
    '&::-webkit-color-swatch': {
      border: 'none',
      borderRadius: '4px',
    },
  },
  '& input[type="color"]::-webkit-color-swatch-wrapper': {
    // padding: '0px',
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
  },

  /*
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
  }, */
}));


export function formatTitle(text: string): string {
  return text
  .replace(/[-.]+/g, " ") // Replace dashes and periods with spaces
  .split(" ") // Split the string into words
  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
  .join(" "); // Join the words back into a string
}

export function DetailActions({ errors, isDirty, reset, disableEdit, editMode}: {
  errors: FieldErrors<any>,
  isDirty: boolean
  reset: UseFormReset<any>,
  editMode: boolean,
  disableEdit: () => void,
}) {
  const {state: {file, selectedDetail, selectedType}} = useEditorContext();
  if (!selectedDetail || !selectedType || !editMode) {
    return undefined;
  }

  return (<CardActions sx={{width: '100%', justifyContent: 'right'}}>
    <ul>
      {Object.values(errors).map((error) => (<li>{error?.message?.toString()}</li>))}
    </ul>
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
      type={'submit'}
      disabled={!isDirty || !_.isEmpty(errors)}
    >
      Save
    </Button>
  </CardActions>)
}

const TrackFile = styled(CtrlFieldSet, {
  shouldForwardProp: (prop) => prop !== 'style'
})(({theme, style}) => ({
  ...style,
  position: 'absolute',
  scale: '0.8!important',
  transformOrigin: 'center bottom',
  background: `linear-gradient(168deg, ${theme.palette.mode === 'dark' ? '#285b8a' : '#7bafdf'} 0%,  ${theme.palette.mode === 'dark' ? '#000' : '#FFF'} 100%)`,
  marginBottom: '6px',
  borderRadius: '8px',
  bottom: '0px',
  '& legend': {
    background:  `${theme.palette.mode === 'dark' ? '#235179' : '#83b2de'}`,
    borderRadius: '6px',
    color: `${theme.palette.mode === 'dark' ? '#67b7ff' : '#285b8a'}`,
    padding: '0px 4px',
  },
  '& .MuiInputBase-root.MuiOutlinedInput-root': {
    height: '38px'
  },
  '& input': {
    'WebkitTextFillColor': 'text.primary',
  },
  '& .Mui-shrink-full .MuiFormLabel-root.MuiInputLabel-root.MuiInputLabel-shrink': {
    color: theme.palette.text.primary,
    padding: '3px 8px',
    borderRadius: '6px',
    // backgroundImage: `linear-gradient(90deg, ${backgroundAlpha(theme)},
    // ${backgroundAlpha(theme)}), linear-gradient(90deg, ${theme.palette.background.paper}, ${theme.palette.background.paper})`,
    backgroundImage: `linear-gradient(168deg, rgba(0, 59, 117, 0.9108018207282913) 0%,  ${theme.palette.mode === 'dark' ? '#000' : '#FFF'} 100%)`,
    backgroundSize: '100% 12px, 100% 17px',
    backgroundPosition: '0 0, 0 100%',
    backgroundRepeat: 'no-repeat, no-repeat',

  },
}));

export function FileDetailView(): React.ReactNode {
  const { state: { selectedTrack, flags, engine}, dispatch } = useEditorContext();
  const ref = React.useRef<HTMLFieldSetElement>(null);

  if (!selectedTrack?.file) {
    return null;
  }

  return (
    <Fade in={flags.showViewControls || true}
      id={'file-detail'}
     >
      <RootBox style={{
        zIndex: 1000,
        padding: '8px',
        justifyItems: 'center',
        display: 'grid',
      }}>
        <TrackFile
          onMouseEnter={() => {
            dispatch({ type: 'SET_FLAGS', payload: { add: ['showViewControls'] }});
          }}
          onMouseLeave={() => {
            dispatch({ type: 'SET_FLAGS', payload: { remove: ['showViewControls'] }});
          }}

          className={"file-detail-view"}
          label={'Track File'}
          ref={ref}
        >
          <CtrlCell width="40%">
            <UncontrolledText
              className={'whitespace-nowrap flex-grow flex'}
              label={'File Name'}
              value={selectedTrack?.file?.name}
              disabled
            />
          </CtrlCell>
          <CtrlCell width="5%">
            <UncontrolledText
              className={'whitespace-nowrap flex-grow flex'}
              label={'Size'}
              value={selectedTrack?.file?.size}
              disabled
              format={humanFileSize}
            />
          </CtrlCell>
          <CtrlCell width="5%">
            <UncontrolledText
              className={'whitespace-nowrap flex-grow flex'}
              label={'Media Type'}
              value={selectedTrack?.file?.mediaType}
              disabled
            />
          </CtrlCell>
          {['video', 'audio'].includes(selectedTrack?.file?.mediaType) &&
           <CtrlCell width="5%">
             <UncontrolledText
               className={'whitespace-nowrap flex-grow flex'}
               label={'Duration'}
               value={`${selectedTrack?.file?.media?.duration?.toFixed(2)}s`}
               disabled
             />
           </CtrlCell>
          }
        </TrackFile>
      </RootBox>
    </Fade>
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

const FormRoot = styled('div')(({theme}) => ({
  '& .MuiFormControl-root .MuiInputBase-root .MuiInputBase-input': {
    webkitTextFillColor: theme.palette.text.primary
  }
}));

export function FormWrap({ title, children, titleId, submitHandler}) {
  const context = useEditorContext();
  const {state, dispatch} = context;
  const {settings, selectedType, file, engine } = state;
  const {detailHandleSubmit, detailOnSubmit, selected} = settings;
  const ref = React.useRef<HTMLDivElement>(null);
  const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout>();
  React.useEffect(() => {
    if (ref.current && ref.current?.clientWidth) {
      console.info('ref.current.clientWidth', ref.current.clientWidth);
      const width = ref.current.clientWidth - 14;
      const scaledData = settings.fitScaleData(context, true, width, 'detailViews');
      dispatch({ type: 'SET_SETTING', payload: {value: {...scaledData,}} })
    }
  }, [file, engine.maxDuration, ref.current?.clientWidth]);

  let submit = () => {
  };
  if (detailHandleSubmit && detailOnSubmit) {
    submit = detailHandleSubmit(detailOnSubmit);
  }
  const robustView = (
    <div style={{}}>
      <Editor
        file={file || undefined}
        id={'detail-editor'}
        detailMode
        ref={ref}
        sx={(theme) => ({border: '1px solid #999'})}
      >
        <FileDetailView/>
      </Editor>

      <div className={'SUI-form'}>
        <DetailForm
          id={'detailView'}
          className={`SUI-form}`}
          onSubmit={submitHandler}
        >
          {children}
        </DetailForm>
      </div>
    </div>)

  const baseView = <React.Fragment>{children}</React.Fragment>
  return (<FormRoot>
    <div id={'detail-header'}>
      <DetailBreadcrumbs/>
      <Typography variant="h6" sx={{
        marginTop: '6px'
      }}>
        <Typography variant="caption" sx={{  position: 'relative', top: '-0.5em', fontSize: '55%', fontWeight: '300' }}>[{titleId}]</Typography> {title}
      </Typography>
    </div>

    {selectedType === 'settings' ?
      baseView :
      robustView
    }
  </FormRoot>)
}
/*

const FormRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%', // Ensure the container takes full height
  position: 'relative',

  '& #detail-header': {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    backgroundColor: '#fff',
    padding: '10px 0', // Optional: Add some padding for visual separation
  },

  '& .MuiFormControl-root .MuiInputBase-root .MuiInputBase-input': {
    webkitTextFillColor: theme.palette.text.primary,
  },

  // Add styles for the scrollable form content
  '& .form-content': {
    overflowY: 'auto', // Make the content scrollable
    flex: 1, // Allow the content to grow and shrink to fill the available space
    padding: '10px', // Optional: Add padding around the form content
  },
}));

export function FormWrap({ title, children, titleId, submitHandler }) {
  const context = useEditorContext();
  const { state, dispatch } = context;
  const { settings, selectedType, file } = state;
  const { detailHandleSubmit, detailOnSubmit, selected } = settings;
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (ref.current?.clientWidth) {
      console.info('ref.current.clientWidth', ref.current.clientWidth);
      const scaledData = settings.fitScaleData(context, true, ref.current.clientWidth - 14);
      dispatch({ type: 'SET_SETTING', payload: { value: { ...scaledData } } });
    }
  }, [ref.current?.clientWidth]);

  let submit = () => {};
  if (detailHandleSubmit && detailOnSubmit) {
    submit = detailHandleSubmit(detailOnSubmit);
  }

  const robustView = (
    <div className="form-content">
      <Editor
        file={file || undefined}
        id={'detail-editor'}
        detailMode
        ref={ref}
        sx={(theme) => ({ border: '1px solid #999' })}
      >
        <FileDetailView />
      </Editor>

      <div className={'SUI-form'}>
        <DetailForm
          id={'detailView'}
          className={`SUI-form`}
          onSubmit={submitHandler}
        >
          {children}
        </DetailForm>
      </div>
    </div>
  );

  const baseView = <React.Fragment>{children}</React.Fragment>;

  return (
    <FormRoot>
      <div id={'detail-header'}>
        <DetailBreadcrumbs />
        <Typography variant="h6" sx={{ marginTop: '6px' }}>
          <Typography variant="caption" sx={{ position: 'relative', top: '-0.5em', fontSize: '55%', fontWeight: '300' }}>
            [{titleId}]
          </Typography>{' '}
          {title}
        </Typography>
      </div>

      {selectedType === 'settings' ? baseView : robustView}
    </FormRoot>
  );
}
*/

