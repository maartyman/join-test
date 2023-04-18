
export class DualKeyArrayHashMapCount<O> {
  private readonly map = new Map<string, {value: O, mainKey: string, count: number}[]>();
  private readonly indexMap = new Map<string, number>();

  set(mainKey: string, secondaryKey: string, value: O): boolean {
    let array = this.map.get(secondaryKey);
    if (array) {
      let index = this.indexMap.get(mainKey);
      if (index != undefined) {
        array[index].count++;
      }
      else {
        this.indexMap.set(mainKey, array.length);
        array.push({value: value, mainKey: mainKey, count: 1});
      }
    }
    else {
      this.indexMap.set(mainKey, 0);
      this.map.set(secondaryKey, [{value: value, mainKey: mainKey, count: 1}]);
    }
    return true;
  }

  delete(mainKey: string, secondaryKey: string): boolean {
    let array = this.map.get(secondaryKey);
    if (array == undefined) {
      return false;
    }
    let index = this.indexMap.get(mainKey);
    if (index == undefined) {
      return false;
    }
    if (array[index].count > 1) {
      array[index].count--;
      return true;
    }
    if (array.length < 2) {
      this.map.delete(secondaryKey);
      return this.indexMap.delete(mainKey);
    }
    this.indexMap.set(array[array.length - 1].mainKey, index);
    array[index] = array[array.length - 1];
    array.pop();
    this.indexMap.delete(mainKey);
    return true;
  }

  get(secondaryKey: string): {value: O, count: number}[] | undefined {
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
