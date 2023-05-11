import {TwoHash} from "./two-hash-func";
import {TwoHashObject} from "./two-hash-func-dict";
import {TwoHashIndexed} from "./indexHashFunction";
import {TwoHashIndexedCount} from "./indexHashFunctionCount";
import {Worker} from "node:worker_threads";
import { appendFileSync } from "fs";
import * as fs from "fs";
import {EventEmitter} from "events";

function arrayToLine(array: string[]) {
  let line = array.shift();
  if (line == undefined) throw new Error("no data in array")
  for (const arrayElement of array) {
    line += "," + arrayElement;
  }
  line += "\n";
  return line;
}

async function start() {
  const fileName = `./csvs/${new Date().valueOf()}.csv`;
  console.log("file stored in: ", fileName);
  let numOfWorkers = 1;
  let maxWorkers = 13;
  let waiter = new EventEmitter();


  await new Promise<void>((resolve, reject) => fs.writeFile(
    fileName,
    'message,results,ratio,elements,numberLeft,numberRight,joinIteratorString,execution time,heapTotal diff,heapTotal total,arrayBuffers dif,arrayBuffers total,rss diff,rss total,heap diff,head total,elementsRatio\n',
    function (err) {
      if (err) {
        reject();
        throw err;
      }
      resolve();
    }
  ));

  for (let number of [200_000]) {
    for (let elementsRatio of [0.01,0.5,0.99]) {
      for (const ratio of [0.1,0.5,0.9]) {
        for (const joinAlgorithm of ["TwoObjectIndexedCount", "TwoHashIndexedCount"]) {
          while (numOfWorkers >= maxWorkers) {
            await new Promise<void>((resolve) => {
              waiter.once("update", () => {
                resolve();
              })
            });
          }
          console.log(number, ratio, joinAlgorithm, "started");
          let myWorker = new Worker('./main.js');
          myWorker.postMessage([ratio, elementsRatio*number, number, number, joinAlgorithm, joinAlgorithm + ": " + number + " & " + ratio]);
          numOfWorkers++;

          myWorker.once("message", (array) => {
            array.push(elementsRatio)
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
}

start();
