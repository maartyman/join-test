"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Random = void 0;
class Random {
    constructor(i) {
        this.m_w = 123456789;
        this.m_z = 987654321;
        this.mask = 0xffffffff;
        this.m_w = (123456789 + i) & this.mask;
        this.m_z = (987654321 - i) & this.mask;
    }
    next() {
        this.m_z = (36969 * (this.m_z & 65535) + (this.m_z >> 16)) & this.mask;
        this.m_w = (18000 * (this.m_w & 65535) + (this.m_w >> 16)) & this.mask;
        var result = ((this.m_z << 16) + (this.m_w & 65535)) >>> 0;
        result /= 4294967296;
        return result;
    }
}
exports.Random = Random;
//# sourceMappingURL=random.js.map