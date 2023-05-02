import { ModelAdapter } from '@src/adapters/adapter.interface';
import { Model, ModelStatic } from 'sequelize';
import { Class, PartialDeep } from 'type-fest';

export class SequelizeAdapter<
  TEntity extends Model,
  T extends ModelStatic<TEntity>,
> implements ModelAdapter<T, Model>
{
  get<K extends keyof Model>(model: Model, key: K): Model[K] {
    return model.get(key);
  }
  build(
    ModelClass: T,
    props: PartialDeep<
      T extends Class<infer U> ? U : T,
      { recurseIntoArrays: true }
    >,
  ): TEntity {
    return ModelClass.build(props);
  }

  async save(model: Model): Promise<Model> {
    return await model.save();
  }
}
