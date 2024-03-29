/* eslint-disable @typescript-eslint/no-explicit-any */
import { ValueOf } from 'type-fest';
import { ModelAdapter } from './adapters';
import { Factory, Override } from './factory';

export function isAssociation<T>(
  value: T | Association<T> | unknown,
): value is Association<T> {
  return value instanceof Association;
}

export class Association<
  Model,
  Attributes = any,
  Params = any,
  ReturnType = any,
> {
  constructor(
    private readonly factory: Factory<Model, Attributes, Params, ReturnType>,
    private readonly adapter: ModelAdapter<Model, ReturnType>,
    private readonly additionalAttributes?: Override<Attributes, ReturnType>,
    private readonly key?: keyof ReturnType,
    private readonly transientParams?: Params,
    private cachedBuiltModel?: ReturnType,
    private cachedCreatedModel?: ReturnType,
    private readonly count?: number,
  ) {}

  public withCount(count: number): Association<Model, Attributes, Params> {
    return new Association(
      this.factory,
      this.adapter,
      this.additionalAttributes,
      this.key,
      this.transientParams,
      this.cachedBuiltModel,
      this.cachedCreatedModel,
      count,
    );
  }

  async build(): Promise<ReturnType | ValueOf<ReturnType>> {
    this.cachedBuiltModel =
      this.cachedBuiltModel ??
      (await this.factory.build(
        this.additionalAttributes,
        this.transientParams,
      ));

    if (this.key) {
      return this.adapter.get(this.cachedBuiltModel, this.key);
    }

    return this.cachedBuiltModel;
  }

  async buildMany(): Promise<ReturnType[] | ValueOf<ReturnType>[]> {
    return this.factory.buildMany(
      this.count ?? 1,
      this.additionalAttributes,
      this.transientParams,
    );
  }

  async create(): Promise<ReturnType | ValueOf<ReturnType>> {
    this.cachedCreatedModel =
      this.cachedCreatedModel ??
      (await this.factory.create(
        this.additionalAttributes,
        this.transientParams,
      ));

    if (this.key) {
      return this.adapter.get(this.cachedCreatedModel, this.key);
    }

    return this.cachedCreatedModel;
  }

  async createMany(): Promise<ReturnType[] | ValueOf<ReturnType>[]> {
    return this.factory.createMany(
      this.count ?? 1,
      this.additionalAttributes,
      this.transientParams,
    );
  }

  async resolve(method: 'build' | 'create') {
    if (method === 'build') {
      return this.count ? this.buildMany() : this.build();
    }

    return this.count ? this.createMany() : this.create();
  }

  get(
    key: keyof ReturnType,
  ): Association<Model, Attributes, Params, ReturnType> {
    return new Association(
      this.factory,
      this.adapter,
      this.additionalAttributes,
      key,
    );
  }
}
