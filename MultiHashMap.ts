
type mapObject<T> = {
  value: T;
  count: number;
}

export class MultiHashMap<O> {
  private readonly hashFuncs: ((obj: O)=>string)[];
  private readonly mainMap = new Map<string, mapObject<O>>();
  private readonly otherMap = new Map<string, mapObject<O>[]>();

  constructor(hashFuncs: ((obj: O)=>string)[]) {
    if (hashFuncs.length === 0) {
      throw new Error('Please provide at least one hash function');
    }
    this.hashFuncs = hashFuncs;
  }

  private getDimHash(key: string, dimension: number) {
    return "#" + dimension + "#" + key;
  }

  set(value: O): void {
    let hash0 = this.hashFuncs[0](value);
    let obj = this.mainMap.get(hash0);
    if (obj) obj.count++;
    else {
      obj = {value: value, count: 1};
      this.mainMap.set(hash0, obj);
      for (let i = 1; i < this.hashFuncs.length; i++) {
        let currentHash = this.getDimHash(this.hashFuncs[i](value), i);
        let objArray = this.otherMap.get(currentHash);
        if (objArray) {
          objArray.push(obj);
        }
        else {
          this.otherMap.set(currentHash, [obj]);
        }
      }
    }
  }
/*
  delete(key: string, dimension: number): boolean {
    let obj: mapObject<O>;
    if (dimension == 0) {
      obj = this.mainMap.get(key);
    }

    let obj = this.map.get(this.gethash(key, dimension));
    if (obj == undefined) {
      return false;
    }
    let bool = true;
    for (const key of obj.keys) {
      if(!this.map.delete(this.gethash(key, dimension))) bool = false;
    }
    return bool;
  }
  delete(obj: O): boolean {
    let hash0 = this.hashFuncs[0](obj);
    let mainMapObject = this.mainMap.get(hash0);
    if (mainMapObject) {
      if (mainMapObject.count > 1) {
        mainMapObject.count--;
        return true;
      }
      else {
        this.mainMap.delete(hash0);
        for (let i = 1; i < this.hashFuncs.length; i++) {
          this.otherMap.get("").
        }
      }
    }
    return false;
  }

  get(key: string): mapObject<O> | undefined {
    return this.map.get(this.gethash(key, 0))?.value;
  }

  getAll(key: string, dimension: number): mapObject<O>[] | undefined {
    if (dimension == 0) {
      return [this.map.get(this.gethash(key, dimension))?.value];
    }
    return this.map.get(this.gethash(key, dimension))?.value;
  }

  has(key: string, dimension: number) : boolean {
    return this.map.has(this.gethash(key, dimension));
  }
 */
}
