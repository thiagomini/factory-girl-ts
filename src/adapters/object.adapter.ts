import { PartialDeep } from 'type-fest';
import { InstanceOrInterface } from '../types/instance-or-interface.type';
import { ModelAdapter } from './adapter.interface';

export class ObjectAdapter<T> implements ModelAdapter<T, T> {
  save(model: T): Promise<T> {
    return Promise.resolve(model);
  }
  build(
    _ModelClass: T,
    props: PartialDeep<InstanceOrInterface<T>, { recurseIntoArrays: true }>,
  ): T {
    return props as T;
  }
  get<K extends keyof T>(model: T, key: K): T[K] {
    return model[key];
  }
}
