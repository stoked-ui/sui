import { Command } from "@stoked-ui/media-selector";
import { ITimelineFile } from "../TimelineFile.types";
import {ITimelineTrack} from "../../TimelineTrack";

export class RemoveTrackCommand implements Command {
  private timelineFile: ITimelineFile;

  private removedTrack: ITimelineTrack | null = null;

  private removedTrackIndex: number | null = null;

  private trackId: string;

  constructor(timelineFile: ITimelineFile, trackId: string) {
    this.timelineFile = timelineFile;
    this.trackId = trackId;
  }

  // Execute the command: Remove the media file from the list
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

  // Undo the command: Add the media file back to the list
  undo(): void {
    if (this.removedTrack) {
      this.timelineFile.tracks.splice(this.removedTrackIndex, 0, this.removedTrack)
      console.info(`Restored track: ${this.removedTrack.name}`);
    } else {
      console.warn('No track to restore.');
    }
  }
}
