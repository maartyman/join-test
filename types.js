"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Side = exports.BindingIterator = exports.JoinIterator = exports.Binding = void 0;
class Binding {
    constructor(vars, val, diff = true) {
        this.values = val;
        this.variables = vars;
        this.diff = diff;
    }
    foreach(fn) {
        for (let i = 0; i < this.values.length; i++) {
            fn(this.values[i], this.variables[i]);
        }
    }
}
exports.Binding = Binding;
class JoinIterator {
    constructor(right, left, leftIndex, rightIndex) {
        this.leftIterator = left;
        this.rightIterator = right;
        this.leftIndex = leftIndex;
        this.rightIndex = rightIndex;
        this.variables = [];
        for (let leftVar of left.variables) {
            this.variables.push(leftVar);
        }
        for (let i = 0; i < right.variables.length; i++) {
            if (i != rightIndex) {
                this.variables.push(right.variables[i]);
            }
        }
    }
}
exports.JoinIterator = JoinIterator;
class BindingIterator {
    constructor(array) {
        this.array = array;
        this.variables = array[0].variables;
        for (let el of array) {
            if (el.variables != this.variables)
                throw new Error("some binding(s) don't have the same variables");
        }
    }
    hasNext() {
        return this.array.length > 0;
    }
    next() {
        return this.array.shift();
    }
}
exports.BindingIterator = BindingIterator;
var Side;
(function (Side) {
    Side[Side["right"] = 0] = "right";
    Side[Side["left"] = 1] = "left";
})(Side = exports.Side || (exports.Side = {}));
//# sourceMappingURL=types.js.map