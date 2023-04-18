import {Binding, Iterator, JoinIterator, Side, Variables} from "./types";
import {DualKeyHashMap, MapObject} from "./DualKeyHashMap";

export class TwoHash extends JoinIterator {
  readonly left: DualKeyHashMap<Binding>;
  readonly right: DualKeyHashMap<Binding>;

  private activeSide: Side;

  private activeElement?: Binding;
  private results: IterableIterator<MapObject<Binding>>;
  private nextResult: IteratorResult<MapObject<Binding>, any>;
  private count = 0;
  constructor(right: Iterator, left: Iterator, leftIndex: number, rightIndex: number) {
    super(right, left, leftIndex, rightIndex);
    this.activeSide = Side.left;

    this.left = new DualKeyHashMap();
    this.right = new DualKeyHashMap();

    this.results = [][Symbol.iterator]();
    this.nextResult = this.results.next();
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
    return !this.nextResult.done || (this.leftIterator.hasNext() || this.rightIterator.hasNext())
  }

  public next(): Binding | undefined {
    let activeMap: DualKeyHashMap<Binding>;
    let otherMap: DualKeyHashMap<Binding>;
    while(this.nextResult.done) {
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

      let bindingHash = this.bindingHash(this.activeElement);
      let joinHash = this.joinHash(this.activeElement, (this.activeSide == Side.right)? this.rightIndex : this.leftIndex);

      if (this.activeElement.diff) {
        activeMap.set(bindingHash, joinHash, this.activeElement);
      }
      else {
        if(!activeMap.delete(bindingHash, joinHash)) continue;
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

    let returnBinding = (this.activeSide == Side.right)?
      this.combineBindings(this.nextResult.value.value, this.activeElement) :
      this.combineBindings(this.activeElement, this.nextResult.value.value)

    this.count++;
    if (this.count >= this.nextResult.value.count) {
      this.count = 0;
      this.nextResult = this.results.next();
    }

    return returnBinding;
  }
}
