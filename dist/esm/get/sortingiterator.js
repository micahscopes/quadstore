import { AsyncIterator } from 'asynciterator';
import { RESOLVED } from '../utils/stuff.js';
import SortedSet from 'js-sorted-set';
export class SortingIterator extends AsyncIterator {
    constructor(source, compare, digest, emit) {
        super();
        let iterator;
        const startBuffering = () => {
            const set = new SortedSet({ comparator: compare });
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
        RESOLVED.then(startBuffering).catch((err) => {
            RESOLVED.then(() => this.emit('error', err));
        });
    }
}
//# sourceMappingURL=sortingiterator.js.map