import { ResultType } from '../types/index.js';
import { arrStartsWith } from '../utils/stuff.js';
import { emptyObject, separator } from '../utils/constants.js';
import { LevelIterator } from './leveliterator.js';
import { quadReader, twoStepsQuadWriter, writePattern } from '../serialization/index.js';
import { SortingIterator } from './sortingiterator.js';
const SORTING_KEY = Symbol();
const compareSortableQuadsReverse = (left, right) => {
    return left[SORTING_KEY] > right[SORTING_KEY] ? -1 : 1;
};
const compareSortableQuads = (left, right) => {
    return left[SORTING_KEY] > right[SORTING_KEY] ? 1 : -1;
};
const emitSortableQuad = (item) => item;
const getLevelQueryForIndex = (pattern, index, prefixes, opts) => {
    const indexQuery = writePattern(pattern, index, prefixes);
    if (indexQuery === null) {
        return null;
    }
    const levelOpts = {
        [indexQuery.gte ? 'gte' : 'gt']: indexQuery.gt,
        [indexQuery.lte ? 'lte' : 'lt']: indexQuery.lt,
        keys: true,
        values: false,
        keyEncoding: 'utf8',
    };
    if (typeof opts.limit === 'number') {
        levelOpts.limit = opts.limit;
    }
    if (typeof opts.reverse === 'boolean') {
        levelOpts.reverse = opts.reverse;
    }
    return { level: levelOpts, order: indexQuery.order, index: indexQuery.index };
};
const getLevelQuery = (pattern, indexes, prefixes, opts) => {
    for (let i = 0, index; i < indexes.length; i += 1) {
        index = indexes[i];
        const levelQuery = getLevelQueryForIndex(pattern, index, prefixes, opts);
        if (levelQuery !== null && (!opts.order || arrStartsWith(levelQuery.order, opts.order))) {
            return levelQuery;
        }
    }
    return null;
};
export const getStream = async (store, pattern, opts) => {
    const { dataFactory, prefixes, indexes } = store;
    const levelQueryFull = getLevelQuery(pattern, indexes, prefixes, opts);
    if (levelQueryFull !== null) {
        const { index, level, order } = levelQueryFull;
        let iterator = new LevelIterator(store.db.iterator(level), (key) => {
            return quadReader.read(key, index.prefix.length, index.terms, dataFactory, prefixes);
        });
        return { type: ResultType.QUADS, order, iterator, index: index.terms, resorted: false };
    }
    const levelQueryNoOpts = getLevelQuery(pattern, indexes, prefixes, emptyObject);
    if (levelQueryNoOpts !== null) {
        const { index, level, order } = levelQueryNoOpts;
        let iterator = new LevelIterator(store.db.iterator(level), (key) => {
            return quadReader.read(key, index.prefix.length, index.terms, dataFactory, prefixes);
        });
        if (typeof opts.order !== 'undefined' && !arrStartsWith(opts.order, order)) {
            const digest = (item) => {
                item[SORTING_KEY] = twoStepsQuadWriter.ingest(item, prefixes).write('', opts.order) + separator;
                return item;
            };
            const compare = opts.reverse === true ? compareSortableQuadsReverse : compareSortableQuads;
            iterator = new SortingIterator(iterator, compare, digest, emitSortableQuad);
            if (typeof opts.limit !== 'undefined') {
                const onEndOrError = function () {
                    this.removeListener('end', onEndOrError);
                    this.removeListener('error', onEndOrError);
                    this.destroy();
                };
                iterator = iterator.take(opts.limit)
                    .on('end', onEndOrError)
                    .on('error', onEndOrError);
            }
        }
        return { type: ResultType.QUADS, order: opts.order || order, iterator, index: index.terms, resorted: true };
    }
    throw new Error(`No index compatible with pattern ${JSON.stringify(pattern)} and options ${JSON.stringify(opts)}`);
};
export const getApproximateSize = async (store, pattern, opts) => {
    if (!store.db.approximateSize) {
        return { type: ResultType.APPROXIMATE_SIZE, approximateSize: Infinity };
    }
    const { indexes, prefixes } = store;
    const levelQuery = getLevelQuery(pattern, indexes, prefixes, opts);
    if (levelQuery === null) {
        throw new Error(`No index compatible with pattern ${JSON.stringify(pattern)} and options ${JSON.stringify(opts)}`);
    }
    const { level } = levelQuery;
    const start = level.gte || level.gt;
    const end = level.lte || level.lt;
    return new Promise((resolve, reject) => {
        store.db.approximateSize(start, end, (err, approximateSize) => {
            if (err) {
                reject(err);
                return;
            }
            resolve({
                type: ResultType.APPROXIMATE_SIZE,
                approximateSize: Math.max(1, approximateSize),
            });
        });
    });
};
//# sourceMappingURL=index.js.map