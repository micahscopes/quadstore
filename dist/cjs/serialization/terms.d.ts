import type { TermReader, TermWriter } from '../types';
import type { BlankNode, DefaultGraph, Literal, NamedNode } from 'rdf-js';
import { Term } from 'rdf-js';
export declare const namedNodeWriter: TermWriter<NamedNode, 'F'>;
export declare const namedNodeReader: TermReader<NamedNode>;
export declare const blankNodeWriter: TermWriter<BlankNode, 'F'>;
export declare const blankNodeReader: TermReader<BlankNode>;
export declare const genericLiteralWriter: TermWriter<Literal, 'F'>;
export declare const genericLiteralReader: TermReader<Literal>;
export declare const stringLiteralWriter: TermWriter<Literal, 'F'>;
export declare const stringLiteralReader: TermReader<Literal>;
export declare const langStringLiteralWriter: TermWriter<Literal, 'F'>;
export declare const langStringLiteralReader: TermReader<Literal>;
export declare const numericLiteralWriter: TermWriter<Literal, 'T'>;
export declare const numericLiteralReader: TermReader<Literal>;
export declare const defaultGraphWriter: TermWriter<DefaultGraph, 'F'>;
export declare const defaultGraphReader: TermReader<DefaultGraph>;
export declare const termWriter: TermWriter<Term, 'F'>;
export declare const termReader: TermReader<Term>;
