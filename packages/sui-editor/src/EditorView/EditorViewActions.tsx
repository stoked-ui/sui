import * as React from "react";
import PropTypes from "prop-types";
import Fab from "@mui/material/Fab";
import Stack from "@mui/material/Stack";
import Zoom from "@mui/material/Zoom";
import ClearIcon from "@mui/icons-material/Clear";
import SaveIcon from "@mui/icons-material/Save";
import OpenIcon from "@mui/icons-material/OpenInBrowser";
import SettingsIcon from '@mui/icons-material/Settings';
import { AppFile, MediaFile } from '@stoked-ui/media-selector';
import {useEditorContext} from "../EditorProvider";
import EditorFile, {IEditorFile} from '../EditorFile/EditorFile'

export default function EditorViewActions({ visible }: { visible: boolean }) {
  const context = useEditorContext();
  const { dispatch, state } = context;
  const { file, flags, components, settings } = state;
  const { editorId, fitScaleData, setCursor, recordingTrack } = settings;
  const [fileIsDirty, setIsDirty] = React.useState<boolean>(false);
  React.useEffect(() => {
    const isFileDirty = async () => {
      const isDirty = await (file as EditorFile)?.isDirty();
      setIsDirty(isDirty);
    };

    isFileDirty().catch();
  }, [file]);

  const saveHandler = async () => {

    if (!file) {
      return;
    }
    if (recordingTrack) {
      (recordingTrack.file as MediaFile).save();
      return;
    }
    await file.save();
    console.info('file saved');
  };

  const openHandler = async () => {
    const loadedFiles: IEditorFile[] = await AppFile.fromOpenDialog<EditorFile>(EditorFile) as IEditorFile[];

    if (loadedFiles.length) {
      const loadedFile = loadedFiles[0];
      await loadedFile.preload(settings.editorId);
      dispatch({type: 'SET_FILE', payload: loadedFile});
      const width = (components.timelineGrid as HTMLDivElement)?.clientWidth;
      if (width) {
        fitScaleData(context, false, width, 'editorViewActions');
        setCursor({ time: 0, updateTime: true}, context);
      }
    }
  };

  const remove = () => {
    if (recordingTrack) {
      dispatch({ type: 'VIDEO_REMOVE', payload: recordingTrack.file.id });
      return;
    }
    dispatch({ type: 'DISCARD_FILE' });
  }
  if (flags.detailMode) {
    return null;
  }

  return (
    <Stack direction={'column'}>
      <Zoom in={visible && !!file}>
        <Fab
          id={'clear'}
          color={'error'}
          aria-label="clear"
          size="small"
          sx={(theme) => ({
            position: 'absolute',
            left: '0px',
            margin: '8px',
            color: theme.palette.text.primary,
          })}
          onClick={remove}
        >
          <ClearIcon />
        </Fab>
      </Zoom>
      <Stack direction={'row'}>
        {(recordingTrack || fileIsDirty) && visible && (
          <Zoom in={visible}>
            <Fab
              id={'save'}
              aria-label="save"
              size="small"
              color={'secondary'}
              sx={(theme) => ({
                position: 'absolute',
                right: '96px',
                margin: '8px',
                color: theme.palette.text.primary,
              })}
              onClick={saveHandler}
            >
              <SaveIcon />
            </Fab>
          </Zoom>
        )}
        <Zoom in={visible}>
          <Fab
            id={'open'}
            color={'secondary'}
            aria-label="open"
            size="small"
            sx={(theme) => ({
              position: 'absolute',
              right: '48px',
              margin: '8px',
              color: theme.palette.text.primary,
            })}
            onClick={openHandler}
          >
            <OpenIcon />
          </Fab>
        </Zoom>
        <Zoom in={visible}>
          <Fab
            id={'settings'}
            color={'primary'}
            aria-label="settings"
            size="small"
            sx={(theme) => ({
              position: 'absolute',
              right: '0px',
              margin: '8px',
              color: theme.palette.text.primary,
            })}
            onClick={() => {
              dispatch({ type: 'SELECT_PROJECT' });
              dispatch({ type: 'DETAIL_OPEN' });
            }}
          >
            <SettingsIcon />
          </Fab>
        </Zoom>
      </Stack>
    </Stack>
  );
}

EditorViewActions.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  visible: PropTypes.bool,
};
