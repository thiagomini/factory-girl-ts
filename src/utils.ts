/* eslint-disable @typescript-eslint/no-explicit-any */
import { isObject } from 'lodash';
import { isAssociation } from './association';
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
  return [object1 ?? {}, object2].reduce((prev, obj) => {
    Object.keys(obj).forEach((key) => {
      const keyParsed = key as keyof T;

      const finalObjectValue = prev[keyParsed];
      const currentObjectValue = obj[keyParsed];

      if (isAssociation(currentObjectValue)) {
        prev[keyParsed] = currentObjectValue as T[keyof T];
        return;
      }

      if (
        Array.isArray(finalObjectValue) &&
        Array.isArray(currentObjectValue)
      ) {
        prev[keyParsed] = finalObjectValue.concat(...currentObjectValue) as any;
      } else if (isObject(finalObjectValue) && isObject(currentObjectValue)) {
        prev[keyParsed] = mergeDeep(
          finalObjectValue as Partial<T>,
          currentObjectValue as Partial<T>,
        );
      } else {
        prev[keyParsed] = currentObjectValue;
      }
    });

    return prev;
  }, {} as T) as T;
}
