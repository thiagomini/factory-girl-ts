/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseEntity, EntityManager, MikroORM } from '@mikro-orm/core';
import { ModelAdapter } from './adapter.interface';

export type MikroOrmAdapterOptions = {
  shouldFork: boolean;
};

export class MikroOrmAdapter<
  TModelSchema extends BaseEntity<any, any>,
  ReturnType,
> implements ModelAdapter<TModelSchema, ReturnType>
{
  constructor(
    private readonly orm: MikroORM,
    private readonly options: MikroOrmAdapterOptions = {
      shouldFork: true,
    },
  ) {}

  private shouldFork(): boolean {
    return Boolean(this.options.shouldFork);
  }

  private geEntityManager(): EntityManager {
    return this.shouldFork() ? this.orm.em.fork() : this.orm.em;
  }

  build(ModelClass: TModelSchema, props: any) {
    const em = this.geEntityManager();
    const modelRepository = em.getRepository(ModelClass as any);
    return modelRepository.create(props) as ReturnType;
  }
  async save(model: any): Promise<any> {
    const em = this.geEntityManager();
    await em.persistAndFlush(model);
    return model;
  }
  get<K extends string | number | symbol>(model: any, key: K) {
    return model[key];
  }
}
