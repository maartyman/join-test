/*
export type MapObject<T> = {
  value: T;
  count: number;
}

export class DualKeyHashMap<O> {
  private readonly map = {};

  constructor() {
  }

  set(mainKey: string, secondaryKey: string, value: O): void {
    let mainMap = this.map[secondaryKey];
    if (mainMap) {
      let mapObject = mainMap.get(mainKey);
      if (mapObject) {
        mapObject.count++;
      }
      else {
        mainMap.set(mainKey, {value: value, count: 1});
      }
    }
    else {
      let newMap = {};
      newMap[mainKey] = {value: value, count: 1};
      this.map[secondaryKey] = newMap;
    }
  }

  delete(mainKey: string, secondaryKey: string): boolean {
    let mainMap = this.map.get(secondaryKey);
    if (mainMap) {
      let mapObject = mainMap.get(mainKey);
      if (mapObject) {
        if (mapObject.count > 1){
          mapObject.count--;
          return true;
        }
        else {
          mainMap.delete(mainKey);
          if (mainMap.size == 0) {
            this.map.delete(secondaryKey);
          }
          return true;
        }
      }
    }
    return false;
  }

  get(mainKey: string, secondaryKey: string): MapObject<O> | undefined {
    return this.map.get(secondaryKey)?.get(mainKey);
  }

  getAll(secondaryKey: string): IterableIterator<MapObject<O>> {
    let mainMap = this.map.get(secondaryKey);
    if (mainMap) {
      return mainMap.values();
    }
    return [][Symbol.iterator]();
  }

  forEach(secondaryKey: string, fn: (value: MapObject<O>, key: string, map: Map<string, MapObject<O>>, thisArg?: any) => void): void {
    let mainMap = this.map.get(secondaryKey);
    mainMap?.forEach(fn);
  }

  has(secondaryKey: string) : boolean {
    return this.map.has(secondaryKey);
  }
}
*/
