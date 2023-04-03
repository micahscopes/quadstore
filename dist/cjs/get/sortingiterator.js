"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortingIterator = void 0;
const asynciterator_1 = require("asynciterator");
const stuff_1 = require("../utils/stuff");
const js_sorted_set_1 = __importDefault(require("js-sorted-set"));
class SortingIterator extends asynciterator_1.AsyncIterator {
    constructor(source, compare, digest, emit) {
        super();
        let iterator;
        const startBuffering = () => {
            const set = new js_sorted_set_1.default({ comparator: compare });
            const cleanup = () => {
                source.removeListener('data', onData);
                source.removeListener('error', onError);
                source.removeListener('end', onEnd);
                source.destroy();
            };
            const onData = (item) => {
                set.insert(digest(item));
            };
            const onError = (err) => {
                cleanup();
                this.emit('error', err);
            };
            const onEnd = () => {
                cleanup();
                iterator = set.beginIterator();
                this.readable = true;
            };
            source.on('data', onData);
            source.on('error', onError);
            source.on('end', onEnd);
        };
        this.read = () => {
            if (iterator) {
                const value = iterator.value();
                if (value === null) {
                    this.close();
                    return null;
                }
                iterator = iterator.next();
                return emit(value);
            }
            this.readable = false;
            return null;
        };
        stuff_1.RESOLVED.then(startBuffering).catch((err) => {
            stuff_1.RESOLVED.then(() => this.emit('error', err));
        });
    }
}
exports.SortingIterator = SortingIterator;
//# sourceMappingURL=sortingiterator.js.map