
export type MapObject<T> = {
  value: T;
  count: number;
}

export class DualKeyObject<O> {
  private readonly map = Object.create(null);

  constructor() {
  }

  set(mainKey: string, secondaryKey: string, value: O): void {
    let mainMap = this.map[secondaryKey];
    if (mainMap !== undefined) {
      let mapObject = mainMap[mainKey];
      if (mapObject !== undefined) {
        mapObject.count++;
      }
      else {
        mainMap[mainKey] = {value: value, count: 1};
      }
    }
    else {
      let newMap = Object.create(null);
      newMap[mainKey] = {value: value, count: 1};
      this.map[secondaryKey] = newMap;
    }
  }

  delete(mainKey: string, secondaryKey: string): boolean {
    let mainMap = this.map[secondaryKey];
    if (mainMap !== undefined) {
      let mapObject = mainMap[mainKey];
      if (mapObject !== undefined) {
        if (mapObject.count > 1){
          mapObject.count--;
          return true;
        }
        else {
          delete mainMap[mainKey];
          if (mainMap.size === 0) {
            delete this.map[secondaryKey];
          }
          return true;
        }
      }
    }
    return false;
  }

  get(mainKey: string, secondaryKey: string): MapObject<O> | undefined {
    let mainMap = this.map[secondaryKey]
    return (mainMap === undefined)? undefined : mainMap[mainKey];
  }

  getAll(secondaryKey: string): MapObject<O>[] {
    let mainMap = this.map[secondaryKey];
    if (mainMap !== undefined) {
      return Object.values(mainMap);
    }
    return [];
  }

  has(secondaryKey: string) : boolean {
    return this.map[secondaryKey] !== undefined;
  }
}
