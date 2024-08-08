import { FileWithPath, fromEvent } from 'file-selector';

export const useMediaSelector = (input: Event | File[] | FileList[] | FileWithPath[]) => {
  if (input as Event) {
    return fromEvent(input);
  }
}
