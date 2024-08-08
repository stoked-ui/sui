import { IdGenerator } from "../services/IdGenerator";
const { fileId } = IdGenerator();

/**
 * @description Base interface for an editor file
 * @interface
 * @property {File | String} src - The src of the file
 */
export interface IMediaFile {
	id: string;
	file?: File;
	src?: string;
	name?: string;
	path?: string;
	size?: number;
	type?: string;
	modified?: number;
	buffer?: Uint8Array;
	blob?: Blob;
	visible: boolean;
}

/**
 * @description Base interface for an editor file
 * @interface
 * @property {MediaFileSource} src - The src of the file
 * @property {String?} name - The filename of the file including extension
 * @property {String?} path - Path of the file if located on disk
 * @property {Number?} size - Size in bytes of the file
 * @property {String?} type - ContentType of the file
 */
export default class MediaFile implements IMediaFile {
	id: string;
	file?: File;
	src?: string;
	name?: string;
	path?: string;
	size?: number;
	type?: string;
	modified?: number;
	buffer?: Uint8Array;
	blob?: Blob;
	visible = false;

	constructor(params: IMediaFile) {
		this.id = params.id || fileId();
		this.file = params.file;
		this.src = params.src;
		this.name = params.name;
		this.path = params.path;
		this.size = params.size;
		this.type = params.type;
		this.modified = params.modified;
		this.buffer = params.buffer;
		this.blob = params.blob;
		this.visible = params.visible;
	}
}
