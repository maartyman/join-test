"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DualKeyArrayHashMapCount = void 0;
class DualKeyArrayHashMapCount {
    constructor() {
        this.map = new Map();
        this.indexMap = new Map();
    }
    set(mainKey, secondaryKey, value) {
        let array = this.map.get(secondaryKey);
        if (array) {
            let index = this.indexMap.get(mainKey);
            if (index != undefined) {
                array[index].count++;
            }
            else {
                this.indexMap.set(mainKey, array.length);
                array.push({ value: value, mainKey: mainKey, count: 1 });
            }
        }
        else {
            this.indexMap.set(mainKey, 0);
            this.map.set(secondaryKey, [{ value: value, mainKey: mainKey, count: 1 }]);
        }
        return true;
    }
    delete(mainKey, secondaryKey) {
        let array = this.map.get(secondaryKey);
        if (array == undefined) {
            return false;
        }
        let index = this.indexMap.get(mainKey);
        if (index == undefined) {
            return false;
        }
        if (array[index].count > 1) {
            array[index].count--;
            return true;
        }
        if (array.length < 2) {
            this.map.delete(secondaryKey);
            return this.indexMap.delete(mainKey);
        }
        this.indexMap.set(array[array.length - 1].mainKey, index);
        array[index] = array[array.length - 1];
        array.pop();
        this.indexMap.delete(mainKey);
        return true;
    }
    get(secondaryKey) {
        let mainMap = this.map.get(secondaryKey);
        if (mainMap) {
            return mainMap;
        }
        return undefined;
    }
    has(secondaryKey) {
        return this.map.has(secondaryKey);
    }
}
exports.DualKeyArrayHashMapCount = DualKeyArrayHashMapCount;
//# sourceMappingURL=DualKeyArrayHashMapCount.js.map