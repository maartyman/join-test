import {Binding, Iterator, JoinIterator, Side} from "./types";

export class InnerLoop extends JoinIterator {
  private index: number;
  readonly left: Binding[];
  readonly right: Binding[];
  private activeElement?: Binding;

  private activeSide: Side;
  private nextResult?: Binding;

  constructor(right: Iterator, left: Iterator, leftIndex: number, rightIndex: number) {
    super(right, left, leftIndex, rightIndex);
    this.activeSide = Side.left;

    this.left = [];
    this.right = [];
    this.index = 0;
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

  hasNext(): boolean {
    return this.index > 0 || this.leftIterator.hasNext() || this.rightIterator.hasNext()
  }

  private canJoin(left: Binding, right: Binding): boolean {
    return left.values[this.leftIndex] == right.values[this.rightIndex]
  }

  next(): Binding | undefined {
    let activeArray;
    let otherArray;
    if (this.activeSide == Side.right) {
      activeArray = this.right;
      otherArray = this.left;
    }
    else {
      activeArray = this.left;
      otherArray = this.right;
    }
    while (!this.nextResult) {
      if (!this.activeElement) {
        this.activeSide = (this.activeSide == Side.right)? Side.left : Side.right;

        if (!this.hasNext()) {
          return undefined;
        }

        if (this.activeSide == Side.right) {
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
          let index = activeArray.findIndex((binding: Binding) => {
            if (!this.activeElement) return false;
            let bool = true;
            for (let i = 0; i < this.activeElement?.values.length; i++) {
              if (!(this.activeElement?.values[i] == binding.values[i])) {
                bool = false;
              }
            }
            return bool;
          });
          if (index != -1) {
            //console.log("index: ", index)
            activeArray[index] = activeArray[activeArray.length-1];
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

      if (this.activeSide == Side.right) {
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
