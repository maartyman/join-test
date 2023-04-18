"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiHashMap = void 0;
class MultiHashMap {
    constructor(hashFuncs) {
        this.mainMap = new Map();
        this.otherMap = new Map();
        if (hashFuncs.length === 0) {
            throw new Error('Please provide at least one hash function');
        }
        this.hashFuncs = hashFuncs;
    }
    getDimHash(key, dimension) {
        return "#" + dimension + "#" + key;
    }
    set(value) {
        let hash0 = this.hashFuncs[0](value);
        let obj = this.mainMap.get(hash0);
        if (obj)
            obj.count++;
        else {
            obj = { value: value, count: 1 };
            this.mainMap.set(hash0, obj);
            for (let i = 1; i < this.hashFuncs.length; i++) {
                let currentHash = this.getDimHash(this.hashFuncs[i](value), i);
                let objArray = this.otherMap.get(currentHash);
                if (objArray) {
                    objArray.push(obj);
                }
                else {
                    this.otherMap.set(currentHash, [obj]);
                }
            }
        }
    }
}
exports.MultiHashMap = MultiHashMap;
//# sourceMappingURL=MultiHashMap.js.map