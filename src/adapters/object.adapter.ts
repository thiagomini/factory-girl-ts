import { ModelAdapter } from '@src/adapters/adapter.interface';
import { Dictionary } from '@src/types';
import { PartialDeep } from 'type-fest';

export class ObjectAdapter<T> implements ModelAdapter<T> {
  set(model: T, props: PartialDeep<T, { recurseIntoArrays: true }>): T {
    return Object.assign(props as Dictionary, model);
  }
  get<K extends keyof T>(model: T, key: K): T[K] {
    return model[key];
  }
}
