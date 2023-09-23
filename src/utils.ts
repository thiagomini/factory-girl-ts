/* eslint-disable @typescript-eslint/no-explicit-any */
import { merge } from 'lodash';
import { Dictionary } from './types';

export function plainObject<T extends Dictionary>(): T {
  return {} as T;
}

/**
 * Performs a deep merge of objects and returns new object. Does not modify
 * objects (immutable) and merges arrays via concatenation. When a property is an association,
 * it entirely replaces the previous value.
 */
export function mergeDeep<T>(
  object1: Partial<T>,
  object2: Partial<T> = {},
): any {
  return merge(object1, object2);
}
