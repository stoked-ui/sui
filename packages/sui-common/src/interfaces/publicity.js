"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_FILTER_PUBLICITY_TYPES = exports.ADMIN_ONLY_PUBLICITY_TYPES = exports.PUBLICITY_TYPES = void 0;
exports.isAdminOnlyPublicity = isAdminOnlyPublicity;
exports.isIncludedInAllFilter = isIncludedInAllFilter;
exports.PUBLICITY_TYPES = {
    PUBLIC: 'public',
    PRIVATE: 'private',
    PAID: 'paid',
    DELETED: 'deleted',
};
exports.ADMIN_ONLY_PUBLICITY_TYPES = ['deleted'];
exports.ALL_FILTER_PUBLICITY_TYPES = [
    'public',
    'private',
    'paid'
];
function isAdminOnlyPublicity(publicity) {
    return exports.ADMIN_ONLY_PUBLICITY_TYPES.includes(publicity);
}
function isIncludedInAllFilter(publicity) {
    return exports.ALL_FILTER_PUBLICITY_TYPES.includes(publicity);
}
//# sourceMappingURL=publicity.js.map