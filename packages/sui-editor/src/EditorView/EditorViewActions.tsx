import * as React from "react";
import PropTypes from "prop-types";
import { WebFile } from "@stoked-ui/timeline";
import Fab from "@mui/material/Fab";
import Stack from "@mui/material/Stack";
import Zoom from "@mui/material/Zoom";
import ClearIcon from "@mui/icons-material/Clear";
import SaveIcon from "@mui/icons-material/Save";
import OpenIcon from "@mui/icons-material/OpenInBrowser";
import SettingsIcon from '@mui/icons-material/Settings';
import {useEditorContext} from "../EditorProvider";
import EditorFile from '../EditorFile/EditorFile'

export default function EditorViewActions({ visible }: { visible: boolean }) {
  const { dispatch, file } = useEditorContext();

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
    await file.save();
    console.info('file saved');
  };

  const openHandler = async () => {
    const input = document.createElement('input') as HTMLInputElement;
    input.type = 'file';

    async function handleFiles() {
      if (!input.files) {
        return;
      }
      const files = Array.from(input.files);
      if (files.length) {
        for (let i = 0; i < files.length; i += 1) {
          const clientFile = files[i];
          // eslint-disable-next-line no-await-in-loop
          const loadedFile = await EditorFile.fromBlob(clientFile);
          dispatch({ type: 'SET_FILE', payload: loadedFile });
        }
      }
    }
    input.addEventListener('change', handleFiles, false);
    input.click();
  };

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
          onClick={() => {
            dispatch({ type: 'DISCARD_FILE' });
          }}
        >
          <ClearIcon />
        </Fab>
      </Zoom>
      <Stack direction={'row'}>
        {fileIsDirty && visible && (
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
