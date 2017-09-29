
function key_sort(a, b) {
    return a - b;
}

export interface LinearBufferObj<T> {
    [index: number]: T;
}

function getKeys<T>(obj: LinearBufferObj<T>): number[] {
    return Object.keys(obj).map(k => parseInt(k, 10)).sort(key_sort);
}

function getArray<T>(obj: LinearBufferObj<T>): T[] {
    return getKeys(obj).map(k => obj[k]);
}

export function forEach<T>(obj: LinearBufferObj<T>, f: (v: T) => void) {
    getArray(obj).forEach(v => f(v));
}

export function map<T>(obj: LinearBufferObj<T>, f: (v: T) => void) {
    return getArray(obj).map((v) => f(v));
}

export function unshift<T>(obj: LinearBufferObj<T>, v: T) {
    obj[minIndex(obj) - 1] = v;
}

export function push<T>(obj: LinearBufferObj<T>, v: T) {
    obj[maxIndex(obj) + 1] = v;
}

export function minIndex<T>(obj: LinearBufferObj<T>) {
    return getKeys(obj).shift();
}

export function maxIndex<T>(obj: LinearBufferObj<T>) {
    return getKeys(obj).pop();
}

export function getMinMaxIndex<T>(obj: LinearBufferObj<T>) {
    const keys = getKeys(obj);
    return [keys[0], keys[keys.length - 1]];
}

export function minValue<T>(obj: LinearBufferObj<T>) {
    return obj[minIndex(obj)];
}

export function maxValue<T>(obj: LinearBufferObj<T>) {
    return obj[maxIndex(obj)];
}
