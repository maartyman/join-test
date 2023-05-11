import {Binding, BindingIterator, Iterator, JoinIterator, Variables} from "./types";
import {TwoHash} from "./two-hash-func";
import {TwoHashObject} from "./two-hash-func-dict";
import { Random } from "./random";
import {InnerLoop} from "./InnerLoop";
import * as process from "process";
import {TwoHashIndexed} from "./indexHashFunction";
import {TwoHashIndexedCount} from "./indexHashFunctionCount";
import {TwoObjectIndexedCount} from "./indexObjectFunctionCount";
const { parentPort, isMainThread} = require('node:worker_threads');

function test(
  ratio: number,
  elements: number,
  numberLeft: number,
  numberRight: number,
  joinIteratorString: string,
  message: string
) {
  let leftVariables: Variables = ["x", "y", "z"];
  let rightVariables: Variables = ["a", "b" , "x"];

  let leftBindings: Binding[] = [];

  let random = new Random(168);

  let added = [];

  leftBindings.push(new Binding(leftVariables, [
        Math.floor(random.next()*elements).toString(),
        Math.floor(random.next()*elements).toString(),
        Math.floor(random.next()*elements).toString(),
      ],
      true)
  );
  added.push(leftBindings[0]);

  //console.log("starting building left array")
  for (let i = 0; i < numberLeft; i++) {
    if (random.next() < ratio) {
      let binding = new Binding(leftVariables, [
          Math.floor(random.next()*elements).toString(),
          Math.floor(random.next()*elements).toString(),
          Math.floor(random.next()*elements).toString(),
        ],
        true)
      leftBindings.push(binding);
      added.push(binding);
    }
    else {
      if (added.length > 0) {
        let index = Math.floor(random.next()*added.length)
        leftBindings.push(new Binding(
          leftVariables,
          added[index].values,
          false)
        );
        added[index] = added[added.length-1]
        added.pop();
      }
      else {
        i--;
      }
    }
  }

  let rightBindings: Binding[] = [];
  added = []

  rightBindings.push(new Binding(rightVariables, [
        Math.floor(random.next()*elements).toString(),
        Math.floor(random.next()*elements).toString(),
        Math.floor(random.next()*elements).toString(),
      ],
      true)
  );
  added.push(rightBindings[0]);

  //console.log("starting building right array")
  for (let i = 0; i < numberRight; i++) {
    if (random.next() < ratio) {
      let binding = new Binding(rightVariables, [
          Math.floor(random.next()*elements).toString(),
          Math.floor(random.next()*elements).toString(),
          Math.floor(random.next()*elements).toString(),
        ],
        true);
      rightBindings.push(binding);
      added.push(binding);
    }
    else {
      if (added.length > 0) {
        let index = Math.floor(random.next()*added.length)
        rightBindings.push(new Binding(
          rightVariables,
          added[index].values,
          false)
        );
        added[index] = added[added.length-1]
        added.pop();
      }
      else {
        i--;
      }
    }
  }

  /*
  console.log("leftBindings: ")
  console.log(leftBindings)
  console.log("rightBindings: ")
  console.log(rightBindings)
   */

  let leftIterator = new BindingIterator(leftBindings);
  let rightIterator = new BindingIterator(rightBindings);

  let joinIterator: new (right: Iterator, left: Iterator, leftIndex: number, rightIndex: number) => JoinIterator;
    switch (joinIteratorString) {
    case "InnerLoop":
      joinIterator = InnerLoop
      break;
    case "TwoHash":
      joinIterator = TwoHash
      break;
      case "TwoHashObject":
        joinIterator = TwoHashObject
        break;
    case "TwoHashIndexed":
      joinIterator = TwoHashIndexed
      break;
    case "TwoHashIndexedCount":
      joinIterator = TwoHashIndexedCount
      break;
    case "TwoObjectIndexedCount":
        joinIterator = TwoObjectIndexedCount
        break;
    default:
      throw new Error("Join Algorithm " + joinIteratorString + " is not known!")
      break;
  }

  let join = new joinIterator(rightIterator, leftIterator, 0, 2);

  //console.log("starting join")

  let heapBefore = process.memoryUsage().heapUsed;
  let rssBefore = process.memoryUsage().rss;
  let arrayBuffersBefore = process.memoryUsage().arrayBuffers;
  let heapTotalBefore = process.memoryUsage().heapTotal;
  let timeBefore = performance.now();

  let results = 0;
  while (join.hasNext()) {
    let next = join.next();
    if (next) results++;
    /*
    console.log("next: ")
    console.log(next)
    console.log(join.left)
    console.log(join.right)
     */
  }
  /*
  console.log("done")

  console.log(join.left)
  console.log(join.right)
  */
  /*
  for (const el of (<TwoHashIndexedCount>join).times) {
    el.sum = el.sum/el.count;
  }

  console.log((<TwoHashIndexedCount>join).times)
   */

  let timeAfter = performance.now();
  let heapTotalAfter = process.memoryUsage().heapTotal;
  let arrayBuffersAfter = process.memoryUsage().arrayBuffers;
  let rssAfter = process.memoryUsage().rss;
  let heapAfter = process.memoryUsage().heapUsed;

  //console.log(message);
  //console.log("no. results: ", results);
  //console.log("time: ", ((timeAfter - timeBefore)/1000).toString().replace(".",","));
  //console.log("heapTotal: ", (heapTotalAfter - heapTotalBefore)/1024/1024, "after: ", heapTotalAfter/1024/1024);
  //console.log("arrayBuffers: ", (arrayBuffersAfter - arrayBuffersBefore)/1024/1024, "after: ", arrayBuffersAfter/1024/1024);
  //console.log("rss: ", (rssAfter - rssBefore)/1024/1024, "after: ", rssAfter/1024/1024);
  //console.log("heap: ", (heapAfter - heapBefore)/1024/1024, "after: ", heapAfter/1024/1024);
  //console.log("")

  if (!isMainThread) {
    parentPort.postMessage([
      message,
      results.toString(),
      ratio.toString(),
      elements.toString(),
      numberLeft.toString(),
      numberRight.toString(),
      joinIteratorString,
      ((timeAfter - timeBefore) / 1000).toString(),
      ((heapTotalAfter - heapTotalBefore) / 1024 / 1024).toString(),
      (heapTotalAfter / 1024 / 1024).toString(),
      ((arrayBuffersAfter - arrayBuffersBefore) / 1024 / 1024).toString(),
      (arrayBuffersAfter / 1024 / 1024).toString(),
      ((rssAfter - rssBefore) / 1024 / 1024).toString(),
      (rssAfter / 1024 / 1024).toString(),
      ((heapAfter - heapBefore) / 1024 / 1024).toString(),
      (heapAfter / 1024 / 1024).toString()
    ]);
  }

  return results;
}


