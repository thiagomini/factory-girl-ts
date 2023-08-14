import { ValueOf } from 'type-fest';
import { ModelAdapter } from './adapters';
import { Factory } from './factory';
import { Dictionary } from './types';
export class Association<
  Model,
  Attributes = Dictionary,
  Params = Dictionary,
  ReturnType = Attributes,
> {
  constructor(
    private readonly factory: Factory<Model, Attributes, Params, ReturnType>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly adapter: ModelAdapter<any, ReturnType>,
    private readonly key?: keyof ReturnType,
  ) {}

  build(): ReturnType | ValueOf<ReturnType> {
    const built = this.factory.build();

    if (this.key) {
      return this.adapter.get(built, this.key);
    }

    return built;
  }

  async create(): Promise<ReturnType | ValueOf<ReturnType>> {
    const createdModel = await this.factory.create();

    if (this.key) {
      return this.adapter.get(createdModel, this.key);
    }

    return createdModel;
  }
}
