"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwoHashIndexed = void 0;
const types_1 = require("./types");
const DualKeyArrayHashMap_1 = require("./DualKeyArrayHashMap");
class TwoHashIndexed extends types_1.JoinIterator {
    constructor(right, left, leftIndex, rightIndex) {
        super(right, left, leftIndex, rightIndex);
        this.index = 0;
        this.activeSide = types_1.Side.left;
        this.left = new DualKeyArrayHashMap_1.DualKeyArrayHashMap(this.bindingHash);
        this.right = new DualKeyArrayHashMap_1.DualKeyArrayHashMap(this.bindingHash);
        this.results = [];
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
        return (this.results != undefined && this.results.length > 0) || this.leftIterator.hasNext() || this.rightIterator.hasNext();
    }
    next() {
        let activeMap;
        let otherMap;
        while (this.results == undefined || this.results.length == 0) {
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
            let good;
            if (this.activeElement.diff) {
                good = activeMap.set(bindingHash, joinHash, this.activeElement);
            }
            else {
                good = activeMap.delete(bindingHash, joinHash);
            }
            console.log("active element: ", this.activeElement, good);
            console.log("active side: ", types_1.Side[this.activeSide]);
            if (good)
                this.results = otherMap.get(joinHash);
        }
        if (this.activeElement == undefined) {
            return undefined;
        }
        /*
        console.log(Side[this.activeSide])
        console.log(this.activeElement)
        console.log(this.results)
        console.log(this.index)
         */
        let returnBinding = (this.activeSide == types_1.Side.right) ?
            this.combineBindings(this.results[this.index], this.activeElement) :
            this.combineBindings(this.activeElement, this.results[this.index]);
        this.index++;
        if (this.results.length == this.index) {
            this.results = undefined;
            this.index = 0;
        }
        return returnBinding;
    }
}
exports.TwoHashIndexed = TwoHashIndexed;
//# sourceMappingURL=indexHashFunction.js.map