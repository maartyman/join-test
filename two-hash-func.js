"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwoHash = void 0;
const types_1 = require("./types");
const DualKeyHashMap_1 = require("./DualKeyHashMap");
class TwoHash extends types_1.JoinIterator {
    constructor(right, left, leftIndex, rightIndex) {
        super(right, left, leftIndex, rightIndex);
        this.count = 0;
        this.activeSide = types_1.Side.left;
        this.left = new DualKeyHashMap_1.DualKeyHashMap();
        this.right = new DualKeyHashMap_1.DualKeyHashMap();
        this.results = [][Symbol.iterator]();
        this.nextResult = this.results.next();
    }
    combineBindings(leftBinding, rightBinding) {
        let values = [];
        for (let value of leftBinding.values) {
            values.push(value);
        }
        for (let i = 0; i < rightBinding.values.length; i++) {
            if (i != this.rightIndex) {
                values.push(rightBinding.values[i]);
            }
        }
        return new types_1.Binding(this.variables, values, leftBinding.diff && rightBinding.diff);
    }
    joinHash(binding, index) {
        return binding.values[index];
    }
    bindingHash(binding) {
        let hash = "";
        binding.foreach((val, vars) => {
            hash += vars + val;
        });
        return hash;
    }
    hasNext() {
        return !this.nextResult.done || (this.leftIterator.hasNext() || this.rightIterator.hasNext());
    }
    next() {
        let activeMap;
        let otherMap;
        while (this.nextResult.done) {
            this.activeSide = (this.activeSide == types_1.Side.right) ? types_1.Side.left : types_1.Side.right;
            if (!this.hasNext()) {
                return undefined;
            }
            if (this.activeSide == types_1.Side.right) {
                this.activeElement = this.rightIterator.next();
                if (this.activeElement == undefined) {
                    continue;
                }
                activeMap = this.right;
                otherMap = this.left;
            }
            else {
                this.activeElement = this.leftIterator.next();
                if (this.activeElement == undefined) {
                    continue;
                }
                activeMap = this.left;
                otherMap = this.right;
            }
            let bindingHash = this.bindingHash(this.activeElement);
            let joinHash = this.joinHash(this.activeElement, (this.activeSide == types_1.Side.right) ? this.rightIndex : this.leftIndex);
            if (this.activeElement.diff) {
                activeMap.set(bindingHash, joinHash, this.activeElement);
            }
            else {
                if (!activeMap.delete(bindingHash, joinHash))
                    continue;
            }
            //console.log("active element: ", this.activeElement)
            //console.log("active side: ", Side[this.activeSide])
            this.results = otherMap.getAll(joinHash);
            this.nextResult = this.results.next();
        }
        if (this.nextResult.value == undefined || this.activeElement == undefined) {
            return undefined;
        }
        /*
        console.log(Side[this.activeSide])
        console.log(this.activeElement)
        console.log(this.results)
        console.log(this.count)
         */
        let returnBinding = (this.activeSide == types_1.Side.right) ?
            this.combineBindings(this.nextResult.value.value, this.activeElement) :
            this.combineBindings(this.activeElement, this.nextResult.value.value);
        this.count++;
        if (this.count >= this.nextResult.value.count) {
            this.count = 0;
            this.nextResult = this.results.next();
        }
        return returnBinding;
    }
}
exports.TwoHash = TwoHash;
//# sourceMappingURL=two-hash-func.js.map