import { InstanceOrInterface } from '@src/types/instance-or-interface.type';
import { PartialDeep } from 'type-fest';

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
