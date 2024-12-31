import { Command } from "@stoked-ui/media-selector";
import { ITimelineAction } from "../../TimelineAction/TimelineAction.types";
import { ITimelineFile } from "../TimelineFile.types";

export class RemoveActionCommand implements Command {
  private timelineFile: ITimelineFile;

  private removedAction: ITimelineAction | null = null;

  private removedActionIndex: number | null = null;

  private actionId: string;

  private trackIndex: number | null = null;

  constructor(timelineFile: ITimelineFile, actionId: string) {
    this.timelineFile = timelineFile;
    this.actionId = actionId;
  }

  // Execute the command: Remove the media file from the list
  execute(): void {
    this.timelineFile.tracks.forEach((track) => {
      track.actions.forEach((action, index) => {
        if (action.id === this.actionId) {
          this.removedAction = action;
          this.removedActionIndex = index;
          this.trackIndex = index;
        }
      })
      track.actions = track.actions.filter((action) => action.id !== this.actionId);
    });
    if (this.removedAction) {
      console.info(`Removed action file: ${this.removedAction.name}`);
    } else {
      console.warn(`Action with ID ${this.actionId} not found.`);
    }
  }

  // Undo the command: Add the media file back to the list
  undo(): void {
    if (this.removedAction) {
      this.timelineFile.tracks[this.trackIndex].actions.splice(this.removedActionIndex, 0, this.removedAction)
      console.info(`Restored action: ${this.removedAction.name}`);
    } else {
      console.warn('No action to restore.');
    }
  }
}
