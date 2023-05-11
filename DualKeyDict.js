"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DualKeyObject = void 0;
class DualKeyObject {
    constructor() {
        this.map = Object.create(null);
    }
    set(mainKey, secondaryKey, value) {
        let mainMap = this.map[secondaryKey];
        if (mainMap !== undefined) {
            let mapObject = mainMap[mainKey];
            if (mapObject !== undefined) {
                mapObject.count++;
            }
            else {
                mainMap[mainKey] = { value: value, count: 1 };
            }
        }
        else {
            let newMap = Object.create(null);
            newMap[mainKey] = { value: value, count: 1 };
            this.map[secondaryKey] = newMap;
        }
    }
    delete(mainKey, secondaryKey) {
        let mainMap = this.map[secondaryKey];
        if (mainMap !== undefined) {
            let mapObject = mainMap[mainKey];
            if (mapObject !== undefined) {
                if (mapObject.count > 1) {
                    mapObject.count--;
                    return true;
                }
                else {
                    delete mainMap[mainKey];
                    if (mainMap.size === 0) {
                        delete this.map[secondaryKey];
                    }
                    return true;
                }
            }
        }
        return false;
    }
    get(mainKey, secondaryKey) {
        let mainMap = this.map[secondaryKey];
        return (mainMap === undefined) ? undefined : mainMap[mainKey];
    }
    getAll(secondaryKey) {
        let mainMap = this.map[secondaryKey];
        if (mainMap !== undefined) {
            return Object.values(mainMap);
        }
        return [];
    }
    has(secondaryKey) {
        return this.map[secondaryKey] !== undefined;
    }
}
exports.DualKeyObject = DualKeyObject;
//# sourceMappingURL=DualKeyDict.js.map