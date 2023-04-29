import { PartialDeep } from 'type-fest';

export interface ModelAdapter<TModel> {
  get<K extends keyof TModel>(model: TModel, key: K): TModel[K];
  set(
    model: TModel,
    props: PartialDeep<TModel, { recurseIntoArrays: true }>,
  ): TModel;
}
