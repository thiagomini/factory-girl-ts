import { ModelAdapter } from '@src/adapters/adapter.interface';
import { InstanceOrInterface } from '@src/types/instance-or-interface.type';
import { PartialDeep } from 'type-fest';

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
