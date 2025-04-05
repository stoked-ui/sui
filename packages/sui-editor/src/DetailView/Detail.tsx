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

/**
 * Styled component for cell in a control group.
 * @param {string} width - Width of the cell.
 * @returns {object} - Styled component for cell.
 */
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

/**
 * Styled component for a row in a control group.
 * @returns {object} - Styled component for a row.
 */
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

/**
 * Styled component for a column in a control group.
 * @returns {object} - Styled component for a column.
 */
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

/**
 * Styled component for a fieldset in a control group.
 * @returns {object} - Styled component for a fieldset.
 */
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

/**
 * Styled component for a label in a control group.
 * @returns {object} - Styled component for a label.
 */
export const CtrlLabel = styled('legend')(({theme}) => ({
  position: 'relative',
  display: 'flex',
  zIndex: 10,
  fontSize: '14px',
  fontWeight: 700,
  lineHeight: '23px',
  color: theme.palette.primary[900]
}))

/**
 * Props for a control group.
 * @typedef {object} CtrlGroupProps
 * @property {string} label - The label for the control group.
 */

/**
 * Functional component for a control group.
 * @param {CtrlGroupProps & React.HTMLProps<HTMLFieldSetElement>} props - Props for the control group.
 * @returns {JSX.Element} - Control group component.
 */
export const CtrlGroup = React.forwardRef(({ style, className, children, label }: CtrlGroupProps & React.HTMLProps<HTMLFieldSetElement>, ref: React.Ref<HTMLFieldSetElement>) => {
  return (
    <Box sx={{}}>
      {children}
    </Box>
  );
});

/**
 * Functional component for a fieldset in a control group.
 * @param {CtrlGroupProps & React.HTMLProps<HTMLFieldSetElement>} props - Props for the fieldset.
 * @returns {JSX.Element} - Fieldset component.
 */
export const CtrlFieldSet = React.forwardRef(({ style, className, children, label }: CtrlGroupProps & React.HTMLProps<HTMLFieldSetElement>, ref: React.Ref<HTMLFieldSetElement>) => {
  return (
    <CtrlGroupRoot ref={ref} className={className} style={style}>
      <CtrlLabel>{label}</CtrlLabel>
      {children}
    </CtrlGroupRoot>
  );
});

/**
 * Signature for form submit function.
 */
export interface SubmitSignature {
  form: UseFormHandleSubmit<any, any> | undefined,
  onSubmit: SubmitHandler<any>
}

/**
 * Styled form component for detail view.
 * @returns {object} - Styled form component.
 */
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

/**
 * Default alpha value for inputs.
 */
const inputDefaultAlpha = .4;

/**
 * Function to calculate background alpha based on theme.
 * @param {Theme} theme - The theme object.
 * @param {number} alphaMultiplier - The alpha multiplier.
 * @returns {string} - Background alpha value.
 */
const backgroundAlpha = (theme: Theme) => alpha(theme.palette.background.default, inputDefaultAlpha);

/**
 * Function to calculate alpha based on theme.
 * @param {Theme} theme - The theme object.
 * @param {number} alphaMultiplier - The alpha multiplier.
 * @returns {string} - Alpha value.
 */
const wAlpha = (theme: Theme, alphaMultiplier: number = inputDefaultAlpha) => alpha(theme.palette.background.default, alphaMultiplier);

/**
 * Styled component for root box.
 * @returns {object} - Styled component for root box.
 */
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
    '&::-webkit-color-swatch-wrapper': {
      border: 'none',
      borderRadius: '4px',
    },
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
  }
}));

/**
 * Format a title text.
 * @param {string} text - The text to format.
 * @returns {string} - Formatted title text.
 */
export function formatTitle(text: string): string {
  return text
  .replace(/[-.]+/g, " ") // Replace dashes and periods with spaces
  .split(" ") // Split the string into words
  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
  .join(" "); // Join the words back into a string
}

/**
 * Component for detailing actions.
 * @param {object} props - Props for detailing actions.
 * @returns {JSX.Element} - Detailing actions component.
 */
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

/**
 * Styled fieldset component for a track file.
 * @returns {object} - Styled fieldset component for a track file.
 */
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

/**
 * Component for the file detail view.
 * @returns {React.ReactNode} - File detail view component.
 */
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

/**
 * Hook for enabling and disabling edit mode.
 * @returns {object} - Edit mode hook.
 */
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

/**
 * Styled canvas component for detail renderer.
 */
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

/**
 * Styled root component for a form.
 */
const FormRoot = styled('div')(({theme}) => ({
  '& .MuiFormControl-root .MuiInputBase-root .MuiInputBase-input': {
    webkitTextFillColor: theme.palette.text.primary
  }
}));

/**
 * Component for wrapping a form with title and children.
 * @param {string} title - The title of the form.
 * @param {React.ReactNode} children - The form's children.
 * @param {string} titleId - The title ID.
 * @param {Function} submitHandler - The form submit handler.
 * @returns {JSX.Element} - Form wrapper component.
 */
export function FormWrap({ title, children, title