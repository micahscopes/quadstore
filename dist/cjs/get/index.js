"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApproximateSize = exports.getStream = void 0;
const types_1 = require("../types");
const stuff_1 = require("../utils/stuff");
const constants_1 = require("../utils/constants");
const leveliterator_1 = require("./leveliterator");
const serialization_1 = require("../serialization");
const sortingiterator_1 = require("./sortingiterator");
const SORTING_KEY = Symbol();
const compareSortableQuadsReverse = (left, right) => {
    return left[SORTING_KEY] > right[SORTING_KEY] ? -1 : 1;
};
const compareSortableQuads = (left, right) => {
    return left[SORTING_KEY] > right[SORTING_KEY] ? 1 : -1;
};
const emitSortableQuad = (item) => item;
const getLevelQueryForIndex = (pattern, index, prefixes, opts) => {
    const indexQuery = (0, serialization_1.writePattern)(pattern, index, prefixes);
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
        if (levelQuery !== null && (!opts.order || (0, stuff_1.arrStartsWith)(levelQuery.order, opts.order))) {
            return levelQuery;
        }
    }
    return null;
};
const getStream = async (store, pattern, opts) => {
    const { dataFactory, prefixes, indexes } = store;
    const levelQueryFull = getLevelQuery(pattern, indexes, prefixes, opts);
    if (levelQueryFull !== null) {
        const { index, level, order } = levelQueryFull;
        let iterator = new leveliterator_1.LevelIterator(store.db.iterator(level), (key) => {
            return serialization_1.quadReader.read(key, index.prefix.length, index.terms, dataFactory, prefixes);
        });
        return { type: types_1.ResultType.QUADS, order, iterator, index: index.terms, resorted: false };
    }
    const levelQueryNoOpts = getLevelQuery(pattern, indexes, prefixes, constants_1.emptyObject);
    if (levelQueryNoOpts !== null) {
        const { index, level, order } = levelQueryNoOpts;
        let iterator = new leveliterator_1.LevelIterator(store.db.iterator(level), (key) => {
            return serialization_1.quadReader.read(key, index.prefix.length, index.terms, dataFactory, prefixes);
        });
        if (typeof opts.order !== 'undefined' && !(0, stuff_1.arrStartsWith)(opts.order, order)) {
            const digest = (item) => {
                item[SORTING_KEY] = serialization_1.twoStepsQuadWriter.ingest(item, prefixes).write('', opts.order) + constants_1.separator;
                return item;
            };
            const compare = opts.reverse === true ? compareSortableQuadsReverse : compareSortableQuads;
            iterator = new sortingiterator_1.SortingIterator(iterator, compare, digest, emitSortableQuad);
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
        return { type: types_1.ResultType.QUADS, order: opts.order || order, iterator, index: index.terms, resorted: true };
    }
    throw new Error(`No index compatible with pattern ${JSON.stringify(pattern)} and options ${JSON.stringify(opts)}`);
};
exports.getStream = getStream;
const getApproximateSize = async (store, pattern, opts) => {
    if (!store.db.approximateSize) {
        return { type: types_1.ResultType.APPROXIMATE_SIZE, approximateSize: Infinity };
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
                type: types_1.ResultType.APPROXIMATE_SIZE,
                approximateSize: Math.max(1, approximateSize),
            });
        });
    });
};
exports.getApproximateSize = getApproximateSize;
//# sourceMappingURL=index.js.map