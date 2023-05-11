//<string, {value: O, mainKey: string, count: number}[]>
//<string, number>

export class DualKeyArrayObjectCount<O> {
  private readonly map = Object.create(null);
  private readonly indexMap = Object.create(null);

  set(mainKey: string, secondaryKey: string, value: O): boolean {
    let array = this.map[secondaryKey];
    if (array) {
      let index = this.indexMap[mainKey];
      if (index != undefined) {
        array[index].count++;
      }
      else {
        this.indexMap[mainKey] = array.length;
        array.push({value: value, mainKey: mainKey, count: 1});
      }
    }
    else {
      this.indexMap[mainKey] = 0;
      this.map[secondaryKey] = [{value: value, mainKey: mainKey, count: 1}];
    }
    return true;
  }

  delete(mainKey: string, secondaryKey: string): boolean {
    let array = this.map[secondaryKey];
    if (array == undefined) {
      return false;
    }
    let index = this.indexMap[mainKey];
    if (index == undefined) {
      return false;
    }
    if (array[index].count > 1) {
      array[index].count--;
      return true;
    }
    if (array.length < 2) {
      delete this.map[secondaryKey];
      return delete this.indexMap[mainKey];
    }
    this.indexMap[array[array.length - 1].mainKey] = index;
    array[index] = array[array.length - 1];
    array.pop();
    delete this.indexMap[mainKey];
    return true;
  }

  get(secondaryKey: string): {value: O, count: number}[] | undefined {
    let mainMap = this.map[secondaryKey];
    if (mainMap) {
      return mainMap;
    }
    return undefined;
  }

  has(secondaryKey: string) : boolean {
    return this.map[secondaryKey] !== undefined;
  }
}
