import * as React from 'react';
import { expect } from 'chai';
import { describe, it } from 'node:test';
import { act } from '@stoked-ui/internal-test-utils';
import EditorExample from './EditorFile.example';
import { IEditorFile, EditorFile, IEditorFileMetadata } from '@stoked-ui/editor';
import { IFileParams, IWebFileProps } from "@stoked-ui/timeline";
import { IMediaFile } from "@stoked-ui/media-selector";

/**
 * Test suite for EditorFile Blob Handling.
 *
 * This test suite validates the creation and reading of an EditorFile structure
 * from a Blob. It ensures that the properties of the read data are correct and
 * that all tracks and actions are properly included.
 */
describe('EditorFile Blob Handling', () => {
  it('should write and read back an EditorFile correctly', async () => {
    // Create a new Blob instance with no initial data
    let createdBlob: Blob;

    /**
     * Write the EditorExample into the Blob using act to ensure asynchronous execution.
     */
    await act(async () => {
      createdBlob = await EditorExample.createBlob(true);
    });

    /**
     * Ensure that the Blob has some data and is not empty.
     */
    expect(createdBlob).to.be.instanceOf(Blob);
    expect(createdBlob.size).to.be.greaterThan(0);

    /**
     * Read back the Blob into an EditorFile structure using act to ensure asynchronous execution.
     */
    let readData: { props: IEditorFileMetadata; fileParams: IFileParams[]; files: IMediaFile[] };

    await act(async () => {
      readData = await EditorFile.readBlob(createdBlob);
    });

    /**
     * Validate the properties of the read data.
     */
    expect(readData).to.have.property('props');
    expect(readData.props).to.deep.include({
      id: EditorExample.id,
      name: EditorExample.name,
      description: EditorExample.description,
      author: EditorExample.author,
      version: EditorExample.version,
    });

    /**
     * Validate the tracks.
     */
    expect(readData.props.tracks).to.be.an('array').with.length(EditorExample.tracks.length);

    /**
     * Iterate over each track in the read data and validate its properties.
     */
    EditorExample.tracks.forEach((track, index) => {
      const readTrack = readData.props.tracks[index];
      expect(readTrack).to.deep.include({
        id: track.id,
        name: track.name,
        file: track.file,
        controller: track.controller,
      });

      /**
       * Validate the actions for each track.
       */
      expect(readTrack.actions).to.be.an('array').with.length(track.actions.length);
      track.actions.forEach((action, actionIndex) => {
        expect(readTrack.actions[actionIndex]).to.deep.include(action);
      });
    });
  });
});