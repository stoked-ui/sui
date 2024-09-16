import * as React from "react";
import {namedId, getFileName, MediaFile} from "@stoked-ui/media-selector";
import {type ITimelineTrack} from "./TimelineTrack.types";
import {
  IController, type ITimelineAction
} from "../TimelineAction/TimelineAction.types";

// TODO: consider moving this code to the timeline library..
export async function buildTracks(controllers: Record<string, IController>, actionData: ITimelineAction[]): Promise<ITimelineTrack[]> {
  try {
    if (actionData) {
      const internalActions: ITimelineAction[] = actionData.map((actionInput, index) => {
        const action: ITimelineAction = actionInput as ITimelineAction;
        // console.log('actionInput.src 1', actionInput.src)
        action.src = actionInput!.src.indexOf('http') !== -1 ? action!.src : `${window.location.href}${action!.src}`;
        // console.log('actionInput.src 2', actionInput.src)
        action.src = action.src.replace(/([^:]\/)\/+/g, "$1");
        // console.log('actionInput.src 3', actionInput.src)
        if (!action.name) {
          action.fullName = getFileName(actionInput.src, true);
          action.name = getFileName(actionInput.src);
        } else {
          action.fullName = actionInput.name;
          action.name = getFileName(actionInput.name);
        }
        action.controller = controllers[actionInput.controllerName];

        if (!action.id) {
          action.id = namedId('mediaFile');
        }
        if (!action.z) {
          action.z = index;
        } else {
          action.staticZ = true;
        }
        if (!action.layer) {
          action.layer = 'foreground';
        }
        return action;
      })

      const filePromises = internalActions.map((actionInput) => MediaFile.fromAction(actionInput as any));
      const mediaFiles = await Promise.all(filePromises);
      return mediaFiles.map((file) => {
        const actionInput = actionData.find((a) => a!.src === file.url);
        if (!actionInput) {
          throw new Error(`Action input not found for file ${JSON.stringify(actionData, null, 2)} - ${file.url}`);
        }
        const action = {
          ...actionInput, file, name: file.name, src: actionInput.src, id: actionInput.id,
        } as ITimelineAction
        const trackGenId = namedId('track')
        return {
          id: trackGenId,
          name: action.name ?? trackGenId,
          actions: [action],
          hidden: false,
          lock: false
        } as ITimelineTrack;
      })
    }
    return [];
  } catch (ex) {
    console.error('buildTracks:', ex);
    return [];
  }
}
