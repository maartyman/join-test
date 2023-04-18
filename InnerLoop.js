"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InnerLoop = void 0;
const types_1 = require("./types");
class InnerLoop extends types_1.JoinIterator {
    constructor(right, left, leftIndex, rightIndex) {
        super(right, left, leftIndex, rightIndex);
        this.activeSide = types_1.Side.left;
        this.left = [];
        this.right = [];
        this.index = 0;
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
        return this.index > 0 || this.leftIterator.hasNext() || this.rightIterator.hasNext();
    }
    canJoin(left, right) {
        return left.values[this.leftIndex] == right.values[this.rightIndex];
    }
    next() {
        let activeArray;
        let otherArray;
        if (this.activeSide == types_1.Side.right) {
            activeArray = this.right;
            otherArray = this.left;
        }
        else {
            activeArray = this.left;
            otherArray = this.right;
        }
        while (!this.nextResult) {
            if (!this.activeElement) {
                this.activeSide = (this.activeSide == types_1.Side.right) ? types_1.Side.left : types_1.Side.right;
                if (!this.hasNext()) {
                    return undefined;
                }
                if (this.activeSide == types_1.Side.right) {
                    this.activeElement = this.rightIterator.next();
                    if (!this.activeElement) {
                        continue;
                    }
                    activeArray = this.right;
                    otherArray = this.left;
                }
                else {
                    this.activeElement = this.leftIterator.next();
                    if (!this.activeElement) {
                        continue;
                    }
                    activeArray = this.left;
                    otherArray = this.right;
                }
                if (this.activeElement.diff) {
                    activeArray.push(this.activeElement);
                }
                else {
                    //console.log("deleting: ", this.activeElement, "in: ", activeArray)
                    let index = activeArray.findIndex((binding) => {
                        var _a, _b;
                        if (!this.activeElement)
                            return false;
                        let bool = true;
                        for (let i = 0; i < ((_a = this.activeElement) === null || _a === void 0 ? void 0 : _a.values.length); i++) {
                            if (!(((_b = this.activeElement) === null || _b === void 0 ? void 0 : _b.values[i]) == binding.values[i])) {
                                bool = false;
                            }
                        }
                        return bool;
                    });
                    if (index != -1) {
                        //console.log("index: ", index)
                        activeArray[index] = activeArray[activeArray.length - 1];
                        activeArray.pop();
                        //console.log("array after: ", activeArray)
                    }
                    else {
                        this.activeElement = undefined;
                        continue;
                    }
                }
            }
            if (this.index == otherArray.length) {
                this.index = 0;
                this.activeElement = undefined;
                continue;
            }
            this.index++;
            if (this.activeSide == types_1.Side.right) {
                if (this.canJoin(otherArray[this.index - 1], this.activeElement)) {
                    return this.combineBindings(otherArray[this.index - 1], this.activeElement);
                }
            }
            else {
                if (this.canJoin(this.activeElement, otherArray[this.index - 1])) {
                    return this.combineBindings(this.activeElement, otherArray[this.index - 1]);
                }
            }
        }
    }
}
exports.InnerLoop = InnerLoop;
//# sourceMappingURL=InnerLoop.js.map