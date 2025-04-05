import { ITimelineFile } from "../TimelineFile.types";
import { ITimelineTrack } from "../../TimelineTrack";

/**
 * Represents a command to remove a track from a timeline file.
 */
export class RemoveTrackCommand implements Command {
  private timelineFile: ITimelineFile;
  private removedTrack: ITimelineTrack | null = null;
  private removedTrackIndex: number | null = null;
  private trackId: string;

  /**
   * Creates an instance of RemoveTrackCommand.
   * @param {ITimelineFile} timelineFile - The timeline file from which to remove the track.
   * @param {string} trackId - The ID of the track to be removed.
   */
  constructor(timelineFile: ITimelineFile, trackId: string) {
    this.timelineFile = timelineFile;
    this.trackId = trackId;
  }

  /**
   * Executes the command by removing the track from the timeline file.
   * Handles logging when a track is successfully removed or not found.
   */
  execute(): void {
    this.removedTrackIndex = this.timelineFile.tracks.findIndex((track) => track.id === this.trackId);
    this.removedTrack = this.timelineFile.tracks[this.removedTrackIndex];
    this.timelineFile.tracks = this.timelineFile.tracks.filter((track) => track.id !== this.trackId);
    if (this.removedTrack) {
      console.info(`Removed track: ${this.removedTrack.name}`);
    } else {
      console.warn(`Track with ID ${this.trackId} not found.`);
    }
  }

  /**
   * Undoes the removal of the track by adding it back to the timeline file.
   * Handles logging when a track is successfully restored or there is no track to restore.
   */
  undo(): void {
    if (this.removedTrack) {
      this.timelineFile.tracks.splice(this.removedTrackIndex, 0, this.removedTrack);
      console.info(`Restored track: ${this.removedTrack.name}`);
    } else {
      console.warn('No track to restore.');
    }
  }
}