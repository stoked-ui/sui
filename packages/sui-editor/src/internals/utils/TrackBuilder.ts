import * as React from "react";
import {TimelineTrack, ITimelineActionInput } from "@stoked-ui/timeline";
import {MediaFile} from "@stoked-ui/media-selector";

// TODO: consider moving this code to the timeline library..
export async function buildTracks(actionData: ITimelineActionInput[]): Promise<TimelineTrack[]> {
  try {
    if (actionData) {
      const filePromises = actionData.map((actionInput) => MediaFile.fromUrl(actionInput.data!.src));
      const mediaFiles = await Promise.all(filePromises);
      return mediaFiles.map((file) => {
        const actionInput = actionData.find((a) => a.data!.src === file.url);
        if (!actionInput) {
          throw new Error(`Action input not found for file ${file.url}`);
        }
        const action = {
          ...actionInput, file, name: file.name, data: {src: file.url}, id: file.id,
        }
        const trackGenId = React.useId()
        return {
          id: trackGenId,
          name: action.name ?? trackGenId,
          actions: [action],
          hidden: false,
          lock: false
        };
      })
    }
    return [];
  } catch (ex) {
    console.error('buildTracks:', ex);
    return [];
  }
}
