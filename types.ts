export type Variables = string[];

export class Binding  {
  diff: boolean

  values: string[];
  variables: Variables;

  public constructor(vars: Variables, val: string[], diff: boolean = true) {
    this.values = val;
    this.variables = vars;
    this.diff = diff;
  }

  public foreach(fn: (val: string, vars: string) => void) {
    for (let i= 0; i < this.values.length; i++) {
      fn(this.values[i], this.variables[i]);
    }
  }
}

export interface Iterator {
  variables: Variables;
  next(): Binding | undefined;
  hasNext(): boolean;
}

export abstract class JoinIterator implements Iterator {
  left: any;
  right: any;

  protected leftIterator: Iterator;
  protected rightIterator: Iterator;

  protected readonly leftIndex: number;
  protected readonly rightIndex: number;
  variables: Variables;
  constructor(right: Iterator, left: Iterator, leftIndex: number, rightIndex: number) {
    this.leftIterator = left;
    this.rightIterator = right;

    this.leftIndex = leftIndex;
    this.rightIndex = rightIndex;

    this.variables = [];
    for (let leftVar of left.variables) {
      this.variables.push(leftVar);
    }
    for (let i = 0; i<right.variables.length; i++) {
      if (i != rightIndex) {
        this.variables.push(right.variables[i]);
      }
    }
  }

  abstract hasNext(): boolean;

  abstract next(): Binding | undefined;
}

export class BindingIterator implements Iterator {
  private array: Binding[];

  public readonly variables: Variables;

  constructor(array: Binding[]) {
    this.array = array;
    this.variables = array[0].variables;
    for (let el of array) {
      if (el.variables != this.variables) throw new Error("some binding(s) don't have the same variables");
    }
  }

  hasNext(): boolean {
    return this.array.length > 0;
  }

  next(): Binding | undefined {
    return this.array.shift();
  }

}

export enum Side {
  right,
  left
}
