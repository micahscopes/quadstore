export const emptyObject = {};
export const boundary = '\uDBFF\uDFFF';
export const separator = '\u0000\u0000';
export const termNames = [
    'subject',
    'predicate',
    'object',
    'graph',
];
export const defaultIndexes = [
    ['subject', 'predicate', 'object', 'graph'],
    ['object', 'graph', 'subject', 'predicate'],
    ['graph', 'subject', 'predicate', 'object'],
    ['subject', 'object', 'predicate', 'graph'],
    ['predicate', 'object', 'graph', 'subject'],
    ['graph', 'predicate', 'object', 'subject'],
];
export const levelPutOpts = {
    keyEncoding: 'utf8',
    valueEncoding: 'view',
};
export const levelDelOpts = {
    keyEncoding: 'utf8',
};
export const emptyValue = new Uint8Array(0);
//# sourceMappingURL=constants.js.map