
export class DualKeyArrayHashMap<O> {
  private readonly map = new Map<string, O[]>();
  private readonly indexMap = new Map<string, number[]>();
  private readonly mainHashFn: (value: O)=> string;

  constructor(mainHashFn: (value: O)=> string) {
    this.mainHashFn = mainHashFn;
  }

  set(mainKey: string, secondaryKey: string, value: O): boolean {
    let array = this.map.get(secondaryKey);
    if (array) {
      let indexArray = this.indexMap.get(mainKey);
      if (indexArray) {
        indexArray.push(array.length)
      }
      else {
        this.indexMap.set(mainKey, [array.length]);
      }
      array.push(value);
    }
    else {
      this.indexMap.set(mainKey, [0]);
      this.map.set(secondaryKey, [value]);
    }
    return true;
  }

  delete(mainKey: string, secondaryKey: string): boolean {
    let indexArray = this.indexMap.get(mainKey);
    if (indexArray == undefined) {
      return false;
    }
    let index = indexArray.pop();
    if (indexArray.length < 1) {
      this.indexMap.delete(mainKey);
    }
    let array = this.map.get(secondaryKey);
    if (array == undefined) {
      return false;
    }
    if (array.length < 2) {
      this.map.delete(secondaryKey);
      return true;
    }
    else {
      if (index) {
        if (index != array.length - 1) {
          let indexArray2 = this.indexMap.get(this.mainHashFn(array[array.length - 1]));
          if (indexArray2 == undefined) {
            console.log("This shouldn't happen. But if it does, it should be fixed now!")
            this.indexMap.set(this.mainHashFn(array[array.length - 1]), [index])
          }
          else {
            for (let i = 0; i < indexArray2.length; i++) {
              if (indexArray2[i] == array.length - 1) {
                indexArray2[i] = index;
              }
            }
          }
          array[index] = array[array.length - 1]
        }
        array.pop();
        return true;
      }
    }
    return false;
  }

  get(secondaryKey: string): O[] | undefined {
    let mainMap = this.map.get(secondaryKey);
    if (mainMap) {
      return mainMap;
    }
    return undefined;
  }

  has(secondaryKey: string) : boolean {
    return this.map.has(secondaryKey);
  }
}
