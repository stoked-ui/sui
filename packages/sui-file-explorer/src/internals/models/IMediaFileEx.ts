/**
 * Interface for file base extension.
 *
 * Extends the IMediaFile interface with a visibleIndex property.
 */
import { IMediaFile } from "@stoked-ui/media-selector";

export interface FileBase extends IMediaFile {
  /**
   * The index of the file if it's visible.
   */
  visibleIndex?: number;
}