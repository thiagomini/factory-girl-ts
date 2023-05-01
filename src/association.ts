import { ModelAdapter } from '@src/adapters/adapter.interface';
import { Dictionary } from '@src/types';
import { ValueOf } from 'type-fest';
import { Builder } from './interfaces';
export class Association<
  Attributes,
  Params = Dictionary,
  ReturnType = Attributes,
> {
  constructor(
    private readonly builder: Builder<Attributes, Params, ReturnType>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly adapter: ModelAdapter<any, ReturnType>,
    private readonly key?: keyof ReturnType,
  ) {}

  build(): ReturnType | ValueOf<ReturnType> {
    const built = this.builder.build();

    if (this.key) {
      return this.adapter.get(built, this.key);
    }

    return built;
  }
}
