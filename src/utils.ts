import { Dictionary } from './types';

export function plainObject<T extends Dictionary>(): T {
  return {} as T;
}
