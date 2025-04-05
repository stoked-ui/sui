import * as React from 'react';
import { expect } from 'chai';
import { describe, it } from 'node:test';
import { act } from '@stoked-ui/internal-test-utils';
import EditorExample from './EditorFile.example';
import {IEditorFile, EditorFile, IEditorFileMetadata} from '@stoked-ui/editor';
import {IFileParams, IWebFileProps} from "@stoked-ui/timeline";
import {IMediaFile} from "@stoked-ui/media-selector";

/**
 * Test suite for handling Blob in EditorFile.
 */
describe('EditorFile Blob Handling', () => {
  /**
   * Test writing and reading an EditorFile from Blob.
   */
  it('should write and read back an EditorFile correctly', async () => {
    // Write EditorExample into a Blob
    let createdBlob: Blob;
    await act(async () => {
      // createdBlob = await EditorExample.createBlob(true); // Using `.call` to bind
    });

    // Ensure the Blob has data
    expect(createdBlob).to.be.instanceOf(Blob);
    expect(createdBlob.size).to.be.greaterThan(0);

    // Read back the Blob into EditorFile structure
    let readData: { props: IEditorFileMetadata; fileParams: IFileParams[]; files: IMediaFile[] };
    await act(async () => {
      readData = await EditorFile.readBlob(createdBlob);
    });

    // Validate the properties of the read data
    expect(readData).to.have.property('props');
    expect(readData.props).to.deep.include({
      id: EditorExample.id,
      name: EditorExample.name,
      description: EditorExample.description,
      author: EditorExample.author,
      version: EditorExample.version,
    });

    // Validate the tracks
    expect(readData.props.tracks).to.be.an('array').with.length(EditorExample.tracks.length);

    EditorExample.tracks.forEach((track, index) => {
      const readTrack = readData.props.tracks[index];
      expect(readTrack).to.deep.include({
        id: track.id,
        name: track.name,
        file: track.file,
        controller: track.controller,
      });

      // Validate the actions for each track
      expect(readTrack.actions).to.be.an('array').with.length(track.actions.length);
      track.actions.forEach((action, actionIndex) => {
        expect(readTrack.actions[actionIndex]).to.deep.include(action);
      });
    });
  });
});