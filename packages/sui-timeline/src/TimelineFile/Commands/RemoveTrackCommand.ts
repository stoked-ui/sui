/**
 * Removes a track from the timeline file.
 */
export class RemoveTrackCommand implements Command {
  /**
   * The timeline file associated with this command.
   */
  private timelineFile: ITimelineFile;

  /**
   * The removed track data, or null if no track was found.
   */
  private removedTrack: ITimelineTrack | null = null;

  /**
   * The index of the removed track in the timeline file tracks array.
   */
  private removedTrackIndex: number | null = null;

  /**
   * The ID of the track to remove.
   */
  private trackId: string;

  /**
   * Creates a new RemoveTrackCommand instance.
   *
   * @param timelineFile - The timeline file associated with this command.
   * @param trackId - The ID of the track to remove.
   */
  constructor(timelineFile: ITimelineFile, trackId: string) {
    this.timelineFile = timelineFile;
    this.trackId = trackId;
  }

  /**
   * Executes the RemoveTrackCommand. Removes the specified track from the timeline file tracks array.
   *
   * @accessibility The command logs a message to the console indicating whether the track was removed successfully.
   */
  execute(): void {
    // Find the index of the track in the timeline file tracks array
    this.removedTrackIndex = this.timelineFile.tracks.findIndex((track) => track.id === this.trackId);
    
    // If the track is found, update the removed track data
    if (this.removedTrackIndex !== null) {
      this.removedTrack = this.timelineFile.tracks[this.removedTrackIndex];
      
      // Remove the track from the timeline file tracks array
      this.timelineFile.tracks = this.timelineFile.tracks.filter((track) => track.id !== this.trackId);
    }
    
    // Log a message to the console indicating whether the track was removed successfully
    if (this.removedTrack) {
      console.info(`Removed track: ${this.removedTrack.name}`);
    } else {
      console.warn(`Track with ID ${this.trackId} not found.`);
    }
  }

  /**
   * Undoes the RemoveTrackCommand. Adds the removed track back to the timeline file tracks array.
   *
   * @accessibility The command logs a message to the console indicating whether the track was restored successfully.
   */
  undo(): void {
    // If a track was previously removed, restore it
    if (this.removedTrack) {
      this.timelineFile.tracks.splice(this.removedTrackIndex, 0, this.removedTrack);
      
      // Log a message to the console indicating whether the track was restored successfully
      console.info(`Restored track: ${this.removedTrack.name}`);
    } else {
      console.warn('No track to restore.');
    }
  }
}