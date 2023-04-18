"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_worker_threads_1 = require("node:worker_threads");
const fs = __importStar(require("fs"));
const events_1 = require("events");
function arrayToLine(array) {
    let line = array.shift();
    if (line == undefined)
        throw new Error("no data in array");
    for (const arrayElement of array) {
        line += "," + arrayElement;
    }
    line += "\n";
    return line;
}
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        const fileName = `./csvs/${new Date().valueOf()}.csv`;
        console.log("file stored in: ", fileName);
        let numOfWorkers = 1;
        let maxWorkers = 13;
        let waiter = new events_1.EventEmitter();
        yield new Promise((resolve, reject) => fs.writeFile(fileName, 'message,results,ratio,elements,numberLeft,numberRight,joinIteratorString,execution time,heapTotal diff,heapTotal total,arrayBuffers dif,arrayBuffers total,rss diff,rss total,heap diff,head total,elementsRatio\n', function (err) {
            if (err) {
                reject();
                throw err;
            }
            resolve();
        }));
        for (let number of [100000, 100000, 200000, 500000]) {
            for (let elementsRatio of [0.01, 0.25, 0.5, 0.75, 0.09]) {
                for (const ratio of [0.9]) {
                    for (const joinAlgorithm of ["TwoHash", "TwoHashIndexedCount"]) {
                        while (numOfWorkers >= maxWorkers) {
                            yield new Promise((resolve) => {
                                waiter.once("update", () => {
                                    resolve();
                                });
                            });
                        }
                        console.log(number, ratio, joinAlgorithm, "started");
                        let myWorker = new node_worker_threads_1.Worker('./main.js');
                        myWorker.postMessage([ratio, elementsRatio * number, number, number, joinAlgorithm, joinAlgorithm + ": " + number + " & " + ratio]);
                        numOfWorkers++;
                        myWorker.once("message", (array) => {
                            array.push(elementsRatio);
                            fs.appendFileSync(fileName, arrayToLine(array));
                            myWorker.terminate();
                            numOfWorkers--;
                            waiter.emit("update");
                            console.log(number, ratio, joinAlgorithm, "finished");
                        });
                    }
                }
            }
        }
    });
}
start();
//# sourceMappingURL=mainAsThread.js.map