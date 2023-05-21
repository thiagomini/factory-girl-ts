import { plainToInstance } from 'class-transformer';
import { Class, PartialDeep } from 'type-fest';
import { DataSource, ObjectLiteral } from 'typeorm';
import { InstanceOrInterface } from '../types/instance-or-interface.type';
import { ModelAdapter } from './adapter.interface';

export class TypeOrmRepositoryAdapter<
  TClass extends Class<ReturnType>,
  ReturnType extends ObjectLiteral,
> implements ModelAdapter<TClass, ReturnType>
{
  constructor(private readonly dataSource: DataSource) {}

  build(
    ModelClass: TClass,
    props: PartialDeep<
      InstanceOrInterface<TClass>,
      { recurseIntoArrays: true }
    >,
  ): ReturnType {
    return plainToInstance(ModelClass, props);
  }

  async save(model: ReturnType, modelClass: TClass): Promise<ReturnType> {
    const repository = this.getRepositoryForModel(modelClass);
    return await repository.save(model);
  }

  get<K extends keyof ReturnType>(model: ReturnType, key: K): ReturnType[K] {
    return model[key];
  }

  private getRepositoryForModel(model: TClass) {
    return this.dataSource.getRepository(model);
  }
}
