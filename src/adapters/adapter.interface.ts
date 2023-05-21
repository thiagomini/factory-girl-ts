import { PartialDeep } from 'type-fest';
import { InstanceOrInterface } from '../types/instance-or-interface.type';

export interface ModelAdapter<ModelClass, ReturnType> {
  build(
    ModelClass: ModelClass,
    props: PartialDeep<
      InstanceOrInterface<ModelClass>,
      { recurseIntoArrays: true }
    >,
  ): ReturnType;

  save(model: ReturnType, modelClass: ModelClass): Promise<ReturnType>;

  get<K extends keyof ReturnType>(model: ReturnType, key: K): ReturnType[K];
}
