import type { AbstractIterator } from 'abstract-level';
import { BufferedIterator } from 'asynciterator';
type MapFn<K, V, T> = (key: K, value: V) => T;
type OnNextValue<K, V> = (err: Error | null | undefined, key: K | undefined, value: V | undefined) => any;
type ReadState<K, V> = {
    remaining: number;
    next: OnNextValue<K, V>;
};
export declare class LevelIterator<K, V, T> extends BufferedIterator<T> {
    level: AbstractIterator<any, K, V>;
    mapFn: MapFn<K, V, T>;
    private levelEnded;
    constructor(levelIterator: AbstractIterator<any, K, V>, mapper: MapFn<K, V, T>);
    _read(qty: number, done: (err?: Error) => void): void;
    protected _onNextValue(state: ReadState<K, V>, done: (err?: Error) => void, err: Error | null | undefined, key: K | undefined, value: V | undefined): void;
    protected _endLevel(cb: (err?: Error | null) => void): void;
    protected _end(destroy?: boolean): void;
    protected _destroy(cause: Error | undefined, cb: (err?: Error) => void): void;
}
export {};
