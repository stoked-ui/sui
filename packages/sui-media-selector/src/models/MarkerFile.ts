import PosterFile, { IPosterFile } from "./PosterFile";

/**
 * @description Base interface for an editor file
 * @interface
 * @property {File | String} src - The src of the file
 */
export interface IMarkerFile extends IPosterFile {
  label?: string
}



export default class MarkerFile extends PosterFile implements IMarkerFile {
  label?: string

  constructor(props: IMarkerFile) {
    super(props);
    this.label = props.label;
  }
}
