import { ModelAdapter } from '@src/adapters/adapter.interface';
import { Model } from 'sequelize';
import { PartialDeep } from 'type-fest';

export class SequelizeAdapter<T extends Model> implements ModelAdapter<T> {
  get<K extends keyof T>(model: T, key: K): T[K] {
    return model.get(key);
  }
  set(model: T, props: PartialDeep<T, { recurseIntoArrays: true }>): T {
    return model.set(props);
  }
}
