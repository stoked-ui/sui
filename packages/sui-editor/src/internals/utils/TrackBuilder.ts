import * as React from "react";
import {ITimelineAction, TimelineTrack, ITimelineActionInput} from "@stoked-ui/timeline";

export function buildTracks({ actions, tracks, actionData }: {
  actions?: ITimelineAction[],
  tracks?: TimelineTrack[],
  actionData?: ITimelineActionInput[]}
) {

  if (actionData) {
    return actionData.map((actionInput) => {
      const actionGenId = React.useId();
      const action = {
        ...actionInput,
        name: actionInput.name ?? actionGenId,
        data: actionInput.data,
        id: actionInput.id ?? actionGenId,
      }

      const trackGenId = React.useId()
      return {
        id: trackGenId,
        name: action.name ?? trackGenId,
        actions: [action],
        hidden: false,
        lock: false
      };
    });
  }

  if (actions) {
    return actions.map((action) => {
      const trackGenId = React.useId()
      return {
        id: trackGenId,
        name: action.name ?? trackGenId,
        actions,
        hidden: false,
        lock: false
      };
    });
  }

  if (tracks) {
    return tracks;
  }

  return [];
}