if (isMainThread) {
  /*
  console.log("innerloop: ")
  test(100,10000,10000, InnerLoop);
  console.log("innerhash: ")
  test(100,10000,10000, TwoHash);
  console.log("HashIndexed: ")
  test(100,10000,10000, TwoHashIndexed);
   */

  //{ i: 2, j: 3, k: 4, joinOne: 9, joinTwo: 8 }
  //test(0.5,2,3,4, "TwoHash","");
  test(0.5, 5, 30, 30, "TwoHashDict", "");

  /*
  let temp = [];
  for (let i = 1; i < 10; i++) {
    for (let j = 1; j < 50; j++) {
      for (let k = 1; k < 50; k++) {
        //console.log(k,i,j);
        //test(k,i,j, TwoHashIndexed);
        let joinOne = test(0.5,i,j,k, "TwoHash","");
        let joinTwo = test(0.5,i,j,k, "TwoHashIndexed", "");
        if (joinOne != joinTwo) {
          temp.push({i: i, j: j, k: k, joinOne: joinOne, joinTwo: joinTwo})
        }
      }
    }
  }

  console.log(temp.sort((obj1, obj2) => {
    return obj1.joinTwo - obj2.joinTwo;
  }))
  */

  /*
  for (let number of [1000,10_000,25_000,50_000,75_000,100_000,125_000]) {
    //console.log("innerloop: ", number)
    //test(100,number, number, InnerLoop);
    console.log("TwoHash: ", number)
    test(100,number, number, TwoHash);
    console.log("TwoHashIndexed: ", number)
    test(100,number, number, TwoHashIndexed);
    console.log("TwoHashIndexedCount: ", number)
    test(100,number, number, TwoHashIndexedCount);
  }
  */
}
else {
  parentPort.on("message", (e: any) => {
    test(e[0], e[1], e[2], e[3], e[4], e[5]);
  });
}
