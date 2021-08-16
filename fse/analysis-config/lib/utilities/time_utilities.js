"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimeInNano = void 0;
function getTimeInNano() {
    var hr = process.hrtime();
    return hr[0] * 1e9 + hr[1];
}
exports.getTimeInNano = getTimeInNano;
//# sourceMappingURL=time_utilities.js.map