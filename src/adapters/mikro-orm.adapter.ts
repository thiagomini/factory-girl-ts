/* eslint-disable @typescript-eslint/no-explicit-any */
import { MikroORM } from '@mikro-orm/core';
import { ModelAdapter } from './adapter.interface';

export class MikroOrmAdapter<TModelSchema, ReturnType>
  implements ModelAdapter<TModelSchema, ReturnType>
{
  constructor(private readonly orm: MikroORM) {}

  build(ModelClass: TModelSchema, props: any) {
    const modelRepository = this.orm.em.fork().getRepository(ModelClass as any);
    return modelRepository.create(props) as ReturnType;
  }
  async save(model: any): Promise<any> {
    await this.orm.em.fork().persistAndFlush(model);
    return model;
  }
  get<K extends string | number | symbol>(model: any, key: K) {
    return model[key];
  }
}
