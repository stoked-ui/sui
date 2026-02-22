"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUIMime = void 0;
const IMimeType_1 = require("./IMimeType");
class SUIMime extends IMimeType_1.MimeRegistry {
    constructor() {
        super();
        this.createStandardTypes();
    }
    static getInstance() {
        if (!SUIMime.instance) {
            SUIMime.instance = new SUIMime();
        }
        return SUIMime.instance;
    }
    createStandardTypes() {
        IMimeType_1.MimeRegistry.create('image', 'png', '.png', 'PNG Image');
        IMimeType_1.MimeRegistry.create('video', 'mp4', '.mp4', 'MP4 Video');
        IMimeType_1.MimeRegistry.create('audio', 'mp3', '.mp3', 'MP3 Audio');
    }
    static make(application, ext, description, embedded = true) {
        return IMimeType_1.MimeRegistry.create('stoked-ui', application, ext, description, embedded);
    }
}
exports.SUIMime = SUIMime;
//# sourceMappingURL=StokedUiMime.js.map