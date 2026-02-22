"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATED_EMBED_VISIBILITY_TYPES = exports.PUBLIC_EMBED_VISIBILITY_TYPES = exports.DEFAULT_EMBED_VISIBILITY = void 0;
exports.isPublicEmbedVisibility = isPublicEmbedVisibility;
exports.isAuthenticatedEmbedVisibility = isAuthenticatedEmbedVisibility;
exports.DEFAULT_EMBED_VISIBILITY = 'private';
exports.PUBLIC_EMBED_VISIBILITY_TYPES = ['public'];
exports.AUTHENTICATED_EMBED_VISIBILITY_TYPES = [
    'public',
    'authenticated',
];
function isPublicEmbedVisibility(visibility) {
    return exports.PUBLIC_EMBED_VISIBILITY_TYPES.includes(visibility);
}
function isAuthenticatedEmbedVisibility(visibility) {
    return exports.AUTHENTICATED_EMBED_VISIBILITY_TYPES.includes(visibility);
}
//# sourceMappingURL=embed-visibility.js.map