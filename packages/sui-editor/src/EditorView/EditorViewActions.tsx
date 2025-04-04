/**
 * EditorViewActions Component
 *
 * This component renders the actions for the editor view, including save, open, remove, and settings.
 */

import * as React from 'react';
import PropTypes from 'prop-types';
import Fab from '@mui/material/Fab';
import Stack from '@mui/material/Stack';
import Zoom from '@mui/material/Zoom';
import ClearIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import OpenIcon from '@mui/icons-material/OpenInBrowser';
import SettingsIcon from '@mui/icons-material/Settings';
import { AppFile, MediaFile } from '@stoked-ui/media-selector';
import { useEditorContext } from '../EditorProvider';
import EditorFile, { IEditorFile } from '../EditorFile/EditorFile';

/**
 * Props for the EditorViewActions component
 *
 * @param {boolean} visible - Whether the actions are visible or not
 */
export default function EditorViewActions({ visible }: { visible: boolean }) {
  /**
   * Context object containing dispatch and state
   */
  const context = useEditorContext();
  const { dispatch, state } = context;

  /**
   * State properties
   *
   * @type {{ file: EditorFile, flags: any, components: any, settings: any }}
   */
  const { file, flags, components, settings } = state;

  /**
   * Settings object containing editor ID, fit scale data, cursor, and video track
   *
   * @type {{ editorId: string, fitScaleData: (context: any, width: number) => void, setCursor: (state: any) => void, videoTrack: MediaFile | null }}
   */
  const { editorId, fitScaleData, setCursor, videoTrack } = settings;

  /**
   * File is dirty state
   *
   * @type {boolean}
   */
  const [fileIsDirty, setIsDirty] = React.useState<boolean>(false);

  /**
   * Effect hook to update fileIsDirty state when the file changes
   */
  React.useEffect(() => {
    const isFileDirty = async () => {
      const isDirty = await (file as EditorFile)?.isDirty();
      setIsDirty(isDirty);
    };

    isFileDirty().catch();
  }, [file]);

  /**
   * Save handler function
   *
   * @async
   */
  const saveHandler = async () => {
    if (!file) {
      return;
    }
    if (videoTrack) {
      (videoTrack.file as MediaFile).save();
      return;
    }
    await file.save();
    console.info('file saved');
  };

  /**
   * Open handler function
   *
   * @async
   */
  const openHandler = async () => {
    const loadedFiles: IEditorFile[] = (await AppFile.fromOpenDialog<EditorFile>(
      EditorFile,
    )) as IEditorFile[];

    if (loadedFiles.length) {
      const loadedFile = loadedFiles[0];
      await loadedFile.preload(settings.editorId);
      dispatch({ type: 'SET_FILE', payload: loadedFile });
      const width = (components.timelineGrid as HTMLDivElement)?.clientWidth;
      if (width) {
        fitScaleData(context, false, width, 'editorViewActions');
        setCursor({ time: 0, updateTime: true }, context);
      }
    }
  };

  /**
   * Remove handler function
   */
  const remove = () => {
    if (videoTrack) {
      dispatch({ type: 'VIDEO_CLOSE', payload: videoTrack.file.id });
      return;
    }
    dispatch({ type: 'DISCARD_FILE' });
  };

  /**
   * Settings click handler function
   */
  const settingsClickHandler = () => {
    dispatch({ type: 'SELECT_PROJECT' });
    dispatch({ type: 'DETAIL_OPEN' });
  };

  return (
    <Stack>
      {visible && (
        <>
          <Fab onClick={saveHandler}>
            <SaveIcon />
          </Fab>

          <Fab onClick={openHandler}>
            <OpenIcon />
          </Fab>

          <Fab onClick={settingsClickHandler}>
            <SettingsIcon />
          </Fab>
        </>
      )}
    </Stack>
  );
}

EditorViewActions.propTypes = {
  /**
   * Visible prop
   *
   * @type {boolean}
   */
  visible: PropTypes.bool.isRequired,
} as any;