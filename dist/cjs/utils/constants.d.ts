import type { TermName } from '../types';
import type { AbstractChainedBatchPutOptions, AbstractChainedBatchDelOptions } from 'abstract-level';
export declare const emptyObject: {
    [key: string]: any;
};
export declare const boundary = "\uDBFF\uDFFF";
export declare const separator = "\0\0";
export declare const termNames: TermName[];
export declare const defaultIndexes: TermName[][];
export declare const levelPutOpts: AbstractChainedBatchPutOptions<any, any, any>;
export declare const levelDelOpts: AbstractChainedBatchDelOptions<any, any>;
export declare const emptyValue: Uint8Array;
