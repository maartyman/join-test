"use strict";
//<string, {value: O, mainKey: string, count: number}[]>
//<string, number>
Object.defineProperty(exports, "__esModule", { value: true });
exports.DualKeyArrayObjectCount = void 0;
class DualKeyArrayObjectCount {
    constructor() {
        this.map = Object.create(null);
        this.indexMap = Object.create(null);
    }
    set(mainKey, secondaryKey, value) {
        let array = this.map[secondaryKey];
        if (array) {
            let index = this.indexMap[mainKey];
            if (index != undefined) {
                array[index].count++;
            }
            else {
                this.indexMap[mainKey] = array.length;
                array.push({ value: value, mainKey: mainKey, count: 1 });
            }
        }
        else {
            this.indexMap[mainKey] = 0;
            this.map[secondaryKey] = [{ value: value, mainKey: mainKey, count: 1 }];
        }
        return true;
    }
    delete(mainKey, secondaryKey) {
        let array = this.map[secondaryKey];
        if (array == undefined) {
            return false;
        }
        let index = this.indexMap[mainKey];
        if (index == undefined) {
            return false;
        }
        if (array[index].count > 1) {
            array[index].count--;
            return true;
        }
        if (array.length < 2) {
            delete this.map[secondaryKey];
            return delete this.indexMap[mainKey];
        }
        this.indexMap[array[array.length - 1].mainKey] = index;
        array[index] = array[array.length - 1];
        array.pop();
        delete this.indexMap[mainKey];
        return true;
    }
    get(secondaryKey) {
        let mainMap = this.map[secondaryKey];
        if (mainMap) {
            return mainMap;
        }
        return undefined;
    }
    has(secondaryKey) {
        return this.map[secondaryKey] !== undefined;
    }
}
exports.DualKeyArrayObjectCount = DualKeyArrayObjectCount;
//# sourceMappingURL=DualKeyArrayObjectCount.js.map