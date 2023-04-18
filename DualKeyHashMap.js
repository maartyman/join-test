"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DualKeyHashMap = void 0;
class DualKeyHashMap {
    constructor() {
        this.map = new Map();
    }
    set(mainKey, secondaryKey, value) {
        let mainMap = this.map.get(secondaryKey);
        if (mainMap) {
            let mapObject = mainMap.get(mainKey);
            if (mapObject) {
                mapObject.count++;
            }
            else {
                mainMap.set(mainKey, { value: value, count: 1 });
            }
        }
        else {
            let newMap = new Map();
            newMap.set(mainKey, { value: value, count: 1 });
            this.map.set(secondaryKey, newMap);
        }
    }
    delete(mainKey, secondaryKey) {
        let mainMap = this.map.get(secondaryKey);
        if (mainMap) {
            let mapObject = mainMap.get(mainKey);
            if (mapObject) {
                if (mapObject.count > 1) {
                    mapObject.count--;
                    return true;
                }
                else {
                    mainMap.delete(mainKey);
                    if (mainMap.size == 0) {
                        this.map.delete(secondaryKey);
                    }
                    return true;
                }
            }
        }
        return false;
    }
    get(mainKey, secondaryKey) {
        var _a;
        return (_a = this.map.get(secondaryKey)) === null || _a === void 0 ? void 0 : _a.get(mainKey);
    }
    getAll(secondaryKey) {
        let mainMap = this.map.get(secondaryKey);
        if (mainMap) {
            return mainMap.values();
        }
        return [][Symbol.iterator]();
    }
    forEach(secondaryKey, fn) {
        let mainMap = this.map.get(secondaryKey);
        mainMap === null || mainMap === void 0 ? void 0 : mainMap.forEach(fn);
    }
    has(secondaryKey) {
        return this.map.has(secondaryKey);
    }
}
exports.DualKeyHashMap = DualKeyHashMap;
//# sourceMappingURL=DualKeyHashMap.js.map