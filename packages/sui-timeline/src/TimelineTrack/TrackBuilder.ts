import * as React from "react";
import {DynamicMediaType, namedId, getFileName, MediaFile} from "@stoked-ui/media-selector";
import {type ITimelineTrack } from "./TimelineTrack.types";
import {type ITimelineAction, type ITimelineActionInput} from "../TimelineAction/TimelineAction.types";

// TODO: consider moving this code to the timeline library..
export async function buildTracks(actionData: ITimelineActionInput[]): Promise<ITimelineTrack[]> {
  try {
    if (actionData) {
      actionData.forEach((actionInput) => {
        actionInput.data.src = actionInput.data!.src.indexOf('http') !== -1 ? actionInput.data!.src : `${window.location.href}${actionInput.data!.src}`;
        actionInput.data.src = actionInput.data.src.replace(/([^:]\/)\/+/g, "$1");
        if (!actionInput.name) {
          actionInput.name = getFileName(actionInput.data.src);
        }
      })
      const filePromises = actionData.map((actionInput) => DynamicMediaType.fromUrl(actionInput.data.src));

      const isRejected = (input: PromiseSettledResult<unknown>): input is PromiseRejectedResult =>
        input.status === 'rejected'

      const isFulfilled = <T>(input: PromiseSettledResult<T>): input is PromiseFulfilledResult<T> =>
        input.status === 'fulfilled'

      const data = await Promise.allSettled(filePromises);

      const greatSuccess = data.filter(isFulfilled).map(result => result.value);
      const failure = data.filter(isRejected)

      return greatSuccess.map((file) => {
        console.log('file.url', file.url)
        const actionInput = actionData.find((a) => a.data!.src === file.url);
        if (!actionInput) {
          throw new Error(`Action input not found for file ${JSON.stringify(actionData, null, 2)} - ${JSON.stringify(file, null, 2)}`);
        }
        console.log('actionInput', actionInput)
        const action = {
          ...actionInput,
          file,
          duration: file.duration
        } as ITimelineAction;
        const trackGenId = namedId('track')
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
    console.warn('buildTracks:', ex);
    return [];
  }
}


export async function buildTracksOld(actionData: ITimelineActionInput[]): Promise<ITimelineTrack[]> {
  try {
    if (actionData) {
      actionData.forEach((actionInput) => {
        actionInput.data.src = actionInput.data!.src.indexOf('http') !== -1 ? actionInput.data!.src : `${window.location.href}${actionInput.data!.src}`;
        actionInput.data.src = actionInput.data.src.replace(/([^:]\/)\/+/g, "$1");
        if (!actionInput.name) {
          actionInput.name = getFileName(actionInput.data.src);
        }
        if (!actionInput.id) {
          actionInput.id = namedId('mediaFile');
        }
      })

      const filePromises = actionData.map((actionInput) => MediaFile.fromAction(actionInput as any));
      const mediaFiles = await Promise.all(filePromises);
      return mediaFiles.map((file) => {
        const actionInput = actionData.find((a) => a.data!.src === file.url);
        if (!actionInput) {
          throw new Error(`Action input not found for file ${JSON.stringify(actionData, null, 2)} - ${file.url}`);
        }
        const action = {
          ...actionInput, file, name: file.name, data: {src: file.url}, id: file.id,
        }
        const trackGenId = namedId('track')
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
