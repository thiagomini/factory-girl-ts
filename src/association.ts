import { ValueOf } from 'type-fest';
import { ModelAdapter } from './adapters';
import { Factory, Override } from './factory';
import { Dictionary } from './types';
export class Association<
  Model,
  Attributes = Dictionary,
  Params = Dictionary,
  ReturnType = Model,
> {
  constructor(
    private readonly factory: Factory<Model, Attributes, Params, ReturnType>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly adapter: ModelAdapter<any, ReturnType>,
    private readonly additionalAttributes?: Override<Attributes, ReturnType>,
    private readonly key?: keyof ReturnType,
    private readonly cachedModel?: Promise<ReturnType>,
  ) {}

  async build(): Promise<ReturnType | ValueOf<ReturnType>> {
    const built = await this.factory.build(this.additionalAttributes);

    if (this.key) {
      return this.adapter.get(built, this.key);
    }

    return built;
  }

  async create(): Promise<ReturnType | ValueOf<ReturnType>> {
    if (this.cachedModel) {
      const cachedModelAwaited = await this.cachedModel;
      return this.adapter.get(cachedModelAwaited, this.key as keyof ReturnType);
    }

    const createdModel = await this.factory.create(this.additionalAttributes);

    if (this.key) {
      return this.adapter.get(createdModel, this.key);
    }

    return createdModel;
  }

  get(
    key: keyof ReturnType,
  ): Association<Model, Attributes, Params, ReturnType> {
    const cachedModel: Promise<ReturnType> =
      this.cachedModel ?? (this.create() as Promise<ReturnType>);
    return new Association(
      this.factory,
      this.adapter,
      this.additionalAttributes,
      key,
      cachedModel,
    );
  }
}
