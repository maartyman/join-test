import {Binding, Iterator, JoinIterator, Side, Variables} from "./types";
import {DualKeyArrayHashMapCount} from "./DualKeyArrayHashMapCount";

export class TwoHashIndexedCount extends JoinIterator {
  readonly left: DualKeyArrayHashMapCount<Binding>;
  readonly right: DualKeyArrayHashMapCount<Binding>;

  private activeSide: Side;

  private activeElement?: Binding;
  private results: { value: Binding; count: number }[] | undefined;
  private index = 0;
  private count = 0;
  public times = [
    {sum: 0, count: 0},
    {sum: 0, count: 0},
    {sum: 0, count: 0},
    {sum: 0, count: 0},
    {sum: 0, count: 0},
    {sum: 0, count: 0}]
  constructor(right: Iterator, left: Iterator, leftIndex: number, rightIndex: number) {
    super(right, left, leftIndex, rightIndex);
    this.activeSide = Side.left;

    this.left = new DualKeyArrayHashMapCount();
    this.right = new DualKeyArrayHashMapCount();

    this.results = [];
  }

  private combineBindings(leftBinding: Binding, rightBinding: Binding) {
    let values = [];
    for (let value of leftBinding.values) {
      values.push(value);
    }
    for (let i = 0; i<rightBinding.values.length; i++) {
      if (i != this.rightIndex) {
        values.push(rightBinding.values[i]);
      }
    }
    return new Binding(this.variables, values, leftBinding.diff && rightBinding.diff);
  }

  private joinHash(binding: Binding, index: number): string {
    return binding.values[index]
  }

  private bindingHash(binding: Binding): string {
    let hash: string = "";
    binding.foreach((val, vars) => {
      hash += vars + val
    });
    return hash;
  }

  public hasNext(): boolean {
    return (this.results != undefined && this.results.length > 0) || (this.leftIterator.hasNext() || this.rightIterator.hasNext())
  }

  public next(): Binding | undefined {
    //let time0 = performance.now();
    let activeMap: DualKeyArrayHashMapCount<Binding>;
    let otherMap: DualKeyArrayHashMapCount<Binding>;
    while(this.results == undefined || this.results.length == 0) {
      //let time1 = performance.now();
      this.activeSide = (this.activeSide == Side.right)? Side.left : Side.right;

      if (!this.hasNext()) {
        return undefined;
      }

      if (this.activeSide == Side.right) {
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

      //let time2 = performance.now();
      //this.times[0].sum += time2 - time1;
      //this.times[0].count++;

      let bindingHash = this.bindingHash(this.activeElement);
      let joinHash = this.joinHash(this.activeElement, (this.activeSide == Side.right)? this.rightIndex : this.leftIndex);

      //let time3 = performance.now();
      //this.times[1].sum += time3 - time2;
      //this.times[1].count++;

      let good: boolean
      if (this.activeElement.diff) {
        good = activeMap.set(bindingHash, joinHash, this.activeElement);
      }
      else {
        good = activeMap.delete(bindingHash, joinHash);
      }
      //console.log("added element: ")
      //console.log(this.activeElement);
      //console.log(this.left)
      //console.log(this.right)
      if (good) this.results = otherMap.get(joinHash);
      //let time4 = performance.now();
      //this.times[2].sum += time4 - time3;
      //this.times[2].count++;
    }
    //let time5 = performance.now();
    //this.times[3].sum += time5 - time0;
    //this.times[3].count++;

    if (this.activeElement == undefined) {
      return undefined;
    }

    //console.log(Side[this.activeSide])
    //console.log(this.activeElement)
    //console.log(this.results)
    //console.log(this.index)
    //console.log(this.count)

    let returnBinding = (this.activeSide == Side.right)?
      this.combineBindings(this.results[this.index].value, this.activeElement) :
      this.combineBindings(this.activeElement, this.results[this.index].value)


    //let time6 = performance.now();
    //this.times[4].sum += time6 - time5;
    //this.times[4].count++;

    this.count++;
    if (this.count == this.results[this.index].count) {
      this.index++;
      this.count = 0;
      if (this.results.length == this.index) {
        this.results = undefined;
        this.index = 0;
      }
    }

    //let time7 = performance.now();
    //this.times[5].sum += time7 - time6;
    //this.times[5].count++;
    return returnBinding;
  }
}
