import Key from './key'

export type AnyIterable<T> = Iterable<T> | AsyncIterable<T>
export type PromiseOrValue<T> = Promise<T> | T
export interface Pair {
    key: Key,
    value: Uint8Array
}
/**
 * Options for async operations.
 */
export interface Options {
    signal?: AbortSignal;
}

export interface Batch {
    put(key: Key, value: Uint8Array): void;
    delete(key: Key): void;
    commit(options?: Options): Promise<void>;
}

export interface IDatastore {
    open(): Promise<void>
    close(): Promise<void>
    /**
     * Store the passed value under the passed key
     *
     * @example
     *
     * ```js
     * await store.put([{ key: new Key('awesome'), value: new Uint8Array([0, 1, 2, 3]) }])
     * ```
     */
    put(key: Key, val: Uint8Array, options?: Options): Promise<void>;
    /**
     * Retrieve the value stored under the given key
     *
     * @example
     * ```js
     * const value = await store.get(new Key('awesome'))
     * console.log('got content: %s', value.toString('utf8'))
     * // => got content: datastore
     * ```
     */
    get(key: Key, options?: Options): Promise<Uint8Array>;
    /**
     * Check for the existence of a value for the passed key
     *
     * @example
     * ```js
     *const exists = await store.has(new Key('awesome'))
     *
     *if (exists) {
     *  console.log('it is there')
     *} else {
     *  console.log('it is not there')
     *}
     *```
     */
    has(key: Key, options?: Options): Promise<boolean>;
    /**
     * Remove the record for the passed key
     *
     * @example
     *
     * ```js
     * await store.delete(new Key('awesome'))
     * console.log('deleted awesome content :(')
     * ```
     */
    delete(key: Key, options?: Options): Promise<void>;
    /**
     * Store the given key/value pairs
     *
     * @example
     * ```js
     * const source = [{ key: new Key('awesome'), value: new Uint8Array([0, 1, 2, 3]) }]
     *
     * for await (const { key, value } of store.putMany(source)) {
     *   console.info(`put content for key ${key}`)
     * }
     * ```
     */
    putMany(
        source: AnyIterable<Pair>,
        options?: Options,
    ): AsyncGenerator<Pair>;
    /**
     * Retrieve values for the passed keys
     *
     * @example
     * ```js
     * for await (const value of store.getMany([new Key('awesome')])) {
     *   console.log('got content:', new TextDecoder('utf8').decode(value))
     *   // => got content: datastore
     * }
     * ```
     */
    getMany(source: AnyIterable<Key>, options?: Options): AsyncGenerator<Uint8Array>;
    /**
     * Remove values for the passed keys
     *
     * @example
     *
     * ```js
     * const source = [new Key('awesome')]
     *
     * for await (const key of store.deleteMany(source)) {
     *   console.log(`deleted content with key ${key}`)
     * }
     * ```
     */
    deleteMany(source: AnyIterable<Key>, options?: Options): AsyncGenerator<Key>;
    /**
     * This will return an object with which you can chain multiple operations together, with them only being executed on calling `commit`.
     *
     * @example
     * ```js
     * const b = store.batch()
     *
     * for (let i = 0; i < 100; i++) {
     *   b.put(new Key(`hello${i}`), new TextEncoder('utf8').encode(`hello world ${i}`))
     * }
     *
     * await b.commit()
     * console.log('put 100 values')
     * ```
     */
    batch(): Batch;
    /**
     * Query the store.
     *
     * @example
     * ```js
     * // retrieve __all__ values from the store
     * let list = []
     * for await (const value of store.query({})) {
     *   list.push(value)
     * }
     * console.log('ALL THE VALUES', list)
     * ```
     */
    query(q: Query, options?: Options): AsyncGenerator<Pair|{key: Key}>;
    /**
     * Yield all datastore values
     *
     * @private
     * @param q
     * @param options
     */
    _all(q: Query, options?: Options): AsyncGenerator<Pair>
}

export interface Query {
    prefix?: string;
    filters?: Array<(item: Pair) => boolean>;
    orders?: Array<(items: Array<Pair>) => Array<Pair>>;
    limit?: number;
    offset?: number;
    keysOnly?: boolean;
}
