/* eslint-disable @typescript-eslint/no-explicit-any */
import { ValueOf } from 'type-fest';
import { ModelAdapter } from './adapters';
import { Factory, Override } from './factory';
export class Association<
  Model,
  Attributes = any,
  Params = any,
  ReturnType = any,
> {
  constructor(
    private readonly factory: Factory<Model, Attributes, Params, ReturnType>,
    private readonly adapter: ModelAdapter<any, ReturnType>,
    private readonly additionalAttributes?: Override<Attributes, ReturnType>,
    private readonly key?: keyof ReturnType,
    private cachedBuiltModel?: ReturnType,
    private cachedCreatedModel?: ReturnType,
  ) {}

  async build(): Promise<ReturnType | ValueOf<ReturnType>> {
    this.cachedBuiltModel =
      this.cachedBuiltModel ??
      (await this.factory.build(this.additionalAttributes));

    if (this.key) {
      return this.adapter.get(this.cachedBuiltModel, this.key);
    }

    return this.cachedBuiltModel;
  }

  async create(): Promise<ReturnType | ValueOf<ReturnType>> {
    this.cachedCreatedModel =
      this.cachedCreatedModel ??
      (await this.factory.create(this.additionalAttributes));

    if (this.key) {
      return this.adapter.get(this.cachedCreatedModel, this.key);
    }

    return this.cachedCreatedModel;
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
