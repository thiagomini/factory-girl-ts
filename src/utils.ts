import { Dictionary } from '@src/types';

export function plainObject<T extends Dictionary>(): T {
  return {} as T;
}
