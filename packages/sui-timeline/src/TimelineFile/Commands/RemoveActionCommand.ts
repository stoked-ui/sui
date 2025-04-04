/**
 * @class RemoveActionCommand
 * @implements {Command}
 * 
 * This class implements the Command interface, providing functionality for removing actions from a media timeline file.
 */
export class RemoveActionCommand implements Command {
  /**
   * @property {ITimelineFile} timelineFile - The media timeline file to modify.
   */
  private timelineFile: ITimelineFile;

  /**
   * @property {ITimelineAction | null} removedAction - The action being removed from the timeline file.
   */
  private removedAction: ITimelineAction | null = null;

  /**
   * @property {number | null} removedActionIndex - The index of the removed action in the timeline file.
   */
  private removedActionIndex: number | null = null;

  /**
   * @property {string} actionId - The ID of the action being removed from the timeline file.
   */
  private actionId: string;

  /**
   * @property {number | null} trackIndex - The index of the track containing the removed action.
   */
  private trackIndex: number | null = null;

  /**
   * Creates an instance of RemoveActionCommand.
   * 
   * @param {ITimelineFile} timelineFile - The media timeline file to modify.
   * @param {string} actionId - The ID of the action being removed from the timeline file.
   */
  constructor(timelineFile: ITimelineFile, actionId: string) {
    this.timelineFile = timelineFile;
    this.actionId = actionId;
  }

  /**
   * Executes the command by removing the media file from the list and updating the state of the timeline file.
   */
  execute(): void {
    // Remove actions with the specified ID from all tracks in the timeline file
    this.timelineFile.tracks.forEach((track) => {
      track.actions.forEach((action, index) => {
        if (action.id === this.actionId) {
          // Store the removed action and its index for later use
          this.removedAction = action;
          this.removedActionIndex = index;
          this.trackIndex = index;
        }
      })
      // Remove actions with the specified ID from the current track
      track.actions = track.actions.filter((action) => action.id !== this.actionId);
    });

    // Log a message to the console indicating whether the removal was successful or not
    if (this.removedAction) {
      console.info(`Removed action file: ${this.removedAction.name}`);
    } else {
      console.warn(`Action with ID ${this.actionId} not found.`);
    }
  }

  /**
   * Undoes the command by adding the media file back to the list and updating the state of the timeline file.
   */
  undo(): void {
    // Check if an action was removed in the previous step
    if (this.removedAction) {
      // Add the removed action back to its original position in the track
      this.timelineFile.tracks[this.trackIndex].actions.splice(this.removedActionIndex, 0, this.removedAction)
      console.info(`Restored action: ${this.removedAction.name}`);
    } else {
      console.warn('No action to restore.');
    }
  }
}