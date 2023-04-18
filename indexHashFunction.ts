import {Binding, Iterator, JoinIterator, Side, Variables} from "./types";
import {DualKeyArrayHashMap} from "./DualKeyArrayHashMap";

export class TwoHashIndexed extends JoinIterator {
  readonly left: DualKeyArrayHashMap<Binding>;
  readonly right: DualKeyArrayHashMap<Binding>;

  private activeSide: Side;

  private activeElement?: Binding;
  private results: Binding[] | undefined;
  private index = 0;
  constructor(right: Iterator, left: Iterator, leftIndex: number, rightIndex: number) {
    super(right, left, leftIndex, rightIndex);
    this.activeSide = Side.left;

    this.left = new DualKeyArrayHashMap(this.bindingHash);
    this.right = new DualKeyArrayHashMap(this.bindingHash);

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
    return (this.results != undefined && this.results.length > 0) || this.leftIterator.hasNext() || this.rightIterator.hasNext()
  }

  public next(): Binding | undefined {
    let activeMap: DualKeyArrayHashMap<Binding>;
    let otherMap: DualKeyArrayHashMap<Binding>;
    while(this.results == undefined || this.results.length == 0) {
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

      let good: boolean
      if (this.activeElement.diff) {
        good = activeMap.set(bindingHash, joinHash, this.activeElement);
      }
      else {
        good = activeMap.delete(bindingHash, joinHash);
      }
      console.log("active element: ", this.activeElement, good)
      console.log("active side: ", Side[this.activeSide])
      if (good) this.results = otherMap.get(joinHash);
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


    let returnBinding = (this.activeSide == Side.right)?
      this.combineBindings(this.results[this.index], this.activeElement) :
      this.combineBindings(this.activeElement, this.results[this.index])

    this.index++;
    if (this.results.length == this.index) {
      this.results = undefined;
      this.index = 0;
    }

    return returnBinding;
  }
}
